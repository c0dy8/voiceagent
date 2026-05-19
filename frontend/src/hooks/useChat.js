import { useState, useCallback } from "react";

const API_URL = "http://localhost:8000";

function generateSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SESSION_ID = generateSessionId();

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("text");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading) return;

      const userMsg = { role: "user", content: text, id: Date.now() };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            session_id: SESSION_ID,
            mode,
          }),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        const botMsg = {
          role: "assistant",
          content: data.response,
          tool_used: data.tool_used,
          tool_name: data.tool_name,
          id: Date.now() + 1,
        };
        setMessages((prev) => [...prev, botMsg]);

        if (mode === "voice" && data.audio_b64) {
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio_b64}`);
          audio.play().catch(console.error);
        }
      } catch (err) {
        const errMsg = {
          role: "error",
          content: `Connection error: ${err.message}. Make sure the backend is running.`,
          id: Date.now() + 1,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [mode, isLoading]
  );

  return { messages, mode, setMode, isLoading, sendMessage };
}
