import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap-setup";

const STEPS = [
  {
    n: "01",
    title: "Open ChefBot",
    body: "Click the orange button in the corner. The chat widget opens instantly.",
    details: ["Floating button (always visible)", "Smooth animation", "Text + Voice mode toggle"]
  },
  {
    n: "02",
    title: "Ask your question",
    body: "Type or speak. Ask for recipes, nutrition info, or cooking techniques.",
    details: ["Give me a pasta recipe", "How many calories in an avocado?", "How do I sear a steak?"]
  },
  {
    n: "03",
    title: "ChefBot searches real data",
    body: "The agent picks the best tool: Recipe Search, Nutritional Info, or RAG knowledge.",
    details: ["See the tool badge Recipe Search", "See the tool badge Nutritional Info", "See the tool badge RAG"]
  },
  {
    n: "04",
    title: "Get verified answers",
    body: "Real recipes, verified nutrition facts, and grounded cooking techniques.",
    details: ["Exact measurements", "USDA-backed data", "Sources cited"]
  },
  {
    n: "05",
    title: "Switch to Voice",
    body: "Toggle Voice mode and ChefBot speaks every answer. Perfect for the kitchen.",
    details: ["Natural speech (OpenAI TTS)", "Hands-free operation", "Switch anytime"]
  },
  {
    n: "06",
    title: "Keep cooking!",
    body: "Continue chatting. ChefBot remembers your session for context.",
    details: ["One-on-one conversation", "Session memory", "Always helpful"]
  },
];

export function HowItWorks() {
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      const head = ref.current.querySelectorAll(".section-head > *");
      gsap.set(head, { opacity: 0, y: 30 });
      gsap.to(head, {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });

      gsap.set(".step", { opacity: 0, y: 40, scale: 0.95 });
      gsap.to(".step", {
        y: 0,
        scale: 1,
        opacity: 1,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="how" id="how" ref={ref}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>How to use ChefBot — six simple steps.</h2>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              {s.details && (
                <ul className="step-details">
                  {s.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
