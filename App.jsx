import { useEffect, useRef, useState } from "react";

const starterMessage = {
  role: "assistant",
  content: "Hi! I'm your AI assistant. Ask me a question and I'll do my best to help."
};

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `chat-${Date.now()}`;
}

export default function App() {
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(makeId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch("/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      })
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The request could not be completed.");
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message || "Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function clearChat() {
    setMessages([starterMessage]);
    setConversationId(makeId());
    setError("");
    setInput("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon">✳</span><span>Nova Chat</span></div>
        <button className="new-chat" onClick={clearChat} type="button"><span>＋</span> New chat</button>
        <div className="side-label">WORKSPACE</div>
        <div className="side-item"><span>▤</span> AI Assistant</div>
        <div className="sidebar-bottom"><span className="online-dot" /> Secure server-side AI</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>AI Assistant</span>
          <span className="model-label"><span className={apiStatus === "online" ? "online-dot" : "status-dot"} />{apiStatus === "online" ? "API connected" : apiStatus === "checking" ? "Connecting…" : "API offline"}</span>
        </header>

        <section className="chat-area" aria-live="polite">
          {messages.length === 1 && (
            <div className="welcome">
              <div className="welcome-icon">✳</div>
              <h1>How can I help you today?</h1>
              <p>Ask a question, explore an idea, or get help with a task.</p>
            </div>
          )}
          <div className="messages">
            {messages.map((item, index) => (
              <div className={`message-row ${item.role === "user" ? "user" : ""}`} key={`${index}-${item.role}`}>
                <div className="avatar">{item.role === "user" ? "YOU" : "AI"}</div>
                <div className="bubble">
                  <div className="role-name">{item.role === "user" ? "You" : "Nova"}</div>
                  <div className="message-text">{item.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-row">
                <div className="avatar">AI</div>
                <div className="bubble"><div className="role-name">Nova</div><div className="typing" aria-label="Assistant is typing"><i /><i /><i /></div></div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </section>

        <div className="composer-wrap">
          {error && <div className="error" role="alert">{error}</div>}
          <form className="composer" onSubmit={sendMessage}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage(event);
                }
              }}
              placeholder="Message Nova…"
              rows="1"
              aria-label="Write a message"
            />
            <button className="send" type="submit" disabled={!input.trim() || loading} aria-label="Send message">➤</button>
          </form>
          <p className="disclaimer">AI can make mistakes. Check important information.</p>
        </div>
      </main>
    </div>
  );
}