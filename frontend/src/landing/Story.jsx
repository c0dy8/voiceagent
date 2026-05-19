import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap-setup";

export function Story() {
  const act1 = useRef(null);
  const act2 = useRef(null);
  const act3 = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      // Act I — text + eyebrow
      const act1Eyebrow = act1.current.querySelector(".eyebrow");
      gsap.set([act1Eyebrow, ".act-text"], { opacity: 0, y: 30 });
      gsap.to([act1Eyebrow, ".act-text"], {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: act1.current, start: "top 70%" },
      });

      // Act II — eyebrow + heading + cards
      const act2Eyebrow = act2.current.querySelector(".eyebrow");
      const act2Heading = act2.current.querySelector(".act-2-heading");
      gsap.set([act2Eyebrow, act2Heading], { opacity: 0, y: 30 });
      gsap.to([act2Eyebrow, act2Heading], {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: act2.current, start: "top 75%" },
      });

      gsap.set(".compare-left", { opacity: 0, x: -40 });
      gsap.set(".compare-right", { opacity: 0, x: 40 });
      gsap.to(act2.current.querySelector(".compare-left"), {
        x: 0,
        opacity: 1,
        duration: 0.9,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: act2.current, start: "top 70%" },
      });
      gsap.to(act2.current.querySelector(".compare-right"), {
        x: 0,
        opacity: 1,
        duration: 0.9,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: { trigger: act2.current, start: "top 70%" },
      });

      // Act III — text + sub
      const act3Sub = act3.current.querySelector(".act3-sub");
      gsap.set(".act3-text", { opacity: 0, scale: 0.95, y: 20 });
      gsap.set(act3Sub, { opacity: 0, y: 20 });
      gsap.to(act3.current.querySelector(".act3-text"), {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: act3.current, start: "top 70%" },
      });
      gsap.to(act3Sub, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: { trigger: act3.current, start: "top 70%" },
      });
      const path = act3.current.querySelector(".draw-path");
      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: act3.current, start: "top 60%" },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="act act-1" ref={act1}>
        <div
          className="act-bg"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600&q=80&auto=format&fit=crop)",
          }}
        />
        <div className="container act-content">
          <span className="eyebrow">Act I — The problem</span>
          <h2 className="act-text">
            “Most AI tools give you recipes that look fine —<br />
            until they fall apart at the stove.”
          </h2>
        </div>
      </section>

      <section className="act act-2" ref={act2}>
        <div className="container">
          <span className="eyebrow">Act II — Why generic AI fails</span>
          <h2 className="act-2-heading">Recipes need real data. Not best-guesses.</h2>
          <div className="compare">
            <div className="compare-card compare-left">
              <div className="compare-tag">Generic AI</div>
              <ul>
                <li><span className="compare-icon bad">❌</span><span className="strikethrough">Hallucinated ingredients</span></li>
                <li><span className="compare-icon bad">❌</span><span className="strikethrough">Vague measurements</span></li>
                <li><span className="compare-icon bad">❌</span><span className="strikethrough">No nutrition data</span></li>
                <li><span className="compare-icon bad">❌</span><span className="strikethrough">Made-up techniques</span></li>
              </ul>
              <div className="compare-footer bad">Unreliable · Guesswork</div>
            </div>
            <div className="compare-card compare-right compare-accent">
              <div className="compare-tag compare-tag-accent">ChefBot</div>
              <ul>
                <li><span className="compare-icon good">✓</span><strong>Real recipes via TheMealDB</strong></li>
                <li><span className="compare-icon good">✓</span><strong>Exact measurements</strong></li>
                <li><span className="compare-icon good">✓</span><strong>USDA-backed nutrition</strong></li>
                <li><span className="compare-icon good">✓</span><strong>Technique grounded in references (RAG)</strong></li>
              </ul>
              <div className="compare-footer good">Verified · Reliable · Pro-ready</div>
            </div>
          </div>
        </div>
      </section>

      <section className="act act-3" ref={act3}>
        <div className="container act3-content">
          <svg className="act3-mark" width="120" height="120" viewBox="0 0 32 32" fill="none">
            <path
              className="draw-path"
              d="M9 18c0-3 2-5 5-5h4c3 0 5 2 5 5v3H9v-3z M11 13a3 3 0 1 1 3-3 M21 13a3 3 0 1 0-3-3"
              stroke="var(--color-ink)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="23" cy="9" r="2" fill="var(--color-accent)" />
          </svg>
          <h2 className="act3-text">Meet your sous-chef.</h2>
          <p className="act3-sub">Backed by real data. Always at your side.</p>
        </div>
      </section>
    </>
  );
}
