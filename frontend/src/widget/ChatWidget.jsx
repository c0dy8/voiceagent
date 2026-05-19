import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { Logo } from "../landing/Logo";

const TOOL_STYLES = {
  recipe_search: { className: "orange", icon: "🍽️" },
  nutritional_info: { className: "green", icon: "🥗" },
};

const formatResponse = (text) => {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    .replace(/~~~(.*?)~~~/g, "<em>$1</em>")
    .replace(/###\s+(.*?)(?=\n|$)/g, "<h4>$1</h4>")
    .replace(/##\s+(.*?)(?=\n|$)/g, "<h3>$1</h3>")
    .replace(/\n- /g, "<br/>• ")
    .replace(/\n\d+\.\s+/g, "<br/>")
    .replace(/\n\n+/g, "<br/><br/>")
    .trim();
  return html;
};

export function ChatWidget({ open, onClose, firstOpen }) {
  const { messages, mode, setMode, isLoading, sendMessage, addAudioExchange, SESSION_ID } = useChat();
  const { isRecording, isSending, recordAndSend } = useAudioRecorder();
  const [input, setInput] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 200);
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAudioRecord = () => {
    recordAndSend(
      SESSION_ID,
      mode,
      (response) => {
        addAudioExchange(response.transcribed_text || "🎤 (voice message)", response);
      },
      (error) => {
        console.error("Audio error:", error);
        addAudioExchange("🎤 (voice message)", {
          response: "Sorry, I couldn't process the audio: " + error.message,
          tool_used: null,
          tool_name: null,
          audio_b64: null,
        });
      }
    );
  };

  return (
    <>
      <button
        className={`widget-button ${firstOpen ? "pulse" : ""}`}
        onClick={open ? handleClose : onClose}
        aria-label={open ? "Close ChefBot" : "Open ChefBot"}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <Logo size={28} variant="mark" />
        )}
      </button>

      {open && (
        <div className={`widget-modal ${isClosing ? "closing" : ""}`} role="dialog" aria-label="ChefBot chat">
          <header className="widget-header">
            <div className="widget-header-left">
              <Logo size={24} />
            </div>
            <div className="widget-mode" role="group" aria-label="Response mode">
              <button
                className={mode === "text" ? "active" : ""}
                onClick={() => setMode("text")}
              >💬 Text</button>
              <button
                className={mode === "voice" ? "active" : ""}
                onClick={() => setMode("voice")}
              >🔊 Voice</button>
            </div>
            <button className="widget-close" onClick={handleClose} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="widget-chat">
            {messages.length === 0 && (
              <div className="widget-welcome">
                <p>Hi, I&apos;m ChefBot 👨‍🍳<br />Ask me anything kitchen-related.</p>
                <div className="widget-suggestions">
                  <button onClick={() => sendMessage("Give me a recipe for chicken tikka masala")}>
                    🍝 Give me a recipe for chicken tikka masala
                  </button>
                  <button onClick={() => sendMessage("How many calories does an avocado have?")}>
                    🥑 How many calories does an avocado have?
                  </button>
                  <button onClick={() => sendMessage("How do I properly sear a steak?")}>
                    🥩 How do I properly sear a steak?
                  </button>
                </div>
              </div>
            )}

            {messages.map((m) => {
              if (m.role === "error") {
                return <div key={m.id} className="widget-msg error">{m.content}</div>;
              }
              if (m.role === "user") {
                return <div key={m.id} className="widget-msg user">{m.content}</div>;
              }
              const tool = m.tool_used ? TOOL_STYLES[m.tool_used] : null;
              return (
                <div key={m.id} className="widget-msg bot">
                  {tool && (
                    <div className={`widget-msg-badge ${tool.className}`}>
                      <span>{tool.icon}</span>
                      <span>Tool: <strong>{m.tool_name}</strong></span>
                    </div>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: formatResponse(m.content) }} />
                </div>
              );
            })}

            {isLoading && (
              <div className="widget-loading">
                <span /><span /><span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="widget-input">
            <form onSubmit={handleSubmit}>
              <button
                type="button"
                className={`widget-audio-btn ${isRecording ? "recording" : ""} ${isSending ? "sending" : ""}`}
                onClick={handleAudioRecord}
                disabled={isLoading || isSending}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                title={isRecording ? "Grabando... Clic para detener" : "Grabar audio"}
              >
                {isRecording ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="3" height="16" rx="1" />
                    <rect x="15" y="4" width="3" height="16" rx="1" />
                  </svg>
                ) : isSending ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about recipes, nutrition, technique…"
                rows={1}
                disabled={isLoading || isRecording}
              />
              <button type="submit" className="widget-send" disabled={isLoading || !input.trim()} aria-label="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
