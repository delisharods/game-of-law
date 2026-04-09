import { useState, useRef } from "react";

// ── Wheel segments — Constitutional Law focused ───────────────────────────────
const wheelSegments = [
  { label: "Preamble",           emoji: "📜", color: "#7c3a00" },
  { label: "Fundamental Rights", emoji: "✊", color: "#92400e" },
  { label: "DPSP",               emoji: "🏛️", color: "#b45309" },
  { label: "Parliament",         emoji: "🏟️", color: "#a16207" },
  { label: "Judiciary",          emoji: "⚖️", color: "#854d0e" },
  { label: "Amendments",         emoji: "📝", color: "#78350f" },
  { label: "Emergency",          emoji: "🚨", color: "#6b2d0a" },
  { label: "Citizenship",        emoji: "🪪", color: "#9a3412" },
];

// ── 40+ questions — fully constitutional ─────────────────────────────────────
const questions = [
  // Preamble
  { question: "The word 'Socialist' was added to the Preamble by which Amendment?", options: ["42nd Amendment", "44th Amendment", "52nd Amendment", "86th Amendment"], correct: 0, category: "Preamble" },
  { question: "The Preamble declares India as a:", options: ["Federal Republic", "Sovereign Socialist Secular Democratic Republic", "Democratic Socialist State", "Secular Federal State"], correct: 1, category: "Preamble" },
  { question: "The Preamble to the Indian Constitution was adopted on:", options: ["15 August 1947", "26 November 1949", "26 January 1950", "30 January 1948"], correct: 1, category: "Preamble" },
  { question: "Which case declared the Preamble to be part of the Constitution?", options: ["Berubari Union case", "Kesavananda Bharati case", "Golaknath case", "Maneka Gandhi case"], correct: 1, category: "Preamble" },
  { question: "'Justice — social, economic and political' in the Preamble is taken from:", options: ["US Constitution", "UK Constitution", "Russian Revolution", "French Constitution"], correct: 2, category: "Preamble" },

  // Fundamental Rights
  { question: "Under which article can a citizen move the Supreme Court for enforcement of Fundamental Rights?", options: ["Article 14", "Article 19", "Article 21", "Article 32"], correct: 3, category: "Fundamental Rights" },
  { question: "Right to Education (Article 21A) was inserted by which amendment?", options: ["82nd Amendment", "86th Amendment", "88th Amendment", "91st Amendment"], correct: 1, category: "Fundamental Rights" },
  { question: "Which Fundamental Right was removed by the 44th Amendment?", options: ["Right to Equality", "Right to Freedom", "Right to Property", "Right against Exploitation"], correct: 2, category: "Fundamental Rights" },
  { question: "Article 17 of the Constitution deals with:", options: ["Untouchability abolition", "Prohibition of traffic in human beings", "Right against arbitrary arrest", "Equal pay for equal work"], correct: 0, category: "Fundamental Rights" },
  { question: "Freedom of Press in India is implied under which article?", options: ["Article 14", "Article 19(1)(a)", "Article 21", "Article 25"], correct: 1, category: "Fundamental Rights" },
  { question: "Which article provides protection against double jeopardy?", options: ["Article 20(1)", "Article 20(2)", "Article 20(3)", "Article 22"], correct: 1, category: "Fundamental Rights" },
  { question: "The Right to Constitutional Remedies is called the 'heart and soul' by:", options: ["Nehru", "Ambedkar", "Gandhi", "Patel"], correct: 1, category: "Fundamental Rights" },

  // DPSP
  { question: "Directive Principles of State Policy are in which Part of the Constitution?", options: ["Part III", "Part IV", "Part IVA", "Part V"], correct: 1, category: "DPSP" },
  { question: "DPSPs are NOT enforceable in court. This concept is borrowed from:", options: ["US Constitution", "Canadian Constitution", "Irish Constitution", "Australian Constitution"], correct: 2, category: "DPSP" },
  { question: "Equal pay for equal work for men and women is under which article?", options: ["Article 39(a)", "Article 39(d)", "Article 41", "Article 43"], correct: 1, category: "DPSP" },
  { question: "Which article of DPSP deals with promotion of interests of SCs/STs?", options: ["Article 45", "Article 46", "Article 47", "Article 48"], correct: 1, category: "DPSP" },
  { question: "Uniform Civil Code is mandated under which article?", options: ["Article 40", "Article 41", "Article 44", "Article 45"], correct: 2, category: "DPSP" },

  // Parliament
  { question: "The maximum gap allowed between two sessions of Parliament is:", options: ["3 months", "4 months", "6 months", "1 year"], correct: 2, category: "Parliament" },
  { question: "Which article deals with the composition of Parliament?", options: ["Article 79", "Article 80", "Article 81", "Article 82"], correct: 0, category: "Parliament" },
  { question: "A Money Bill can only be introduced in:", options: ["Rajya Sabha", "Lok Sabha", "Either House", "Joint Session"], correct: 1, category: "Parliament" },
  { question: "The minimum age to become a member of Rajya Sabha is:", options: ["25 years", "30 years", "35 years", "21 years"], correct: 1, category: "Parliament" },
  { question: "What is the term of Rajya Sabha members?", options: ["4 years", "5 years", "6 years", "Lifetime"], correct: 2, category: "Parliament" },

  // Judiciary
  { question: "The Supreme Court of India was established on:", options: ["15 August 1947", "26 January 1950", "26 November 1949", "1 October 1937"], correct: 1, category: "Judiciary" },
  { question: "Which article provides for the establishment of the Supreme Court?", options: ["Article 124", "Article 126", "Article 130", "Article 141"], correct: 0, category: "Judiciary" },
  { question: "The 'Basic Structure' doctrine was established in which case?", options: ["Golaknath case", "Kesavananda Bharati case", "Minerva Mills case", "Maneka Gandhi case"], correct: 1, category: "Judiciary" },
  { question: "Which article makes Supreme Court law binding on all courts?", options: ["Article 132", "Article 136", "Article 141", "Article 142"], correct: 2, category: "Judiciary" },
  { question: "PIL (Public Interest Litigation) was first introduced in India in:", options: ["1976", "1979", "1982", "1985"], correct: 1, category: "Judiciary" },

  // Amendments
  { question: "Which amendment is known as the 'Mini Constitution'?", options: ["42nd Amendment", "44th Amendment", "52nd Amendment", "73rd Amendment"], correct: 0, category: "Amendments" },
  { question: "The 73rd Amendment introduced which system?", options: ["Panchayati Raj", "Urban Local Bodies", "Cooperative Societies", "Scheduled Areas"], correct: 0, category: "Amendments" },
  { question: "The 44th Amendment restored rights removed by the 42nd Amendment relating to:", options: ["Right to Property", "Freedom of Press", "Habeas Corpus rights", "Right to Education"], correct: 2, category: "Amendments" },
  { question: "The voting age was reduced from 21 to 18 years by which amendment?", options: ["52nd Amendment", "61st Amendment", "73rd Amendment", "74th Amendment"], correct: 1, category: "Amendments" },
  { question: "Anti-defection law was introduced by which amendment?", options: ["42nd Amendment", "44th Amendment", "52nd Amendment", "61st Amendment"], correct: 2, category: "Amendments" },

  // Emergency
  { question: "National Emergency under Article 352 can be declared on grounds of:", options: ["Financial instability", "War, external aggression or armed rebellion", "Failure of constitutional machinery", "Natural disaster"], correct: 1, category: "Emergency" },
  { question: "President's Rule (Article 356) is also known as:", options: ["National Emergency", "Financial Emergency", "State Emergency", "Constitutional Emergency"], correct: 2, category: "Emergency" },
  { question: "Financial Emergency under Article 360 has been declared in India:", options: ["Once", "Twice", "Three times", "Never"], correct: 3, category: "Emergency" },
  { question: "The first National Emergency in India was declared in:", options: ["1962", "1971", "1975", "1965"], correct: 0, category: "Emergency" },
  { question: "During National Emergency, which Fundamental Rights cannot be suspended?", options: ["Article 19", "Articles 20 and 21", "Article 14", "Article 32"], correct: 1, category: "Emergency" },

  // Citizenship
  { question: "Citizenship provisions in India are in which Part of the Constitution?", options: ["Part I", "Part II", "Part III", "Part IV"], correct: 1, category: "Citizenship" },
  { question: "The Citizenship Act was enacted in:", options: ["1950", "1955", "1960", "1965"], correct: 1, category: "Citizenship" },
  { question: "India follows which type of citizenship?", options: ["Dual citizenship", "Single citizenship", "Multiple citizenship", "State citizenship"], correct: 1, category: "Citizenship" },
  { question: "Citizenship by naturalization requires residence in India for at least:", options: ["5 years", "7 years", "10 years", "11 years"], correct: 3, category: "Citizenship" },
  { question: "OCI (Overseas Citizen of India) scheme was introduced in:", options: ["2000", "2003", "2005", "2010"], correct: 2, category: "Citizenship" },
];

