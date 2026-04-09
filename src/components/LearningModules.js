import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, BookOpen } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { contentModules } from "../data/contentData";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const MODULE_PDF_MAP = {
  "constitution-foundation":          "the_constitution_of_india.pdf",
  "fundamental-rights-detailed":      "Fundamental_rights.pdf",
  "dpsp-and-duties":                  "DirectivePrinciples.pdf",
  "government-structure":             "law_document.pdf",       // ← FIXED
  "nagaland-education-act":           "the_nagaland_state_council_of_higher_education_act_2014.pdf",
  "law-and-justice":                  "law_document.pdf",
  "constitutional-interpretation":    "the_constitution_of_india.pdf",
  "fundamental-rights-jurisprudence": "Fundamental_rights.pdf",
  "constitutional-framework":         "the_constitution_of_india.pdf",
  "contemporary-issues":              "law_document.pdf",
  "my-constitution-book":             "the_constitution_of_india.pdf",
  "my-rights-as-child":               "Fundamental_rights.pdf",
  "our-country-promises":             "the_constitution_of_india.pdf",
};

const getPdfPath = (moduleId) =>
  `/pdf/${MODULE_PDF_MAP[moduleId] || "law_document.pdf"}`;

export const getPdfForModule = (moduleId) => getPdfPath(moduleId);

const COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#20C997","#F06595"];

