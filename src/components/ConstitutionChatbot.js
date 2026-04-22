import { useState, useRef, useEffect } from "react";

const SUGGESTED_QUESTIONS = [
  "What are the 6 Fundamental Rights?",
  "Explain Article 21 - Right to Life",
  "What are Directive Principles?",
  "What does the Preamble say?",
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .samvidhan-fab {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9999;
    font-family: 'DM Sans', sans-serif;
  }

  .samvidhan-trigger {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    box-shadow: 0 4px 24px rgba(230, 160, 40, 0.35), 0 0 0 3px rgba(230,160,40,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    position: relative;
  }
  .samvidhan-trigger:hover {
    transform: scale(1.12) rotate(-5deg);
    box-shadow: 0 8px 32px rgba(230,160,40,0.5), 0 0 0 4px rgba(230,160,40,0.2);
  }
  .samvidhan-trigger.open {
    transform: scale(0.9) rotate(15deg);
  }
  .samvidhan-trigger svg {
    width: 30px;
    height: 30px;
  }
  .samvidhan-ping {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #e6a028;
    animation: ping 1.8s ease-in-out infinite;
  }
  @keyframes ping {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.4; }
  }

  .samvidhan-window {
    position: absolute;
    bottom: 76px;
    right: 0;
    width: 370px;
    height: 540px;
    background: #0d0d1a;
    border-radius: 20px;
    border: 1px solid rgba(230,160,40,0.2);
    box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform-origin: bottom right;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease;
  }
  .samvidhan-window.hidden {
    transform: scale(0.7) translateY(20px);
    opacity: 0;
    pointer-events: none;
  }
  .samvidhan-window.visible {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  .samvidhan-header {
    background: linear-gradient(135deg, #1a1a2e, #0f3460);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid rgba(230,160,40,0.15);
    flex-shrink: 0;
  }
  .samvidhan-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e6a028, #f5c842);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 12px rgba(230,160,40,0.4);
  }
  .samvidhan-avatar svg {
    width: 22px;
    height: 22px;
    color: #1a1a2e;
  }
  .samvidhan-header-info { flex: 1; }
  .samvidhan-header-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: #f5c842;
    line-height: 1;
  }
  .samvidhan-header-status {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: pulse-green 2s infinite;
  }
  @keyframes pulse-green {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .samvidhan-close {
    background: rgba(255,255,255,0.06);
    border: none;
    border-radius: 8px;
    width: 28px;
    height: 28px;
    cursor: pointer;
    color: rgba(255,255,255,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s;
  }
  .samvidhan-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

  .samvidhan-messages {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scrollbar-width: thin;
    scrollbar-color: rgba(230,160,40,0.2) transparent;
  }
  .samvidhan-messages::-webkit-scrollbar { width: 4px; }
  .samvidhan-messages::-webkit-scrollbar-thumb { background: rgba(230,160,40,0.2); border-radius: 4px; }

  .welcome-card {
    background: linear-gradient(135deg, rgba(230,160,40,0.08), rgba(15,52,96,0.3));
    border: 1px solid rgba(230,160,40,0.15);
    border-radius: 14px;
    padding: 14px;
    text-align: center;
  }
  .welcome-card .wc-icon { font-size: 28px; margin-bottom: 6px; }
  .welcome-card h3 {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #f5c842;
    margin: 0 0 5px;
  }
  .welcome-card p {
    font-size: 12px;
    color: rgba(255,255,255,0.55);
    margin: 0 0 10px;
    line-height: 1.5;
  }
  .suggestions {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .suggestion-btn {
    background: rgba(230,160,40,0.06);
    border: 1px solid rgba(230,160,40,0.2);
    border-radius: 8px;
    padding: 7px 10px;
    color: rgba(255,255,255,0.75);
    font-size: 11.5px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .suggestion-btn:hover {
    background: rgba(230,160,40,0.12);
    border-color: rgba(230,160,40,0.4);
    color: #fff;
    transform: translateX(3px);
  }

  .msg-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    animation: fadeUp 0.3s ease forwards;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .msg-row.user { flex-direction: row-reverse; }
  .msg-mini-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e6a028, #f5c842);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 12px;
  }
  .bubble {
    max-width: 82%;
    padding: 10px 13px;
    border-radius: 14px;
    font-size: 13px;
    line-height: 1.55;
  }
  .bubble.bot {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.88);
    border-bottom-left-radius: 4px;
  }
  .bubble.user {
    background: linear-gradient(135deg, #e6a028, #d4891a);
    color: #1a1a2e;
    font-weight: 500;
    border-bottom-right-radius: 4px;
  }

  .typing-bubble {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    border-bottom-left-radius: 4px;
    padding: 12px 16px;
    display: flex;
    gap: 5px;
    align-items: center;
  }
  .typing-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(230,160,40,0.6);
    animation: bounce 1.2s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); opacity: 0.5; }
    50% { transform: translateY(-5px); opacity: 1; }
  }

  .samvidhan-input-area {
    padding: 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: rgba(0,0,0,0.2);
    flex-shrink: 0;
  }
  .samvidhan-input {
    flex: 1;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 10px 13px;
    color: #fff;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    resize: none;
    outline: none;
    min-height: 42px;
    max-height: 100px;
    line-height: 1.4;
    transition: border-color 0.2s;
  }
  .samvidhan-input::placeholder { color: rgba(255,255,255,0.28); }
  .samvidhan-input:focus { border-color: rgba(230,160,40,0.4); }

  /* ── Mic Button ── */
  .mic-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  .mic-btn:hover:not(:disabled) {
    background: rgba(230,160,40,0.1);
    border-color: rgba(230,160,40,0.3);
    color: #e6a028;
  }
  .mic-btn.listening {
    background: rgba(220, 50, 50, 0.15);
    border-color: rgba(220, 50, 50, 0.5);
    color: #ff5555;
    animation: mic-pulse 1s ease-in-out infinite;
  }
  .mic-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .mic-btn svg { width: 18px; height: 18px; }
  @keyframes mic-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220,50,50,0.4); }
    50% { box-shadow: 0 0 0 6px rgba(220,50,50,0); }
  }

  /* voice interim text indicator */
  .samvidhan-input.listening {
    border-color: rgba(220, 50, 50, 0.4);
    background: rgba(220, 50, 50, 0.05);
  }

  .send-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #e6a028, #d4891a);
    color: #1a1a2e;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 12px rgba(230,160,40,0.3);
  }
  .send-btn:hover:not(:disabled) {
    transform: scale(1.08);
    box-shadow: 0 6px 18px rgba(230,160,40,0.45);
  }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .send-btn svg { width: 18px; height: 18px; }

  /* voice not supported notice */
  .voice-unsupported {
    font-size: 10px;
    color: rgba(255,255,255,0.3);
    text-align: center;
    padding: 0 12px 8px;
  }