// ── SVG Wheel ─────────────────────────────────────────────────────────────────
function WheelSVG({ rotation, isSpinning }) {
  const N = wheelSegments.length;
  const R = 180;
  const cx = 190; const cy = 190;
  const anglePerSeg = (2 * Math.PI) / N;

  const segs = wheelSegments.map((seg, i) => {
    const startAngle = i * anglePerSeg - Math.PI / 2;
    const endAngle   = startAngle + anglePerSeg;
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const midAngle = startAngle + anglePerSeg / 2;
    const textR = R * 0.63;
    const tx = cx + textR * Math.cos(midAngle);
    const ty = cy + textR * Math.sin(midAngle);
    const textDeg = (midAngle * 180) / Math.PI;
    const d = [`M ${cx} ${cy}`, `L ${x1} ${y1}`, `A ${R} ${R} 0 0 1 ${x2} ${y2}`, "Z"].join(" ");
    const fillColor = i % 2 === 0 ? seg.color : lighten(seg.color);
    return { d, fillColor, tx, ty, textDeg, seg, startAngle };
  });

  return (
    <svg width="380" height="380" viewBox="0 0 380 380"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: isSpinning ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
        filter: "drop-shadow(0 8px 24px rgba(124,58,0,0.35))",
      }}
    >
      <circle cx={cx} cy={cy} r={R + 8} fill="#4a1a00" />
      <circle cx={cx} cy={cy} r={R + 4} fill="#7c3a00" />

      {segs.map(({ d, fillColor, tx, ty, textDeg, seg }, i) => (
        <g key={i}>
          <path d={d} fill={fillColor} stroke="#4a1a00" strokeWidth="1.5" />
          <text x={tx} y={ty - 11} textAnchor="middle" dominantBaseline="middle"
            fontSize="15" transform={`rotate(${textDeg + 90}, ${tx}, ${ty})`}
            style={{ userSelect: "none" }}>{seg.emoji}</text>
          <text x={tx} y={ty + 9} textAnchor="middle" dominantBaseline="middle"
            fontSize="8.5" fontWeight="700" fill="white" fontFamily="'Segoe UI', sans-serif"
            transform={`rotate(${textDeg + 90}, ${tx}, ${ty})`}
            style={{ userSelect: "none" }}>{seg.label}</text>
        </g>
      ))}

      {segs.map(({ startAngle }, i) => {
        const x1 = cx + R * Math.cos(startAngle);
        const y1 = cy + R * Math.sin(startAngle);
        return <line key={`l-${i}`} x1={cx} y1={cy} x2={x1} y2={y1} stroke="#4a1a00" strokeWidth="2" />;
      })}

      <circle cx={cx} cy={cy} r={30} fill="#1a0a00" />
      <circle cx={cx} cy={cy} r={23} fill="#7c3a00" />
      <circle cx={cx} cy={cy} r={15} fill="#d97706" />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="13" fill="white" fontFamily="'Segoe UI', sans-serif"
        style={{ userSelect: "none" }}>⚖️</text>
    </svg>
  );
}