// ── MindMap Node ────────────────────────────────────────────────────
function MindNode({ node, depth = 0, index = 0 }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const color = depth === 0 ? "#7c3a00" : COLORS[index % COLORS.length];
  const isRoot = depth === 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: depth === 0 ? "center" : "flex-start" }}>
      <div onClick={() => hasChildren && setOpen(!open)} style={{
        background: isRoot ? "linear-gradient(135deg,#7c3a00,#c05e00)" : color,
        color: isRoot ? "#fff" : depth === 1 ? "#fff" : "#1a1a2e",
        padding: isRoot ? "12px 24px" : depth === 1 ? "8px 18px" : "6px 12px",
        borderRadius: isRoot ? "12px" : "999px",
        fontWeight: isRoot ? 700 : depth === 1 ? 600 : 500,
        fontSize: isRoot ? "1rem" : depth === 1 ? "0.85rem" : "0.75rem",
        cursor: hasChildren ? "pointer" : "default",
        boxShadow: `0 3px 10px ${color}44`,
        userSelect: "none", maxWidth: "220px", textAlign: "center", lineHeight: 1.35,
        transition: "transform 0.15s", border: isRoot ? "2px solid #ff922b" : "none",
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {hasChildren && <span style={{ marginRight: 4, opacity: 0.7, fontSize: "0.7em" }}>{open ? "▾" : "▸"}</span>}
        {node.topic}
      </div>
      {hasChildren && open && (
        <div style={{
          display: "flex", flexDirection: depth === 0 ? "row" : "column",
          flexWrap: depth === 0 ? "wrap" : "nowrap",
          gap: depth === 0 ? "12px" : "6px",
          marginTop: depth === 0 ? "18px" : "0",
          marginLeft: depth === 0 ? "0" : "20px",
          paddingLeft: depth >= 1 ? "14px" : "0",
          borderLeft: depth >= 1 ? `2px dashed ${color}66` : "none",
          justifyContent: depth === 0 ? "center" : "flex-start",
        }}>
          {node.children.map((child, i) => (
            <MindNode key={child.id} node={child} depth={depth + 1} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Summary View ────────────────────────────────────────────────────
function SummaryView({ summary }) {
  if (!summary) return null;
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#7c3a00,#c05e00)", borderRadius: 14, padding: "22px 26px", color: "white", marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800 }}>{summary.title}</h2>
        <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.7, fontSize: "0.92rem" }}>{summary.overview}</p>
      </div>
      <div style={{ background: "white", borderRadius: 14, padding: "22px 26px", marginBottom: 14, border: "2px solid #e8d5b8" }}>
        <h3 style={{ margin: "0 0 12px", color: "#7c3a00", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>📌 Key Points</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {(summary.key_points || []).map((point, i) => (
            <li key={i} style={{ marginBottom: 9, lineHeight: 1.65, color: "#444", fontSize: "0.9rem" }}>{point}</li>
          ))}
        </ul>
      </div>
      {summary.important_terms?.length > 0 && (
        <div style={{ background: "white", borderRadius: 14, padding: "22px 26px", marginBottom: 14, border: "2px solid #e8d5b8" }}>
          <h3 style={{ margin: "0 0 12px", color: "#7c3a00", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>📖 Important Terms</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {summary.important_terms.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ background: "#fff3e0", color: "#7c3a00", fontWeight: 700, fontSize: "0.78rem", padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap", marginTop: 2 }}>{item.term}</span>
                <span style={{ color: "#555", fontSize: "0.87rem", lineHeight: 1.55 }}>{item.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {summary.conclusion && (
        <div style={{ background: "#fff8f0", borderRadius: 14, padding: "18px 26px", border: "2px solid #ffd8a8" }}>
          <h3 style={{ margin: "0 0 8px", color: "#7c3a00", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>✅ Takeaway</h3>
          <p style={{ margin: 0, color: "#555", lineHeight: 1.65, fontSize: "0.9rem" }}>{summary.conclusion}</p>
        </div>
      )}
    </div>
  );
}

// ── Quiz View ───────────────────────────────────────────────────────
function QuizView({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const score = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0;
  return (
    <div>
      {submitted && (
        <div style={{
          background: score >= 3 ? "#d3f9d8" : "#fff3cd",
          border: `2px solid ${score >= 3 ? "#6BCB77" : "#FFD93D"}`,
          borderRadius: "10px", padding: "14px 20px", marginBottom: "20px",
          textAlign: "center", fontWeight: 700,
          color: score >= 3 ? "#2b8a3e" : "#856404",
        }}>
          {score >= 3 ? "🎉" : "📚"} Score: {score}/{questions.length}
          {score >= 3 ? " — Excellent!" : " — Keep studying!"}
        </div>
      )}
      {questions.map((q, qi) => (
        <div key={qi} style={{
          background: "#fffdf8", borderRadius: "12px", padding: "16px 20px", marginBottom: "12px",
          border: submitted ? answers[qi] === q.correct ? "2px solid #6BCB77" : "2px solid #FF6B6B" : "2px solid #e8dcc8",
        }}>
          <p style={{ fontWeight: 700, marginBottom: "10px", color: "#3d1f00", fontSize: "0.92rem" }}>
            Q{qi + 1}. {q.question}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {q.options.map((opt, oi) => {
              let bg = "white", border = "1.5px solid #e0d4c0", color = "#444";
              if (submitted) {
                if (oi === q.correct) { bg = "#d3f9d8"; border = "1.5px solid #6BCB77"; color = "#2b8a3e"; }
                else if (oi === answers[qi]) { bg = "#ffe3e3"; border = "1.5px solid #FF6B6B"; color = "#c92a2a"; }
              } else if (answers[qi] === oi) {
                bg = "#fff3e0"; border = "1.5px solid #c05e00"; color = "#7c3a00";
              }
              return (
                <button key={oi} disabled={submitted}
                  onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                  style={{ background: bg, border, color, padding: "9px 14px", borderRadius: "8px", textAlign: "left", cursor: submitted ? "default" : "pointer", fontSize: "0.85rem", fontWeight: 500 }}>
                  {["A","B","C","D"][oi]}. {opt}
                </button>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <p style={{ marginTop: "8px", fontSize: "0.8rem", color: "#888", fontStyle: "italic" }}>💡 {q.explanation}</p>
          )}
        </div>
      ))}
      {!submitted && (
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <button onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < questions.length}
            style={{
              background: Object.keys(answers).length < questions.length ? "#ccc" : "#7c3a00",
              color: "white", border: "none", padding: "11px 28px",
              borderRadius: "999px", fontWeight: 700, fontSize: "0.9rem",
              cursor: Object.keys(answers).length < questions.length ? "not-allowed" : "pointer",
            }}>
            Submit Answers
          </button>
        </div>
      )}
    </div>
  );
}

// ── Action Button ───────────────────────────────────────────────────
function ActionBtn({ onClick, isLoading, children }) {
  return (
    <button onClick={onClick} disabled={!!isLoading}
      style={{
        background: isLoading ? "#aaa" : "#7c3a00",
        color: "white", border: "none", padding: "10px 22px",
        borderRadius: "999px", fontWeight: 700, fontSize: "0.88rem",
        cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6,
      }}>
      {isLoading
        ? <><span style={{ width: 14, height: 14, border: "2px solid #fff5", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Generating...</>
        : children}
    </button>
  );
}

// ── Module Detail ───────────────────────────────────────────────────
function ModuleDetail({ module, navigate }) {
  const [activeTab, setActiveTab] = useState("pdf");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [mindmap, setMindmap] = useState(null);
  const [questions, setQuestions] = useState(null);

  const pdfPath = getPdfPath(module.id);
  const pdfFile = MODULE_PDF_MAP[module.id] || "law_document.pdf";

  const generateFromPdf = async (type) => {
    setLoading(type); setError("");
    try {
      const response = await fetch(pdfPath);
      if (!response.ok) throw new Error("PDF not found");
      const blob = await response.blob();
      const file = new File([blob], pdfFile, { type: "application/pdf" });
      const formData = new FormData();
      formData.append("file", file);

      const endpoints = {
        summary: "http://127.0.0.1:8000/ai/pdf-summary",
        mindmap: "http://127.0.0.1:8000/ai/pdf-mindmap",
        quiz:    "http://127.0.0.1:8000/ai/pdf-quiz",
      };

      const res = await axios.post(endpoints[type], formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (type === "summary") { setSummary(res.data.summary); setActiveTab("summary"); }
      if (type === "mindmap") { setMindmap(res.data.mindmap); setActiveTab("mindmap"); }
      if (type === "quiz")    { setQuestions(res.data.questions); setActiveTab("quiz"); }
    } catch (e) {
      setError(e.message === "PDF not found"
        ? `PDF not found at ${pdfPath}. Check public/pdf/ folder.`
        : "Backend error. Run: cd backend && uvicorn app.main:app --reload");
    } finally { setLoading(""); }
  };

  const availableTabs = [
    { key: "pdf",     label: "📄 PDF" },
    ...(summary   ? [{ key: "summary", label: "📋 Summary" }] : []),
    ...(mindmap   ? [{ key: "mindmap", label: "🗺️ Mind Map" }] : []),
    ...(questions ? [{ key: "quiz",    label: "✅ Quiz" }]     : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-6">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="max-w-4xl mx-auto">

        <button onClick={() => navigate("/modules")}
          className="mb-6 text-amber-700 font-semibold flex items-center gap-2 hover:underline">
          ← Back to Modules
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
          <p className="text-amber-100">{module.description}</p>
        </motion.div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <ActionBtn onClick={() => generateFromPdf("summary")} isLoading={loading === "summary"}>
            📋 Generate Summary
          </ActionBtn>
          <ActionBtn onClick={() => generateFromPdf("mindmap")} isLoading={loading === "mindmap"}>
            🧠 Generate Mind Map
          </ActionBtn>
          <ActionBtn onClick={() => generateFromPdf("quiz")} isLoading={loading === "quiz"}>
            ✅ Generate Quiz
          </ActionBtn>
        </div>

        {error && (
          <div style={{ background: "#ffe3e3", border: "1.5px solid #FF6B6B", borderRadius: 10, padding: "12px 16px", color: "#c92a2a", fontSize: "0.88rem", marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: "2px solid #e8d5b8" }}>
          {availableTabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                padding: "9px 18px", border: "none", borderRadius: "8px 8px 0 0",
                background: activeTab === t.key ? "#7c3a00" : "transparent",
                color: activeTab === t.key ? "white" : "#7c3a00",
                fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 44, height: 44, border: "4px solid #e8d5b8", borderTop: "4px solid #7c3a00", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ color: "#999" }}>
              {loading === "summary" ? "Generating summary..." : loading === "mindmap" ? "Generating mind map..." : "Generating quiz..."}
            </p>
          </div>
        )}

        {/* PDF */}
        {!loading && activeTab === "pdf" && (
          <iframe src={pdfPath} width="100%" height="650px" title="Module PDF"
            style={{ borderRadius: 12, border: "2px solid #e8d5b8", display: "block" }} />
        )}

        {/* Summary */}
        {!loading && activeTab === "summary" && summary && <SummaryView summary={summary} />}

        {/* Mindmap */}
        {!loading && activeTab === "mindmap" && mindmap && (
          <div style={{ background: "white", borderRadius: 14, padding: 32, border: "2px solid #e8d5b8", overflowX: "auto" }}>
            <MindNode node={mindmap} depth={0} index={0} />
          </div>
        )}

        {/* Quiz */}
        {!loading && activeTab === "quiz" && questions && (
          <div>
            <h2 style={{ color: "#7c3a00" }}>✅ Quiz — {module.title}</h2>
            <QuizView questions={questions} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────
const LearningModules = () => {
  const { user, gameProgress } = useUser();
  const navigate = useNavigate();
  const { moduleId } = useParams();

  const ageGroup = user.ageGroup || "teen";
  const modules = contentModules[ageGroup]?.modules || [];

  const getModuleProgress = (id) =>
    gameProgress?.modules?.[id] || { completed: false, progress: 0, completedLessons: [] };

  const isModuleUnlocked = (module) => {
    if (module.level === 1) return true;
    const prevLevel = modules.filter((m) => m.level === module.level - 1);
    return prevLevel.every((m) => getModuleProgress(m.id).completed);
  };

  // ── MODULE DETAIL VIEW ─────────────────────────────────────────────
  if (moduleId) {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-stone-700 mb-4">Module not found</h2>
            <button onClick={() => navigate("/modules")}
              className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold">
              ← Back to Modules
            </button>
          </div>
        </div>
      );
    }
    return <ModuleDetail module={module} navigate={navigate} />;
  }

  // ── MODULE LIST VIEW ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-amber-800 mb-10">Learning Modules</h1>
        {[1, 2, 3].map((level) => {
          const levelModules = modules.filter((m) => m.level === level);
          if (!levelModules.length) return null;
          return (
            <div key={level} className="mb-12">
              <h2 className="text-2xl font-bold text-stone-700 mb-6">Level {level}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levelModules.map((module) => {
                  const unlocked = isModuleUnlocked(module);
                  const progress = getModuleProgress(module.id);
                  return (
                    <motion.div key={module.id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all ${
                        unlocked ? "border-stone-200 hover:border-amber-400 cursor-pointer hover:shadow-xl" : "border-stone-100 opacity-60"
                      }`}
                      onClick={() => unlocked && navigate(`/modules/${module.id}`)}>
                      <div className="flex items-start justify-between mb-3">
                        <BookOpen className="w-8 h-8 text-amber-600" />
                        {!unlocked && <Lock className="w-5 h-5 text-stone-400" />}
                      </div>
                      <h3 className="text-xl font-bold text-stone-800 mb-2">{module.title}</h3>
                      <p className="text-stone-500 text-sm mb-4">{module.description}</p>
                      <div className="flex justify-between text-xs text-stone-500 mb-3">
                        <span>{module.lessons.length} lessons</span>
                        <span>{Math.round(progress.progress || 0)}% done</span>
                      </div>
                      <div className="bg-stone-100 rounded-full h-1.5 mb-4">
                        <div className="bg-amber-500 rounded-full h-1.5 transition-all"
                          style={{ width: `${progress.progress || 0}%` }} />
                      </div>
                      {unlocked
                        ? <div className="text-center text-amber-700 font-semibold text-sm">{progress.progress > 0 ? "Continue →" : "Start →"}</div>
                        : <div className="text-center text-stone-400 text-sm">Complete Level {level - 1} to unlock</div>
                      }
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningModules;