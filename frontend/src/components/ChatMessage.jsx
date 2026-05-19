const TOOL_COLORS = {
  recipe_search: { bg: "#fff3e0", border: "#ff9800", icon: "🍽️" },
  nutritional_info: { bg: "#e8f5e9", border: "#4caf50", icon: "🥗" },
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

export function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const toolStyle = message.tool_used ? TOOL_COLORS[message.tool_used] : null;

  return (
    <div className={`message-wrapper ${isUser ? "user" : "bot"}`}>
      <div className={`message ${isUser ? "user-msg" : isError ? "error-msg" : "bot-msg"}`}>
        {message.tool_used && toolStyle && (
          <div
            className="tool-badge"
            style={{
              backgroundColor: toolStyle.bg,
              borderColor: toolStyle.border,
            }}
          >
            <span>{toolStyle.icon}</span>
            <span className="tool-badge-text">Used tool: <strong>{message.tool_name}</strong></span>
          </div>
        )}
        <p className="message-content" dangerouslySetInnerHTML={{ __html: formatResponse(message.content) }} />
      </div>
    </div>
  );
}