`;

export default function ConstitutionChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPing, setShowPing] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Check Web Speech API support & set up recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // Indian English — works great for Hindi-accented speech too

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results in the input box as user speaks
      setInput(finalTranscript || interimTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-send if we have a final transcript
      setInput((current) => {
        if (current.trim()) {
          // Small delay so state updates settle before sending
          setTimeout(() => {
            sendMessageFromVoice(current.trim());
          }, 100);
        }
        return current;
      });
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone permission and try again.");
      }
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowPing(false);
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput(""); // clear input before listening
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Separate function used by voice auto-send (avoids stale closure on input state)
  const sendMessageFromVoice = async (text) => {
    if (!text || loading) return;
    setInput("");
    await callAPI(text);
  };

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput("");
    await callAPI(question);
  };

  const callAPI = async (question) => {
    const userMsg = { role: "user", content: question };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/ai/constitution-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error("No reply");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Unable to connect right now. Please make sure the backend is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <>
      <style>{styles}</style>
      <div className="samvidhan-fab">
        {/* Chat Window */}
        <div className={`samvidhan-window ${isOpen ? "visible" : "hidden"}`}>

          {/* Header */}
          <div className="samvidhan-header">
            <div className="samvidhan-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div className="samvidhan-header-info">
              <div className="samvidhan-header-name">Samvidhan Mitra</div>
              <div className="samvidhan-header-status">
                <span className="status-dot"></span>
                Constitutional Learning Assistant
              </div>
            </div>
            <button className="samvidhan-close" onClick={() => setIsOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="samvidhan-messages">
            {showWelcome && (
              <div className="welcome-card">
                <div className="wc-icon">⚖️</div>
                <h3>Namaste! I'm Samvidhan Mitra</h3>
                <p>Ask me anything about the Indian Constitution — by typing or using the 🎙 mic button below.</p>
                <div className="suggestions">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button key={i} className="suggestion-btn" onClick={() => sendMessage(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.role === "user" ? "user" : "bot"}`}>
                {msg.role === "assistant" && (
                  <div className="msg-mini-avatar">⚖️</div>
                )}
                <div className={`bubble ${msg.role === "user" ? "user" : "bot"}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg-row bot">
                <div className="msg-mini-avatar">⚖️</div>
                <div className="typing-bubble">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="samvidhan-input-area">
            <textarea
              ref={inputRef}
              className={`samvidhan-input ${isListening ? "listening" : ""}`}
              placeholder={isListening ? "Listening... speak now 🎙" : "Ask about the Constitution..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />

            {/* Mic button — only shown if browser supports it */}
            {voiceSupported && (
              <button
                className={`mic-btn ${isListening ? "listening" : ""}`}
                onClick={toggleListening}
                disabled={loading}
                title={isListening ? "Stop listening" : "Speak your question"}
              >
                {isListening ? (
                  /* Stop/recording icon */
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                ) : (
                  /* Mic icon */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </button>
            )}

            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"/>
                <path d="M22 2L15 22 11 13 2 9l20-7z"/>
              </svg>
            </button>
          </div>

          {!voiceSupported && (
            <div className="voice-unsupported">
              Voice input not supported in this browser. Try Chrome or Edge.
            </div>
          )}
        </div>

        {/* FAB Trigger */}
        <button
          className={`samvidhan-trigger ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen((v) => !v)}
          title="Samvidhan Mitra - Constitutional Assistant"
        >
          {showPing && <span className="samvidhan-ping" />}
          {isOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="#e6a028" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="#e6a028" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
              <circle cx="8.5" cy="10" r="1.5" fill="#e6a028"/>
              <circle cx="15.5" cy="10" r="1.5" fill="#e6a028"/>
              <path d="M9 13.5s1 1.5 3 1.5 3-1.5 3-1.5"/>
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
