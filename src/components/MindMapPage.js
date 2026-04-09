import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MODULE_PDF_MAP = {
  "constitution-foundation":          "the_constitution_of_india.pdf",
  "fundamental-rights-detailed":      "Fundamental_rights.pdf",
  "dpsp-and-duties":                  "DirectivePrinciples.pdf",
  "government-structure":             "the_constitution_of_india.pdf",
  "constitutional-interpretation":    "the_constitution_of_india.pdf",
  "fundamental-rights-jurisprudence": "Fundamental_rights.pdf",
  "constitutional-framework":         "the_constitution_of_india.pdf",
  "contemporary-issues":              "law_document.pdf",
  "my-constitution-book":             "the_constitution_of_india.pdf",
  "my-rights-as-child":               "Fundamental_rights.pdf",
  "our-country-promises":             "the_constitution_of_india.pdf",
};

const COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#20C997","#F06595"];
const API = "http://127.0.0.1:8000";

// ── MindMap Node ──────────────────────────────────────────────────────────────
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

// ── Summary View ──────────────────────────────────────────────────────────────
function SummaryView({ summary }) {
  if (!summary) return null;
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#7c3a00,#c05e00)", borderRadius: 16, padding: "24px 28px", color: "white", marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: "1.4rem", fontWeight: 800 }}>{summary.title}</h2>
        <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.6 }}>{summary.overview}</p>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", marginBottom: 16, border: "2px solid #e8d5b8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 14px", color: "#7c3a00", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>📌 Key Points</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {(summary.key_points || []).map((point, i) => (
            <li key={i} style={{ marginBottom: 10, lineHeight: 1.6, color: "#444", fontSize: "0.92rem" }}>{point}</li>
          ))}
        </ul>
      </div>

      {summary.important_terms?.length > 0 && (
        <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", marginBottom: 16, border: "2px solid #e8d5b8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 14px", color: "#7c3a00", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>📖 Important Terms</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {summary.important_terms.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ background: "#fff3e0", color: "#7c3a00", fontWeight: 700, fontSize: "0.8rem", padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap", marginTop: 2 }}>{item.term}</span>
                <span style={{ color: "#555", fontSize: "0.88rem", lineHeight: 1.5 }}>{item.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.conclusion && (
        <div style={{ background: "#fff8f0", borderRadius: 16, padding: "20px 28px", border: "2px solid #ffd8a8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <h3 style={{ margin: "0 0 8px", color: "#7c3a00", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>✅ Takeaway</h3>
          <p style={{ margin: 0, color: "#555", lineHeight: 1.6, fontSize: "0.92rem" }}>{summary.conclusion}</p>
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

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correct).length
    : 0;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {submitted && (
        <div style={{
          background: score >= questions.length * 0.7 ? "linear-gradient(135deg,#2f9e44,#40c057)" : "linear-gradient(135deg,#e67700,#f76707)",
          borderRadius: 16, padding: "20px 28px", color: "white", marginBottom: 24, textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: 900 }}>{score}/{questions.length}</div>
          <div style={{ opacity: 0.9 }}>{score >= questions.length * 0.7 ? "🎉 Great job!" : "Keep practicing!"}</div>
        </div>
      )}

      {questions.map((q, qi) => {
        const chosen = answers[qi];
        const isCorrect = chosen === q.correct;
        return (
          <div key={qi} style={{ background: "white", borderRadius: 16, padding: "22px 26px", marginBottom: 16, border: "2px solid #e8d5b8", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ fontWeight: 700, color: "#333", marginBottom: 14, lineHeight: 1.5 }}>
              <span style={{ color: "#7c3a00", marginRight: 6 }}>Q{qi + 1}.</span>{q.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((opt, oi) => {
                let bg = "#f8f4ee", border = "#e8d5b8", color = "#444";
                if (submitted) {
                  if (oi === q.correct) { bg = "#ebfbee"; border = "#40c057"; color = "#2f9e44"; }
                  else if (oi === chosen && !isCorrect) { bg = "#fff5f5"; border = "#ff6b6b"; color = "#c92a2a"; }
                }
                if (!submitted && chosen === oi) { bg = "#fff3e0"; border = "#ff922b"; }
                return (
                  <div key={oi}
                    onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))}
                    style={{ background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: "10px 16px", cursor: submitted ? "default" : "pointer", color, fontSize: "0.9rem", transition: "all 0.15s", fontWeight: chosen === oi ? 600 : 400 }}>
                    <span style={{ marginRight: 8, opacity: 0.6 }}>{String.fromCharCode(65 + oi)}.</span>{opt}
                  </div>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <div style={{ marginTop: 12, background: "#f0f4ff", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem", color: "#555", lineHeight: 1.5 }}>
                💡 {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < questions.length}
            style={{
              background: Object.keys(answers).length < questions.length ? "#ccc" : "#7c3a00",
              color: "white", border: "none", padding: "12px 32px", borderRadius: 999,
              fontWeight: 700, fontSize: "0.95rem", cursor: Object.keys(answers).length < questions.length ? "not-allowed" : "pointer"
            }}>
            Submit Answers ({Object.keys(answers).length}/{questions.length} answered)
          </button>
        </div>
      )}

      {submitted && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }}
            style={{ background: "#7c3a00", color: "white", border: "none", padding: "10px 28px", borderRadius: 999, fontWeight: 700, cursor: "pointer" }}>
            🔄 Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ width: 48, height: 48, border: "4px solid #e8d5b8", borderTop: "4px solid #7c3a00", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
      <p style={{ color: "#999" }}>{text}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MindMapPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("summary");
  const [summary, setSummary] = useState(null);
  const [mindmap, setMindmap] = useState(null);
  const [questions, setQuestions] = useState(null);

  const [loadingTab, setLoadingTab] = useState(null);
  const [errors, setErrors] = useState({});

  const pdfFile = MODULE_PDF_MAP[moduleId] || "law_document.pdf";
  const pdfPath = `/pdf/${pdfFile}`;

  // Fetch PDF as File object
  const getPdfFile = async () => {
    const response = await fetch(pdfPath);
    if (!response.ok) throw new Error("PDF not found: " + pdfPath);
    const blob = await response.blob();
    return new File([blob], pdfFile, { type: "application/pdf" });
  };

  const fetchSummary = async () => {
    if (summary) return;
    setLoadingTab("summary"); setErrors(e => ({ ...e, summary: "" }));
    try {
      const file = await getPdfFile();
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/ai/pdf-summary`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSummary(res.data.summary);
    } catch (e) {
      setErrors(err => ({ ...err, summary: e.message || "Failed to generate summary." }));
    } finally { setLoadingTab(null); }
  };

  const fetchMindmap = async () => {
    if (mindmap) return;
    setLoadingTab("mindmap"); setErrors(e => ({ ...e, mindmap: "" }));
    try {
      const file = await getPdfFile();
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/ai/pdf-mindmap`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setMindmap(res.data.mindmap);
    } catch (e) {
      setErrors(err => ({ ...err, mindmap: e.message || "Failed to generate mind map." }));
    } finally { setLoadingTab(null); }
  };

  const fetchQuiz = async () => {
    if (questions) return;
    setLoadingTab("quiz"); setErrors(e => ({ ...e, quiz: "" }));
    try {
      const file = await getPdfFile();
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/ai/pdf-quiz`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setQuestions(res.data.questions);
    } catch (e) {
      setErrors(err => ({ ...err, quiz: e.message || "Failed to generate quiz." }));
    } finally { setLoadingTab(null); }
  };

  // Auto-load summary on mount
  useEffect(() => {
    if (moduleId) fetchSummary();
  }, [moduleId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "summary") fetchSummary();
    if (tab === "mindmap") fetchMindmap();
    if (tab === "quiz") fetchQuiz();
  };

  const handleRegenerate = () => {
    if (activeTab === "summary") { setSummary(null); setTimeout(fetchSummary, 100); }
    if (activeTab === "mindmap") { setMindmap(null); setTimeout(fetchMindmap, 100); }
    if (activeTab === "quiz") { setQuestions(null); setTimeout(fetchQuiz, 100); }
  };

  const tabs = [
    { key: "summary", label: "📋 Summary" },
    { key: "mindmap", label: "🧠 Mind Map" },
    { key: "quiz",    label: "✅ Quiz" },
  ];

  const isLoading = loadingTab === activeTab;
  const currentError = errors[activeTab];
  const hasContent = activeTab === "summary" ? summary : activeTab === "mindmap" ? mindmap : questions;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#fdf8f0", padding: "32px 24px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {moduleId && (
        <button onClick={() => navigate(`/modules/${moduleId}`)}
          style={{ background: "#7c3a00", color: "white", border: "none", padding: "8px 18px", borderRadius: "999px", cursor: "pointer", fontWeight: 700, marginBottom: "20px" }}>
          ← Back to Module
        </button>
      )}

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#7c3a00", margin: "0 0 6px" }}>
          AI Study Tools
        </h1>
        {moduleId && (
          <p style={{ color: "#999", margin: 0, fontSize: "0.9rem" }}>
            Based on: <strong>{pdfFile}</strong>
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => handleTabChange(t.key)}
            style={{
              padding: "10px 24px", borderRadius: 999, border: "2px solid",
              borderColor: activeTab === t.key ? "#7c3a00" : "#e8d5b8",
              background: activeTab === t.key ? "#7c3a00" : "white",
              color: activeTab === t.key ? "white" : "#7c3a00",
              fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.15s"
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {currentError && (
        <div style={{ background: "#ffe3e3", border: "1.5px solid #FF6B6B", borderRadius: 10, padding: "12px 20px", color: "#c92a2a", fontSize: "0.88rem", marginBottom: 20, maxWidth: 600, margin: "0 auto 20px" }}>
          ⚠️ {currentError}
          <button onClick={handleRegenerate} style={{ marginLeft: 12, background: "#c92a2a", color: "white", border: "none", padding: "5px 14px", borderRadius: 999, cursor: "pointer", fontSize: "0.82rem" }}>
            Retry
          </button>
        </div>
      )}

      {/* Regenerate button */}
      {hasContent && !isLoading && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button onClick={handleRegenerate}
            style={{ background: "#7c3a00", color: "white", border: "none", padding: "9px 22px", borderRadius: 999, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
            🔄 Regenerate
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading && (
        <Spinner text={
          activeTab === "summary" ? "Reading PDF and generating summary..." :
          activeTab === "mindmap" ? "Reading PDF and generating mind map..." :
          "Reading PDF and generating quiz questions..."
        } />
      )}

      {!isLoading && activeTab === "summary" && <SummaryView summary={summary} />}

      {!isLoading && activeTab === "mindmap" && mindmap && (
        <div style={{ background: "white", borderRadius: 16, padding: "36px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflowX: "auto", border: "2px solid #e8d5b8" }}>
          <MindNode node={mindmap} depth={0} index={0} />
        </div>
      )}

      {!isLoading && activeTab === "quiz" && <QuizView questions={questions} />}
    </div>
  );
}