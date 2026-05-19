import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap-setup";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="22" cy="22" r="12" />
        <path d="m38 38-7-7" />
      </svg>
    ),
    title: "Recipe Search",
    desc: "Pulls real recipes from TheMealDB. Ingredients, measurements and step-by-step instructions — not hallucinated.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 40h32M12 40V20M22 40V12M32 40V24M42 40V16" />
      </svg>
    ),
    title: "Nutritional Analysis",
    desc: "Calories, protein, carbs, fat and fiber per 100g. Powered by USDA FoodData Central. Verified data, not estimates.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 14h28v22H10z" />
        <path d="M10 14l14 12 14-12" />
      </svg>
    ),
    title: "Culinary Knowledge",
    desc: "RAG pipeline grounded in real cooking references. Ask about searing, emulsions, fermentation — get answers backed by sources.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="20" y="8" width="8" height="20" rx="4" />
        <path d="M14 24a10 10 0 0 0 20 0M24 34v6M18 40h12" />
      </svg>
    ),
    title: "Voice Mode",
    desc: "Hands covered in flour? Switch to voice. ChefBot speaks every answer using OpenAI TTS — clear, natural, hands-free.",
  },
];

export function Features() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      const head = sectionRef.current.querySelectorAll(".section-head > *");
      gsap.set(head, { opacity: 0, y: 30 });
      gsap.to(head, {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });

      gsap.set(".feature-card", { opacity: 0, y: 40 });
      gsap.to(".feature-card", {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="features" id="features" ref={sectionRef}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Features</span>
          <h2>What makes ChefBot credible.</h2>
          <p className="section-sub">
            Four capabilities, each grounded in real data and real tools — not invented on the fly.
          </p>
        </div>
        <div className="feature-grid" ref={gridRef}>
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