function lighten(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const amt = 28;
  return `rgb(${Math.min(r+amt,255)},${Math.min(g+amt,255)},${Math.min(b+amt,255)})`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SpinWheel() {
  const [isSpinning, setIsSpinning]           = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer]   = useState(null);
  const [showResults, setShowResults]         = useState(false);
  const [rotation, setRotation]               = useState(0);
  const [score, setScore]                     = useState(0);
  const [totalQuestions, setTotalQuestions]   = useState(0);
  const [landedSegment, setLandedSegment]     = useState(null);
  const [streak, setStreak]                   = useState(0);
  const rotationRef                           = useRef(0);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResults(false);
    setLandedSegment(null);

    const spins = 6 + Math.random() * 6;
    const finalAngle = Math.random() * 360;
    const newRotation = rotationRef.current + spins * 360 + finalAngle;
    rotationRef.current = newRotation;
    setRotation(newRotation);

    setTimeout(() => {
      const normalised = ((newRotation % 360) + 360) % 360;
      const pointerAngle = (360 - normalised + 270) % 360;
      const segAngle = 360 / wheelSegments.length;
      const segIndex = Math.floor(pointerAngle / segAngle) % wheelSegments.length;
      const landed = wheelSegments[segIndex];
      setLandedSegment(landed);
      const catQ = questions.filter(q => q.category === landed.label);
      const pool = catQ.length > 0 ? catQ : questions;
      setCurrentQuestion(pool[Math.floor(Math.random() * pool.length)]);
      setIsSpinning(false);
    }, 5200);
  };

  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowResults(true);
    setTotalQuestions(t => t + 1);
    if (index === currentQuestion.correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const resetGame = () => { setCurrentQuestion(null); setSelectedAnswer(null); setShowResults(false); setLandedSegment(null); };
  const resetAll  = () => { resetGame(); setScore(0); setTotalQuestions(0); setStreak(0); };

  const getAnswerStyle = (index) => {
    if (!showResults) return { background: "white", border: "2px solid #e8d5b8", color: "#374151", cursor: "pointer" };
    if (index === currentQuestion.correct) return { background: "#16a34a", border: "2px solid #15803d", color: "white", cursor: "default" };
    if (index === selectedAnswer) return { background: "#dc2626", border: "2px solid #b91c1c", color: "white", cursor: "default" };
    return { background: "#f3f4f6", border: "2px solid #e5e7eb", color: "#9ca3af", cursor: "default" };
  };

  const accuracy  = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isCorrect = selectedAnswer === currentQuestion?.correct;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf8f0 0%, #fef3e2 100%)", padding: "32px 16px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(135deg, #7c3a00, #92400e)", borderRadius: "20px 20px 0 0", padding: "24px 32px", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "4px 14px", fontSize: "0.67rem", color: "rgba(255,255,255,0.8)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            🎓 Gamified Constitutional Learning
          </div>
          <h1 style={{ margin: "0 0 6px", color: "white", fontSize: "1.85rem", fontWeight: 900, letterSpacing: "0.02em" }}>
            ⚖️ Constitutional Spin Wheel
          </h1>
          <p style={{ margin: "0 0 20px", color: "rgba(255,255,255,0.7)", fontSize: "0.86rem" }}>
            Spin to land on a constitutional topic — then test your knowledge!
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Score",     value: `${score}/${totalQuestions}` },
              { label: "Accuracy",  value: `${accuracy}%` },
              { label: "🔥 Streak", value: streak },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: "7px 18px" }}>
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}: </span>
                <span style={{ color: "white", fontWeight: 800, fontSize: "0.95rem" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ background: "white", borderRadius: "0 0 20px 20px", border: "1.5px solid #e8d5b8", borderTop: "none", padding: "32px 24px" }}>

          {/* Wheel + pointer */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderBottom: "30px solid #7c3a00", zIndex: 10, marginBottom: -6, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }} />
            <WheelSVG rotation={rotation} isSpinning={isSpinning} />

            {!currentQuestion && (
              <div style={{ marginTop: 26, textAlign: "center" }}>
                <button onClick={spinWheel} disabled={isSpinning}
                  style={{
                    padding: "14px 48px", borderRadius: 999, border: "none",
                    fontWeight: 800, fontSize: "1rem", letterSpacing: "0.06em",
                    cursor: isSpinning ? "not-allowed" : "pointer",
                    background: isSpinning ? "#d1d5db" : "linear-gradient(135deg, #7c3a00, #c05e00)",
                    color: isSpinning ? "#9ca3af" : "white",
                    boxShadow: isSpinning ? "none" : "0 4px 20px rgba(124,58,0,0.4)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { if (!isSpinning) e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  {isSpinning ? "⏳  Spinning..." : "🎯  SPIN THE WHEEL"}
                </button>
                <p style={{ color: "#b8a090", fontSize: "0.72rem", marginTop: 8 }}>
                  8 constitutional topics · 40+ questions
                </p>
              </div>
            )}
          </div>

          {/* Landed segment banner */}
          {landedSegment && currentQuestion && (
            <div style={{
              margin: "26px 0 18px",
              background: `linear-gradient(135deg, ${landedSegment.color}, ${landedSegment.color}dd)`,
              borderRadius: 14, padding: "14px 24px", textAlign: "center",
              boxShadow: "0 4px 16px rgba(124,58,0,0.2)",
            }}>
              <span style={{ fontSize: "1.4rem" }}>{landedSegment.emoji}</span>
              <span style={{ color: "white", fontWeight: 800, fontSize: "1rem", marginLeft: 8 }}>{landedSegment.label}</span>
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.78rem", marginLeft: 8 }}>— Constitutional Topic</span>
            </div>
          )}

          {/* Question card */}
          {currentQuestion && (
            <div style={{ background: "#fdf8f0", border: "1.5px solid #e8d5b8", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg, #f3f4f6, #e8d5b8)", padding: "18px 24px", borderBottom: "1.5px solid #e8d5b8" }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <span style={{ background: "#7c3a00", color: "white", fontSize: "0.63rem", fontWeight: 700, padding: "2px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {currentQuestion.category}
                  </span>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: "#1f2937", fontSize: "1rem", lineHeight: 1.6, textAlign: "center" }}>
                  {currentQuestion.question}
                </p>
              </div>

              <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                {currentQuestion.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswerSelect(i)} disabled={showResults}
                    style={{
                      ...getAnswerStyle(i), padding: "11px 16px", borderRadius: 10,
                      fontWeight: 600, fontSize: "0.86rem", textAlign: "left",
                      transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10,
                    }}
                    onMouseEnter={e => { if (!showResults) { e.currentTarget.style.background = "#fff8f0"; e.currentTarget.style.borderColor = "#7c3a00"; }}}
                    onMouseLeave={e => { if (!showResults) { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e8d5b8"; }}}
                  >
                    <span style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: showResults ? (i === currentQuestion.correct ? "#15803d" : i === selectedAnswer ? "#b91c1c" : "#e5e7eb") : "#e8d5b8",
                      color: showResults && (i === currentQuestion.correct || i === selectedAnswer) ? "white" : "#7c3a00",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "0.7rem",
                    }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              {showResults && (
                <div style={{ padding: "0 24px 24px" }}>
                  <div style={{
                    background: isCorrect ? "#f0fdf4" : "#fff5f5",
                    border: `1.5px solid ${isCorrect ? "#86efac" : "#fca5a5"}`,
                    borderRadius: 12, padding: "16px 20px", textAlign: "center",
                  }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ background: isCorrect ? "#16a34a" : "#6b7280", color: "white", fontSize: "0.7rem", fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>
                        {isCorrect ? `+10 XP${streak >= 3 ? " 🔥 Streak Bonus!" : ""}` : "+0 XP"}
                      </span>
                    </div>
                    <p style={{ fontWeight: 800, fontSize: "1.05rem", color: isCorrect ? "#15803d" : "#dc2626", margin: "0 0 10px" }}>
                      {isCorrect ? "✅ Correct! Well done!" : "❌ Incorrect!"}
                    </p>
                    {!isCorrect && (
                      <p style={{ color: "#374151", fontSize: "0.83rem", margin: "0 0 14px" }}>
                        Correct answer: <strong style={{ color: "#15803d" }}>{currentQuestion.options[currentQuestion.correct]}</strong>
                      </p>
                    )}
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={resetGame} style={{ background: "linear-gradient(135deg, #7c3a00, #92400e)", color: "white", border: "none", padding: "10px 26px", borderRadius: 999, fontWeight: 700, fontSize: "0.86rem", cursor: "pointer", boxShadow: "0 3px 12px rgba(124,58,0,0.3)" }}>
                        🎯 Spin Again
                      </button>
                      <button onClick={resetAll} style={{ background: "white", color: "#7c3a00", border: "2px solid #e8d5b8", padding: "10px 26px", borderRadius: 999, fontWeight: 700, fontSize: "0.86rem", cursor: "pointer" }}>
                        🔄 Reset All
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category legend */}
          <div style={{ marginTop: 26 }}>
            <p style={{ textAlign: "center", color: "#b8a090", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
              Constitutional Topics on the Wheel
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center" }}>
              {wheelSegments.map(seg => (
                <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: 5, background: "#fdf8f0", border: "1.5px solid #e8d5b8", borderRadius: 999, padding: "4px 11px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#7c3a00" }}>{seg.emoji} {seg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}