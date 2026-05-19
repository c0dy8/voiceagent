import { useState } from "react";

export function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <textarea
        className="chat-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask ChefBot anything about cooking..."
        disabled={isLoading}
        rows={1}
      />
      <button className="send-btn" type="submit" disabled={isLoading || !text.trim()}>
        {isLoading ? "..." : "Send"}
      </button>
    </form>
  );
}
