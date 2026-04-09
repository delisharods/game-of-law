import { useState, useRef } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";
const COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#20C997","#F06595"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .dpl-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #fdf8f0;
    padding: 32px 24px;
  }

  /* ── Upload Zone ── */
  .upload-zone {
    border: 2.5px dashed #c8a87a;
    border-radius: 20px;
    padding: 52px 32px;
    text-align: center;
    background: white;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    max-width: 620px;
    margin: 0 auto 32px;
  }
  .upload-zone:hover, .upload-zone.drag-over {
    border-color: #7c3a00;
    background: #fff8f0;
    transform: scale(1.01);
    box-shadow: 0 8px 32px rgba(124,58,0,0.1);
  }
  .upload-icon { font-size: 52px; margin-bottom: 12px; }
  .upload-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #7c3a00;
    margin: 0 0 8px;
  }
  .upload-sub { color: #999; font-size: 0.9rem; margin: 0 0 20px; }
  .upload-btn {
    background: linear-gradient(135deg, #7c3a00, #c05e00);
    color: white;
    border: none;
    padding: 11px 28px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(124,58,0,0.3);
  }
  .upload-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(124,58,0,0.4); }

  /* ── File Pill ── */
  .file-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #fff3e0;
    border: 2px solid #ffb347;
    border-radius: 999px;
    padding: 8px 18px;
    font-size: 0.88rem;
    font-weight: 600;
    color: #7c3a00;
    margin: 0 auto 24px;
  }
  .file-pill-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: #c05e00;
    font-size: 1rem;
    line-height: 1;
    padding: 0;
  }

  /* ── Generate Buttons ── */
  .gen-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin-bottom: 28px;
  }
  .gen-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 22px;
    border-radius: 999px;
    border: 2.5px solid #7c3a00;
    background: white;
    color: #7c3a00;
    font-weight: 700;
    font-size: 0.88rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .gen-btn:hover:not(:disabled) {
    background: #7c3a00;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(124,58,0,0.25);
  }
  .gen-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .gen-btn.active { background: #7c3a00; color: white; }

  /* ── Tabs ── */
  .tabs {
    display: flex;
    gap: 4px;
    border-bottom: 2px solid #e8d5b8;
    margin-bottom: 28px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
  .tab {
    padding: 10px 20px;
    border: none;
    background: none;
    color: #999;
    font-weight: 600;
    font-size: 0.88rem;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .tab:hover { color: #7c3a00; }
  .tab.active { color: #7c3a00; border-bottom-color: #7c3a00; }
  .tab.has-data::after { content: " ✓"; color: #40c057; font-size: 0.75rem; }

  /* ── Spinner ── */
  .spinner-wrap { text-align: center; padding: 60px 0; }
  .spinner {
    width: 48px; height: 48px;
    border: 4px solid #e8d5b8;
    border-top-color: #7c3a00;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Summary ── */
  .summary-header {
    background: linear-gradient(135deg, #7c3a00, #c05e00);
    border-radius: 16px;
    padding: 24px 28px;
    color: white;
    margin-bottom: 16px;
  }
  .summary-header h2 { margin: 0 0 8px; font-family: 'Playfair Display', serif; font-size: 1.4rem; }
  .summary-header p { margin: 0; opacity: 0.9; line-height: 1.6; font-size: 0.92rem; }
  .summary-card {
    background: white;
    border-radius: 16px;
    padding: 24px 28px;
    margin-bottom: 14px;
    border: 2px solid #e8d5b8;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }
  .summary-card h3 {
    margin: 0 0 14px;
    color: #7c3a00;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .summary-card ul { margin: 0; padding-left: 20px; }
  .summary-card li { margin-bottom: 10px; line-height: 1.6; color: #444; font-size: 0.92rem; }
  .term-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
  .term-badge {
    background: #fff3e0; color: #7c3a00; font-weight: 700;
    font-size: 0.78rem; padding: 3px 10px; border-radius: 999px;
    white-space: nowrap; margin-top: 2px; flex-shrink: 0;
  }
  .term-def { color: #555; font-size: 0.88rem; line-height: 1.5; }
  .conclusion-card {
    background: #fff8f0; border-radius: 16px; padding: 20px 28px;
    border: 2px solid #ffd8a8;
  }
  .conclusion-card h3 { margin: 0 0 8px; color: #7c3a00; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .conclusion-card p { margin: 0; color: #555; line-height: 1.6; font-size: 0.92rem; }

  /* ── Mind Map ── */
  .mindmap-wrap {
    background: white;
    border-radius: 16px;
    padding: 36px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    overflow-x: auto;
    border: 2px solid #e8d5b8;
  }

  /* ── Quiz ── */
  .quiz-score {
    border-radius: 16px; padding: 20px 28px;
    color: white; margin-bottom: 24px; text-align: center;
  }
  .quiz-score .score-num { font-size: 2.2rem; font-weight: 900; font-family: 'Playfair Display', serif; }
  .quiz-card {
    background: white; border-radius: 16px; padding: 22px 26px;
    margin-bottom: 16px; border: 2px solid #e8d5b8;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }
  .quiz-q { font-weight: 700; color: #333; margin-bottom: 14px; line-height: 1.5; }
  .quiz-q span { color: #7c3a00; margin-right: 6px; }
  .quiz-option {
    border-radius: 10px; padding: 10px 16px;
    cursor: pointer; font-size: 0.9rem;
    transition: all 0.15s; margin-bottom: 8px;
    border: 2px solid #e8d5b8; background: #f8f4ee; color: #444;
  }
  .quiz-option:hover { border-color: #ff922b; background: #fff3e0; }
  .quiz-explanation {
    margin-top: 12px; background: #f0f4ff; border-radius: 8px;
    padding: 10px 14px; font-size: 0.82rem; color: #555; line-height: 1.5;
  }
  .submit-btn {
    background: #7c3a00; color: white; border: none;
    padding: 12px 32px; border-radius: 999px; font-weight: 700;
    font-size: 0.95rem; cursor: pointer; display: block; margin: 0 auto;
    transition: transform 0.2s, box-shadow 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(124,58,0,0.3); }
  .submit-btn:disabled { background: #ccc; cursor: not-allowed; }

  /* ── Flashcards ── */
  .fc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
  .fc-card {
    height: 180px;
    perspective: 1000px;
    cursor: pointer;
  }
  .fc-inner {
    width: 100%; height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 16px;
  }
  .fc-card.flipped .fc-inner { transform: rotateY(180deg); }
  .fc-front, .fc-back {
    position: absolute; inset: 0;
    border-radius: 16px;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
  .fc-front {
    background: linear-gradient(135deg, #7c3a00, #c05e00);
    color: white;
    border: 2px solid rgba(255,255,255,0.1);
  }
  .fc-front .fc-num {
    font-size: 0.72rem; opacity: 0.6; margin-bottom: 8px;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .fc-front .fc-term {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 700; line-height: 1.4;
  }
  .fc-front .fc-hint { font-size: 0.72rem; opacity: 0.5; margin-top: 10px; }
  .fc-back {
    background: white;
    border: 2px solid #e8d5b8;
    transform: rotateY(180deg);
    color: #444;
    font-size: 0.88rem;
    line-height: 1.6;
  }
  .fc-nav {
    display: flex; justify-content: center; align-items: center;
    gap: 16px; margin-top: 20px;
  }
  .fc-nav-btn {
    background: #7c3a00; color: white; border: none;
    width: 40px; height: 40px; border-radius: 50%;
    font-size: 1.1rem; cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .fc-nav-btn:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(124,58,0,0.3); }
  .fc-counter { color: #7c3a00; font-weight: 700; font-size: 0.9rem; }
  .fc-mode-toggle {
    display: flex; gap: 8px; justify-content: center; margin-bottom: 20px;
  }
  .fc-mode-btn {
    padding: 7px 18px; border-radius: 999px; border: 2px solid #e8d5b8;
    background: white; color: #7c3a00; font-weight: 600; font-size: 0.82rem;
    cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .fc-mode-btn.active { background: #7c3a00; color: white; border-color: #7c3a00; }

  /* ── Empty State ── */
  .empty-state {
    text-align: center; padding: 60px 20px; color: #bbb;
  }
  .empty-state .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-state p { font-size: 0.9rem; margin: 0; }

  /* ── Error ── */
  .error-box {
    background: #ffe3e3; border: 1.5px solid #FF6B6B; border-radius: 10px;
    padding: 12px 20px; color: #c92a2a; font-size: 0.88rem;
    margin-bottom: 20px; max-width: 600px; margin-left: auto; margin-right: auto;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .retry-btn {
    background: #c92a2a; color: white; border: none;
    padding: 5px 14px; border-radius: 999px; cursor: pointer;
    font-size: 0.82rem; font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }

  .content-wrap { max-width: 800px; margin: 0 auto; }
  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; font-weight: 800; color: #7c3a00;
    text-align: center; margin: 0 0 6px;
  }
  .page-sub { text-align: center; color: #999; font-size: 0.9rem; margin: 0 0 32px; }
`;

// ── Mind Map Node ─────────────────────────────────────────────────────────────
function MindNode({ node, depth = 0, index = 0 }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const color = depth === 0 ? "#7c3a00" : COLORS[index % COLORS.length];
  const isRoot = depth === 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: depth === 0 ? "center" : "flex-start" }}>
      <div
        onClick={() => hasChildren && setOpen(!open)}
        style={{
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

// ── Flashcards ────────────────────────────────────────────────────────────────
function FlashcardsView({ cards }) {
  const [flipped, setFlipped] = useState({});
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState("grid"); // grid | single

  if (!cards?.length) return null;

  const toggleFlip = (i) => setFlipped(f => ({ ...f, [i]: !f[i] }));

  return (
    <div className="content-wrap">
      <div className="fc-mode-toggle">
        <button className={`fc-mode-btn ${mode === "grid" ? "active" : ""}`} onClick={() => setMode("grid")}>⊞ Grid View</button>
        <button className={`fc-mode-btn ${mode === "single" ? "active" : ""}`} onClick={() => setMode("single")}>▷ One at a Time</button>
      </div>

      {mode === "grid" && (
        <div className="fc-grid">
          {cards.map((card, i) => (
            <div key={i} className={`fc-card ${flipped[i] ? "flipped" : ""}`} onClick={() => toggleFlip(i)}>
              <div className="fc-inner">
                <div className="fc-front">
                  <div className="fc-num">Card {i + 1} of {cards.length}</div>
                  <div className="fc-term">{card.term}</div>
                  <div className="fc-hint">tap to reveal →</div>
                </div>
                <div className="fc-back">{card.definition}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {mode === "single" && (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div
            className={`fc-card ${flipped[current] ? "flipped" : ""}`}
            style={{ height: 240 }}
            onClick={() => toggleFlip(current)}
          >
            <div className="fc-inner">
              <div className="fc-front">
                <div className="fc-num">Card {current + 1} of {cards.length}</div>
                <div className="fc-term">{cards[current].term}</div>
                <div className="fc-hint">tap to reveal →</div>
              </div>
              <div className="fc-back" style={{ fontSize: "0.95rem" }}>{cards[current].definition}</div>
            </div>
          </div>
          <div className="fc-nav">
            <button className="fc-nav-btn" onClick={() => { setCurrent(c => Math.max(0, c - 1)); setFlipped({}); }} disabled={current === 0}>‹</button>
            <span className="fc-counter">{current + 1} / {cards.length}</span>
            <button className="fc-nav-btn" onClick={() => { setCurrent(c => Math.min(cards.length - 1, c + 1)); setFlipped({}); }} disabled={current === cards.length - 1}>›</button>
          </div>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button onClick={() => { setCurrent(0); setFlipped({}); }}
              style={{ background: "none", border: "2px solid #e8d5b8", borderRadius: 999, padding: "6px 18px", color: "#7c3a00", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", fontFamily: "'DM Sans', sans-serif" }}>
              🔄 Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quiz View ─────────────────────────────────────────────────────────────────
function QuizView({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  if (!questions?.length) return null;
  const score = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0;
  return (
    <div className="content-wrap">
      {submitted && (
        <div className="quiz-score" style={{ background: score >= questions.length * 0.7 ? "linear-gradient(135deg,#2f9e44,#40c057)" : "linear-gradient(135deg,#e67700,#f76707)" }}>
          <div className="score-num">{score}/{questions.length}</div>
          <div style={{ opacity: 0.9 }}>{score >= questions.length * 0.7 ? "🎉 Great job!" : "Keep practicing!"}</div>
        </div>
      )}
      {questions.map((q, qi) => {
        const chosen = answers[qi];
        const isCorrect = chosen === q.correct;
        return (
          <div key={qi} className="quiz-card">
            <p className="quiz-q"><span>Q{qi + 1}.</span>{q.question}</p>
            {q.options.map((opt, oi) => {
              let bg = "#f8f4ee", border = "#e8d5b8", color = "#444";
              if (submitted) {
                if (oi === q.correct) { bg = "#ebfbee"; border = "#40c057"; color = "#2f9e44"; }
                else if (oi === chosen && !isCorrect) { bg = "#fff5f5"; border = "#ff6b6b"; color = "#c92a2a"; }
              }
              if (!submitted && chosen === oi) { bg = "#fff3e0"; border = "#ff922b"; }
              return (
                <div key={oi} className="quiz-option"
                  onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))}
                  style={{ background: bg, borderColor: border, color, cursor: submitted ? "default" : "pointer", fontWeight: chosen === oi ? 600 : 400 }}>
                  <span style={{ marginRight: 8, opacity: 0.6 }}>{String.fromCharCode(65 + oi)}.</span>{opt}
                </div>
              );
            })}
            {submitted && q.explanation && <div className="quiz-explanation">💡 {q.explanation}</div>}
          </div>
        );
      })}
      {!submitted ? (
        <button className="submit-btn" onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length}>
          Submit Answers ({Object.keys(answers).length}/{questions.length} answered)
        </button>
      ) : (
        <button className="submit-btn" onClick={() => { setAnswers({}); setSubmitted(false); }}>
          🔄 Try Again
        </button>
      )}
    </div>
  );
}

// ── Summary View ──────────────────────────────────────────────────────────────
function SummaryView({ summary }) {
  if (!summary) return null;
  return (
    <div className="content-wrap">
      <div className="summary-header">
        <h2>{summary.title}</h2>
        <p>{summary.overview}</p>
      </div>
      <div className="summary-card">
        <h3>📌 Key Points</h3>
        <ul>{(summary.key_points || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
      {summary.important_terms?.length > 0 && (
        <div className="summary-card">
          <h3>📖 Important Terms</h3>
          {summary.important_terms.map((item, i) => (
            <div key={i} className="term-row">
              <span className="term-badge">{item.term}</span>
              <span className="term-def">{item.definition}</span>
            </div>
          ))}
        </div>
      )}
      {summary.conclusion && (
        <div className="conclusion-card">
          <h3>✅ Takeaway</h3>
          <p>{summary.conclusion}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DynamicPDFLearning() {
  const [file, setFile]           = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading]     = useState(null);
  const [errors, setErrors]       = useState({});

  const [summary,   setSummary]   = useState(null);
  const [mindmap,   setMindmap]   = useState(null);
  const [questions, setQuestions] = useState(null);
  const [flashcards,setFlashcards]= useState(null);

  const fileRef = useRef();

  // ── File handling ──
  const handleFile = (f) => {
    if (!f || f.type !== "application/pdf") return alert("Please upload a PDF file.");
    setFile(f);
    // reset all generated content when new file uploaded
    setSummary(null); setMindmap(null); setQuestions(null); setFlashcards(null);
    setActiveTab(null); setErrors({});
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const makeFormData = () => {
    const fd = new FormData();
    fd.append("file", file);
    return fd;
  };

  // ── Generators ──
  const generate = async (type) => {
    if (!file) return;
    setLoading(type);
    setActiveTab(type);
    setErrors(e => ({ ...e, [type]: "" }));
    try {
      let result;
      const fd = makeFormData();

      if (type === "summary") {
        const res = await axios.post(`${API}/ai/pdf-summary`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        result = res.data.summary;
        setSummary(result);

      } else if (type === "mindmap") {
        const res = await axios.post(`${API}/ai/pdf-mindmap`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        result = res.data.mindmap;
        setMindmap(result);

      } else if (type === "quiz") {
        const res = await axios.post(`${API}/ai/pdf-quiz`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        result = res.data.questions;
        setQuestions(result);

      } else if (type === "flashcards") {
        const res = await axios.post(`${API}/ai/pdf-flashcards`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        result = res.data.flashcards;
        setFlashcards(result);
      }
    } catch (e) {
      setErrors(err => ({ ...err, [type]: e.response?.data?.detail || e.message || "Something went wrong." }));
    } finally {
      setLoading(null);
    }
  };

  const tabs = [
    { key: "summary",    label: "📋 Summary",    data: summary },
    { key: "mindmap",    label: "🧠 Mind Map",   data: mindmap },
    { key: "quiz",       label: "✅ Quiz",        data: questions },
    { key: "flashcards", label: "🃏 Flashcards",  data: flashcards },
  ];

  const isLoading = (t) => loading === t;
  const hasData   = (t) => tabs.find(x => x.key === t)?.data;

  return (
    <>
      <style>{styles}</style>
      <div className="dpl-root">
        <h1 className="page-title"></h1>
        <p className="page-sub">Upload any law-related PDF and instantly get Summary, Mind Map, Quiz & Flashcards</p>

        {/* Upload Zone */}
        {!file && (
          <div
            className={`upload-zone ${dragOver ? "drag-over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <div className="upload-icon">⚖️</div>
            <h2 className="upload-title">Drop your PDF here</h2>
            <p className="upload-sub">Supports any legal or constitutional PDF document</p>
            <button className="upload-btn" onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>
              Browse PDF
            </button>
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }}
              onChange={e => handleFile(e.target.files[0])} />
          </div>
        )}

        {/* File pill + change */}
        {file && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="file-pill">
              📄 {file.name}
              <button className="file-pill-remove" onClick={() => { setFile(null); setSummary(null); setMindmap(null); setQuestions(null); setFlashcards(null); setActiveTab(null); }}>✕</button>
            </div>
          </div>
        )}

        {/* Generate Buttons */}
        {file && (
          <div className="gen-buttons">
            {[
              { key: "summary",    icon: "📋", label: "Generate Summary" },
              { key: "mindmap",    icon: "🧠", label: "Generate Mind Map" },
              { key: "quiz",       icon: "✅", label: "Generate Quiz" },
              { key: "flashcards", icon: "🃏", label: "Generate Flashcards" },
            ].map(({ key, icon, label }) => (
              <button key={key}
                className={`gen-btn ${activeTab === key ? "active" : ""}`}
                onClick={() => generate(key)}
                disabled={!!loading}>
                {isLoading(key) ? "⏳" : icon} {label}
              </button>
            ))}
          </div>
        )}

        {/* Tabs (only show if at least one has data) */}
        {file && tabs.some(t => t.data) && (
          <div className="tabs">
            {tabs.filter(t => t.data || activeTab === t.key).map(t => (
              <button key={t.key}
                className={`tab ${activeTab === t.key ? "active" : ""} ${t.data ? "has-data" : ""}`}
                onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {activeTab && errors[activeTab] && (
          <div className="error-box">
            <span>⚠️ {errors[activeTab]}</span>
            <button className="retry-btn" onClick={() => generate(activeTab)}>Retry</button>
          </div>
        )}

        {/* Content */}
        {activeTab && isLoading(activeTab) && (
          <div className="spinner-wrap">
            <div className="spinner" />
            <p style={{ color: "#999" }}>
              {activeTab === "summary"    ? "Reading PDF and generating summary..." :
               activeTab === "mindmap"   ? "Building your mind map..." :
               activeTab === "quiz"      ? "Crafting quiz questions..." :
                                           "Creating flashcards..."}
            </p>
          </div>
        )}

        {!loading && activeTab === "summary"    && <SummaryView summary={summary} />}
        {!loading && activeTab === "mindmap"    && mindmap && (
          <div className="content-wrap">
            <div className="mindmap-wrap"><MindNode node={mindmap} depth={0} index={0} /></div>
          </div>
        )}
        {!loading && activeTab === "quiz"       && <QuizView questions={questions} />}
        {!loading && activeTab === "flashcards" && <FlashcardsView cards={flashcards} />}

        {/* Empty state — file uploaded but nothing generated yet */}
        {file && !activeTab && !loading && (
          <div className="empty-state">
            <div className="empty-icon">👆</div>
            <p>Click any Generate button above to get started!</p>
          </div>
        )}
      </div>
    </>
  );
}