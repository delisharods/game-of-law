# ─── Standard Library ───────────────────────────────────────────────────────
import os
import json
import re
from datetime import datetime, timedelta

# ─── Third-Party ─────────────────────────────────────────────────────────────
import fitz  # PyMuPDF
from groq import Groq
from bson import ObjectId
from pydantic import BaseModel
from typing import List

# ─── FastAPI ──────────────────────────────────────────────────────────────────
from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, Request, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase

# ─── Local App Modules ────────────────────────────────────────────────────────
from app.mindmap import create_mindmap_from_text
from app.db import connect_to_mongo, close_mongo_connection, get_database
from app.models import (
    Content, ContentWithItems,
    UserCreate, Token, UserPublic,
    LogActivityRequest, UserActivity, UserActivityItem
)
from app.crud import create_content, get_content_with_items, get_user_by_email, create_user
from app.auth import authenticate_user, create_access_token, get_current_user
from app.generate import generate_questions_from_content, generate_scenarios_from_content
from app.config import settings

# ─── Groq AI Setup ────────────────────────────────────────────────────────────
api_key = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.1-8b-instant"  # Fast, free, generous limits

# ─── Pydantic Schemas ─────────────────────────────────────────────────────────
class TextInput(BaseModel):
    text: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]


# ─── Helper: safe Groq call ───────────────────────────────────────────────────
def safe_groq_call(prompt: str) -> str:
    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2048,
        )
        return response.choices[0].message.content
    except Exception as e:
        error_str = str(e).lower()
        if "quota" in error_str or "429" in error_str or "rate_limit" in error_str:
            raise HTTPException(
                status_code=429,
                detail="AI quota exceeded. Please wait a moment and try again."
            )
        raise HTTPException(status_code=500, detail=f"AI generation error: {str(e)}")


# ─── Constitutional PDF Loader (RAG context builder) ─────────────────────────
PDF_FOLDER = os.path.join(os.path.dirname(__file__), "app", "pdf")

def load_pdf_text(filename: str, max_chars: int = 8000) -> str:
    """Extract text from a specific PDF file."""
    filepath = os.path.join(PDF_FOLDER, filename)
    if not os.path.exists(filepath):
        return ""
    doc = fitz.open(filepath)
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + " "
    return " ".join(full_text.split())[:max_chars]

def search_pdfs_for_context(query: str, max_chars_per_pdf: int = 3000) -> str:
    """
    Search all constitutional PDFs and return relevant text chunks.
    Simple keyword-based retrieval from your 4 PDFs.
    """
    pdf_files = {
        "the_constitution_of_india.pdf": "Constitution of India",
        "Fundamental_rights.pdf": "Fundamental Rights",
        "DirectivePrinciples.pdf": "Directive Principles of State Policy",
        "the_nagaland_state_council_of_high.pdf": "Nagaland State Council",
    }

    query_lower = query.lower()
    context_parts = []

    # Keyword routing — pick most relevant PDFs first
    priority_pdfs = []

    if any(kw in query_lower for kw in ["fundamental right", "article 14", "article 19", "article 21", "equality", "freedom", "right to"]):
        priority_pdfs.append("Fundamental_rights.pdf")

    if any(kw in query_lower for kw in ["directive", "dpsp", "state policy", "article 36", "article 37", "article 38", "article 39"]):
        priority_pdfs.append("DirectivePrinciples.pdf")

    if any(kw in query_lower for kw in ["nagaland", "state council", "tribal"]):
        priority_pdfs.append("the_nagaland_state_council_of_high.pdf")

    # Always include the main constitution for general queries
    if not priority_pdfs or any(kw in query_lower for kw in ["constitution", "article", "amendment", "parliament", "president", "preamble"]):
        priority_pdfs.insert(0, "the_constitution_of_india.pdf")

    # If no specific match, search all PDFs
    if not priority_pdfs:
        priority_pdfs = list(pdf_files.keys())

    for pdf_file in priority_pdfs[:2]:  # Limit to top 2 PDFs for context window
        label = pdf_files.get(pdf_file, pdf_file)
        text = load_pdf_text(pdf_file, max_chars=max_chars_per_pdf)
        if text:
            context_parts.append(f"[Source: {label}]\n{text}")

    return "\n\n---\n\n".join(context_parts)


# ─── App Init ─────────────────────────────────────────────────────────────────
app = FastAPI(title="Constitution Learning Platform API")

# ─── CORS ─────────────────────────────────────────────────────────────────────
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5000",
    "*",  # Remove in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)


# ─── OPTIONS Middleware ───────────────────────────────────────────────────────
@app.middleware("http")
async def options_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        response.headers["Access-Control-Max-Age"] = "600"
        return response
    return await call_next(request)


# ─── Lifecycle ────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


# ─── Health / Root ────────────────────────────────────────────────────────────
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Constitution Learning Platform API"}


@app.get("/test-cors")
async def test_cors():
    return {"message": "CORS is working properly"}


# ─── Auth ─────────────────────────────────────────────────────────────────────
@app.options("/register")
async def register_options():
    return {}


@app.post("/register", response_model=UserPublic)
async def register(user: UserCreate):
    existing = await get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    created = await create_user(user)
    return UserPublic(**created)


@app.options("/token")
async def token_options():
    return {}


@app.post("/token", response_model=Token)
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token({"sub": user["email"]})

    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    activity_item = UserActivityItem(
        action="user_login",
        details={"email": user["email"], "login_time": datetime.utcnow().isoformat()},
        reward=0,
        ip_address=client_ip,
        user_agent=user_agent,
        login_method="password"
    )

    user_activity_doc = await db.user_activity.find_one({"user_id": user["id"]})

    if user_activity_doc:
        await db.user_activity.update_one(
            {"user_id": user["id"]},
            {
                "$push": {"activities": activity_item.dict()},
                "$set": {"last_activity_date": datetime.utcnow()}
            }
        )
    else:
        user_activity = UserActivity(
            user_id=user["id"],
            activities=[activity_item],
            total_xp_earned=0,
            last_activity_date=datetime.utcnow()
        )
        await db.user_activity.insert_one(user_activity.dict())

    await db.users.update_one(
        {"_id": ObjectId(user["id"])},
        {"$set": {"last_active_date": datetime.utcnow()}}
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=UserPublic)
async def read_users_me(current_user=Depends(get_current_user)):
    return UserPublic(**current_user)


# ─── Content ──────────────────────────────────────────────────────────────────
@app.post("/content", response_model=str)
async def add_content(content: Content, background_tasks: BackgroundTasks):
    content_id = await create_content(content)
    content.id = content_id
    background_tasks.add_task(generate_and_save_items, content)
    return content_id


async def generate_and_save_items(content: Content):
    from app.crud import create_question, create_scenario
    questions = await generate_questions_from_content(content)
    scenarios = await generate_scenarios_from_content(content)
    for question in questions:
        await create_question(question)
    for scenario in scenarios:
        await create_scenario(scenario)


@app.get("/content/{topic}", response_model=ContentWithItems)
async def get_content(topic: str):
    result = await get_content_with_items(topic)
    if not result:
        raise HTTPException(status_code=404, detail="Content not found")
    return result


@app.get("/quizzes/{topic}", response_model=ContentWithItems)
async def get_quizzes(topic: str):
    return await get_content(topic)


# ─── Activity & Stats ─────────────────────────────────────────────────────────
@app.post("/log-activity")
async def log_activity(
    request: LogActivityRequest,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        from app.rewards import REWARD_RULES

        if request.action not in REWARD_RULES:
            raise HTTPException(status_code=400, detail="Invalid action")

        reward = REWARD_RULES[request.action]

        activity_item = UserActivityItem(
            action=request.action,
            details=request.details,
            reward=reward,
            ip_address=request.ip_address,
            user_agent=request.user_agent,
            login_method=request.login_method,
            game_name=(request.game_name or (request.details or {}).get("game_name")),
            session_id=request.session_id
        )

        user_activity_doc = await db.user_activity.find_one({"user_id": current_user["id"]})

        if user_activity_doc:
            await db.user_activity.update_one(
                {"user_id": current_user["id"]},
                {
                    "$push": {"activities": activity_item.dict()},
                    "$inc": {"total_xp_earned": reward},
                    "$set": {"last_activity_date": datetime.utcnow()}
                }
            )
        else:
            user_activity = UserActivity(
                user_id=current_user["id"],
                activities=[activity_item],
                total_xp_earned=reward,
                last_activity_date=datetime.utcnow()
            )
            await db.user_activity.insert_one(user_activity.dict())

        user_id_obj = ObjectId(current_user["id"])
        await db.users.update_one(
            {"_id": user_id_obj},
            {
                "$inc": {"xp": reward},
                "$set": {"last_active_date": datetime.utcnow()}
            }
        )

        updated_user = await db.users.find_one({"_id": user_id_obj})
        new_level = (updated_user["xp"] // 100) + 1
        await db.users.update_one({"_id": user_id_obj}, {"$set": {"level": new_level}})

        return {"message": "Activity logged", "reward": reward, "new_xp": updated_user["xp"]}

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in log_activity: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/user-stats")
async def get_user_stats(
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_activity_doc = await db.user_activity.find_one({"user_id": current_user["id"]})
    recent_activities = []

    if user_activity_doc and "activities" in user_activity_doc:
        sorted_activities = sorted(
            user_activity_doc["activities"],
            key=lambda x: x.get("timestamp", datetime.min),
            reverse=True
        )
        recent_activities = sorted_activities[:20]

    streak_count = 0
    current_date = datetime.utcnow().date()
    check_date = current_date

    while True:
        start_of_day = datetime.combine(check_date, datetime.min.time())
        end_of_day = datetime.combine(check_date, datetime.max.time())
        has_activity = False
        if user_activity_doc and "activities" in user_activity_doc:
            for activity in user_activity_doc["activities"]:
                activity_time = activity.get("timestamp")
                if activity_time and isinstance(activity_time, datetime):
                    if start_of_day <= activity_time <= end_of_day:
                        has_activity = True
                        break
        if has_activity:
            streak_count += 1
            check_date -= timedelta(days=1)
        else:
            break

    performance_analysis = analyze_user_performance(recent_activities)
    recommendations = generate_personalized_recommendations(user, recent_activities, performance_analysis)

    return {
        "total_xp": user["xp"],
        "level": user["level"],
        "recent_activities": recent_activities,
        "streak_count": streak_count,
        "suggested_difficulty": performance_analysis["suggested_difficulty"],
        "performance_analysis": performance_analysis,
        "personalized_recommendations": recommendations
    }


def analyze_user_performance(activities):
    if not activities:
        return {
            "suggested_difficulty": "easy",
            "accuracy_rate": 0,
            "activity_frequency": "low",
            "strengths": [],
            "weaknesses": ["No recent activity"],
            "engagement_level": "low"
        }

    correct_answers = sum(1 for act in activities if act.get("action") in ["quiz_correct", "spin_wheel_correct"])
    total_answers = sum(1 for act in activities if act.get("action") in ["quiz_correct", "quiz_attempted", "spin_wheel_correct", "spin_wheel_attempted"])
    accuracy_rate = (correct_answers / total_answers * 100) if total_answers > 0 else 0

    game_activities = sum(1 for act in activities if act.get("action") == "played_game")
    quiz_activities = sum(1 for act in activities if act.get("action") in ["quiz_correct", "quiz_attempted"])
    lesson_activities = sum(1 for act in activities if act.get("action") in ["completed_lesson", "completed_module"])
    spin_activities = sum(1 for act in activities if act.get("action") in ["spin_wheel_correct", "spin_wheel_attempted"])

    recent_days = 7
    activity_frequency = "high" if len(activities) >= recent_days else "medium" if len(activities) >= recent_days // 2 else "low"

    engagement_score = len(activities) + game_activities * 2 + lesson_activities * 3
    engagement_level = "high" if engagement_score >= 15 else "medium" if engagement_score >= 8 else "low"

    strengths, weaknesses = [], []

    if accuracy_rate >= 80:
        strengths.append("Strong quiz performance")
    elif accuracy_rate < 50:
        weaknesses.append("Needs improvement in quiz accuracy")

    if game_activities >= 3:
        strengths.append("Engaged with games")
    elif game_activities == 0:
        weaknesses.append("Hasn't tried games yet")

    if lesson_activities >= 2:
        strengths.append("Good progress in learning modules")
    elif lesson_activities == 0:
        weaknesses.append("Hasn't completed learning modules")

    if spin_activities >= 5:
        strengths.append("Frequent spin wheel usage")
    elif spin_activities == 0:
        weaknesses.append("Hasn't tried spin wheel")

    if accuracy_rate >= 80 and engagement_level == "high":
        suggested_difficulty = "hard"
    elif accuracy_rate >= 60 or engagement_level == "medium":
        suggested_difficulty = "medium"
    else:
        suggested_difficulty = "easy"

    return {
        "suggested_difficulty": suggested_difficulty,
        "accuracy_rate": round(accuracy_rate, 1),
        "activity_frequency": activity_frequency,
        "engagement_level": engagement_level,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "activity_breakdown": {
            "games_played": game_activities,
            "quiz_questions": quiz_activities,
            "lessons_completed": lesson_activities,
            "spin_wheel_questions": spin_activities
        }
    }


def generate_personalized_recommendations(user, activities, performance_analysis):
    recommendations = []

    if performance_analysis["accuracy_rate"] < 60:
        recommendations.append({
            "type": "improvement",
            "title": "Focus on Quiz Accuracy",
            "description": "Your quiz accuracy is below 60%. Try reviewing the learning modules before taking quizzes.",
            "action": "complete_learning_module",
            "priority": "high"
        })

    if performance_analysis["engagement_level"] == "low":
        recommendations.append({
            "type": "engagement",
            "title": "Increase Daily Activity",
            "description": "Try to be active every day to build a learning streak and earn bonus XP.",
            "action": "daily_login",
            "priority": "medium"
        })

    if not any(act.get("action") == "played_game" for act in activities[-5:]):
        recommendations.append({
            "type": "exploration",
            "title": "Try Interactive Games",
            "description": "Games are a fun way to learn! Try the card matching or situation-based games.",
            "action": "play_game",
            "priority": "medium"
        })

    if not any(act.get("action") in ["spin_wheel_correct", "spin_wheel_attempted"] for act in activities[-3:]):
        recommendations.append({
            "type": "exploration",
            "title": "Spin the Wheel for Quick Learning",
            "description": "The spin wheel offers quick questions and XP rewards. Give it a try!",
            "action": "try_spin_wheel",
            "priority": "low"
        })

    if performance_analysis["activity_frequency"] == "low":
        recommendations.append({
            "type": "motivation",
            "title": "Build Learning Habits",
            "description": "Set aside 10-15 minutes daily for learning to improve your knowledge and earn rewards.",
            "action": "increase_frequency",
            "priority": "medium"
        })

    user_level = user.get("level", 1)
    if user_level <= 2:
        recommendations.append({
            "type": "progression",
            "title": "Start with Basic Modules",
            "description": "Begin with the fundamental learning modules to build a strong foundation.",
            "action": "start_basic_modules",
            "priority": "high"
        })
    elif user_level <= 5:
        recommendations.append({
            "type": "progression",
            "title": "Challenge Yourself",
            "description": "You're ready for more advanced content. Try medium difficulty quizzes and games.",
            "action": "try_medium_content",
            "priority": "medium"
        })
    else:
        recommendations.append({
            "type": "progression",
            "title": "Master Advanced Topics",
            "description": "Take on hard difficulty challenges and help others learn by sharing your knowledge.",
            "action": "advanced_challenges",
            "priority": "low"
        })

    priority_order = {"high": 0, "medium": 1, "low": 2}
    recommendations.sort(key=lambda x: priority_order.get(x["priority"], 3))
    return recommendations[:5]


# ─── AI Routes ────────────────────────────────────────────────────────────────
@app.post("/ai/mindmap")
async def ai_mindmap(data: TextInput):
    prompt = f"""
    Create a hierarchical mind map of this topic.
    Return short points only.

    {data.text}
    """
    result = safe_groq_call(prompt)
    return {"mindmap": result}


@app.post("/ai/summary")
async def ai_summary(data: TextInput):
    prompt = f"""
    Summarize this for students in simple language:
    {data.text}
    """
    result = safe_groq_call(prompt)
    return {"summary": result}


@app.post("/ai/pdf-mindmap")
async def pdf_mindmap(file: UploadFile = File(...)):
    contents = await file.read()
    doc = fitz.open(stream=contents, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + " "
    full_text = " ".join(full_text.split())[:4000]

    prompt = f"""
You are a mindmap generator. Given the following text from a legal/educational PDF, 
create a hierarchical mindmap as a JSON object.

STRICT FORMAT - return ONLY valid JSON, no markdown, no explanation:
{{
  "id": "root",
  "topic": "Main Topic Title",
  "children": [
    {{
      "id": "node0",
      "topic": "Key Concept 1",
      "children": [
        {{"id": "node0_0", "topic": "Sub point", "children": []}},
        {{"id": "node0_1", "topic": "Sub point", "children": []}}
      ]
    }},
    {{
      "id": "node1",
      "topic": "Key Concept 2",
      "children": [
        {{"id": "node1_0", "topic": "Sub point", "children": []}}
      ]
    }}
  ]
}}

Rules:
- Maximum 6 main children
- Maximum 3 sub-children per node
- Keep topics short (under 60 characters)
- Extract the most important concepts
- Return ONLY the JSON object, nothing else

Text to analyze:
{full_text}
"""

    raw = safe_groq_call(prompt)
    raw = re.sub(r"```json|```", "", raw.strip()).strip()

    try:
        mindmap_data = json.loads(raw)
    except json.JSONDecodeError:
        sentences = [s.strip() for s in full_text.split(".") if len(s.strip()) > 20][:8]
        mindmap_data = {
            "id": "root",
            "topic": file.filename.replace(".pdf", "").replace("_", " ").title(),
            "children": [
                {"id": f"node{i}", "topic": s[:60], "children": []}
                for i, s in enumerate(sentences)
            ]
        }

    return {"mindmap": mindmap_data, "filename": file.filename}


@app.post("/ai/pdf-quiz")
async def pdf_quiz(file: UploadFile = File(...)):
    contents = await file.read()
    doc = fitz.open(stream=contents, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + " "
    full_text = " ".join(full_text.split())[:4000]

    prompt = f"""
You are a quiz generator for law/civics students. Generate exactly 5 multiple choice questions 
based on the following text.

STRICT FORMAT - return ONLY valid JSON array, no markdown, no explanation:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this is correct."
  }}
]

Rules:
- correct is the INDEX (0-3) of the correct option
- Make questions clear and educational
- Cover different parts of the text
- Difficulty: medium
- Return ONLY the JSON array, nothing else

Text to analyze:
{full_text}
"""

    raw = safe_groq_call(prompt)
    raw = re.sub(r"```json|```", "", raw.strip()).strip()

    try:
        questions = json.loads(raw)
    except json.JSONDecodeError:
        questions = [
            {
                "question": "What is the main subject of this document?",
                "options": ["Constitutional Law", "Criminal Law", "Civil Law", "Tax Law"],
                "correct": 0,
                "explanation": "Based on the document content."
            }
        ]

    return {"questions": questions, "filename": file.filename}


@app.post("/ai/pdf-summary")
async def pdf_summary(file: UploadFile = File(...)):
    contents = await file.read()
    doc = fitz.open(stream=contents, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + " "
    full_text = " ".join(full_text.split())[:4000]

    prompt = f"""
You are an educational assistant. Summarize this legal/constitutional text for students.
Return ONLY valid JSON, no markdown:
{{
  "title": "Document title",
  "overview": "2-3 sentence overview",
  "key_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "important_terms": [{{"term": "Term", "definition": "Simple definition"}}],
  "conclusion": "1-2 sentence takeaway"
}}
Text: {full_text}
"""
    raw = safe_groq_call(prompt)
    raw = re.sub(r"```json|```", "", raw.strip()).strip()
    try:
        summary_data = json.loads(raw)
    except json.JSONDecodeError:
        summary_data = {"title": file.filename, "overview": raw[:300], "key_points": [], "important_terms": [], "conclusion": ""}
    return {"summary": summary_data, "filename": file.filename}

# ── ADD THIS ENDPOINT TO YOUR main.py (after /ai/pdf-summary) ────────────────

@app.post("/ai/pdf-flashcards")
async def pdf_flashcards(file: UploadFile = File(...)):
    """
    Upload a PDF → extract text → Groq generates flashcards (term + definition pairs).
    """
    contents = await file.read()
    doc = fitz.open(stream=contents, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + " "
    full_text = " ".join(full_text.split())[:4000]

    prompt = f"""
You are a flashcard generator for law/civics students. Generate exactly 10 flashcards
based on the following legal/constitutional text.

STRICT FORMAT - return ONLY valid JSON array, no markdown, no explanation:
[
  {{
    "term": "Short term or concept (under 6 words)",
    "definition": "Clear, simple explanation in 1-2 sentences that a student can understand."
  }}
]

Rules:
- Pick the 10 most important legal terms, articles, or concepts from the text
- Keep "term" short and memorable (e.g. "Article 21", "Right to Equality", "Preamble")
- Keep "definition" simple and educational — avoid complex legal jargon
- Cover a variety of topics from the text
- Return ONLY the JSON array, nothing else

Text to analyze:
{full_text}
"""

    raw = safe_groq_call(prompt)
    raw = re.sub(r"```json|```", "", raw.strip()).strip()

    try:
        flashcards = json.loads(raw)
    except json.JSONDecodeError:
        # Fallback flashcards
        flashcards = [
            {"term": "Constitution", "definition": "The supreme law of India that defines the framework of the government and fundamental rights of citizens."},
            {"term": "Fundamental Rights", "definition": "Basic rights guaranteed to every citizen of India under Part III (Articles 12-35) of the Constitution."},
        ]

    return {"flashcards": flashcards, "filename": file.filename}

# ─── Law Chat (Nyay Mitra) ────────────────────────────────────────────────────
LAW_SYSTEM_PROMPT = """You are Nyay Mitra, an expert Indian Law Assistant for a project called "Game of Law". 
You have deep knowledge of:
- Indian Penal Code (IPC) and its sections
- Constitution of India and Fundamental Rights (Articles 12-35)
- Code of Criminal Procedure (CrPC) and Civil Procedure Code (CPC)
- Indian Evidence Act
- Consumer Protection Act, RTI Act, POCSO, IT Act, and other major Indian statutes
- Supreme Court and High Court landmark judgments
- Legal procedures, bail, FIR, PIL, writ petitions, etc.

Your style:
- Be authoritative yet accessible, like a wise senior advocate explaining to a student
- Use precise legal terminology but always explain it simply
- Reference relevant IPC sections, Articles, Acts, and case laws where applicable
- Use **bold** for key legal terms and section numbers
- Keep answers concise since this is a compact chat widget
- Always end with a short disclaimer: this is general legal info, not professional advice
- Be specific to Indian law context"""

@app.post("/ai/law-chat")
async def law_chat(data: ChatRequest):
    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": LAW_SYSTEM_PROMPT},
                *[{"role": m.role, "content": m.content} for m in data.messages]
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        reply = response.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        error_str = str(e).lower()
        if "quota" in error_str or "429" in error_str or "rate_limit" in error_str:
            raise HTTPException(
                status_code=429,
                detail="AI quota exceeded. Please wait a moment and try again."
            )
        raise HTTPException(status_code=500, detail=f"Law chat error: {str(e)}")


# ─── Constitution Chat (Samvidhan Mitra) ─────────────────────────────────────
CONSTITUTION_SYSTEM_PROMPT = """You are Samvidhan Mitra, an expert Constitutional Learning Assistant 
for the "Game of Law" educational platform. You teach students about the Indian Constitution.

Your knowledge covers:
- All Articles of the Indian Constitution (1-395+)
- All 12 Schedules of the Constitution
- Fundamental Rights (Part III, Articles 12-35)
- Directive Principles of State Policy (Part IV, Articles 36-51)
- Fundamental Duties (Article 51A)
- Constitutional Amendments (1st to 106th)
- Preamble and its significance
- Nagaland special provisions and state-specific constitutional matters
- Landmark Supreme Court cases on constitutional law

Your teaching style:
- Explain like a friendly professor to college students
- Always cite the exact **Article number** or **Schedule** when relevant
- Break down complex constitutional concepts into simple language
- Use examples from everyday life to explain abstract concepts
- When explaining rights, also explain the reasonable restrictions
- Use **bold** for Article numbers and key constitutional terms
- If asked about a specific article, explain its scope, exceptions, and relevant cases
- Keep answers educational and structured

Important: Base your answers on the constitutional documents provided in context.
Always end complex answers with: "📖 Source: Constitution of India" """

@app.post("/ai/constitution-chat")
async def constitution_chat(data: ChatRequest):
    """
    Samvidhan Mitra — Constitutional Learning Chatbot.
    Uses your existing PDFs (Fundamental Rights, Directive Principles,
    Constitution of India, Nagaland) as context for grounded answers.
    """
    try:
        # Get the latest user message for context retrieval
        latest_question = ""
        for msg in reversed(data.messages):
            if msg.role == "user":
                latest_question = msg.content
                break

        # Load relevant PDF context based on the question
        pdf_context = search_pdfs_for_context(latest_question)

        # Build system prompt with PDF context injected
        system_with_context = CONSTITUTION_SYSTEM_PROMPT
        if pdf_context:
            system_with_context += f"""

--- CONSTITUTIONAL DOCUMENTS CONTEXT ---
Use the following extracted text from our constitutional PDFs to answer accurately:

{pdf_context[:6000]}
--- END CONTEXT ---"""

        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_with_context},
                *[{"role": m.role, "content": m.content} for m in data.messages]
            ],
            temperature=0.5,   # Lower temp for more factual constitutional answers
            max_tokens=1024,
        )
        reply = response.choices[0].message.content
        return {"reply": reply}

    except Exception as e:
        error_str = str(e).lower()
        if "quota" in error_str or "429" in error_str or "rate_limit" in error_str:
            raise HTTPException(
                status_code=429,
                detail="AI quota exceeded. Please wait a moment and try again."
            )
        raise HTTPException(status_code=500, detail=f"Constitution chat error: {str(e)}")


@app.get("/ai/constitution-topics")
async def get_constitution_topics():
    """
    Returns a list of suggested topics/questions for the constitutional chatbot UI.
    """
    return {
        "topics": [
            {"category": "Fundamental Rights", "questions": [
                "What are the 6 Fundamental Rights?",
                "Explain Article 21 - Right to Life",
                "What is Article 19 freedom of speech?",
                "What are reasonable restrictions on Fundamental Rights?"
            ]},
            {"category": "Directive Principles", "questions": [
                "What are Directive Principles of State Policy?",
                "Difference between Fundamental Rights and DPSP",
                "Which articles cover Directive Principles?",
                "Are Directive Principles enforceable in court?"
            ]},
            {"category": "Constitutional Basics", "questions": [
                "What does the Preamble say?",
                "How many articles does the Constitution have?",
                "What is a Constitutional Amendment?",
                "Explain the federal structure of India"
            ]},
            {"category": "Special Provisions", "questions": [
                "What are special provisions for Nagaland?",
                "What is Article 370?",
                "Explain Fundamental Duties under Article 51A"
            ]}
        ]
    }