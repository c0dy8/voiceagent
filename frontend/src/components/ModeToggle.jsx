export function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle">
      <span className="mode-label">Response mode:</span>
      <div className="toggle-group">
        <button
          className={`toggle-btn ${mode === "text" ? "active" : ""}`}
          onClick={() => setMode("text")}
        >
          💬 Text
        </button>
        <button
          className={`toggle-btn ${mode === "voice" ? "active" : ""}`}
          onClick={() => setMode("voice")}
        >
          🔊 Voice
        </button>
      </div>
    </div>
  );
}
