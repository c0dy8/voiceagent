import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Logo size={28} variant="mark" />
        <p className="footer-copy">
          © 2026 ChefBot · Built with React, FastAPI, LangChain &amp; OpenAI.
        </p>
        <div className="footer-links">
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://openai.com" target="_blank" rel="noreferrer">OpenAI</a>
          <a href="https://www.langchain.com" target="_blank" rel="noreferrer">LangChain</a>
        </div>
      </div>
    </footer>
  );
}
