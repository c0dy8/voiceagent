import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap-setup";

export function Mockups() {
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

      // Set initial state
      gsap.set(".mockup-laptop", { opacity: 0, scale: 0.8 });
      gsap.set(".mockup-phone-left", { opacity: 0, x: -80, rotate: -8 });
      gsap.set(".mockup-phone-right", { opacity: 0, x: 80, rotate: 8 });

      // Animate laptop in
      gsap.to(".mockup-laptop", {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });

      // Animate left phone in
      gsap.to(".mockup-phone-left", {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });

      // Animate right phone in
      gsap.to(".mockup-phone-right", {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="mockups" ref={ref}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">In your hands</span>
          <h2>Designed for the way chefs actually work.</h2>
        </div>

        <div className="mockup-stage">
          {/* Phone left */}
          <div className="mockup-phone mockup-phone-left">
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="mini-msg user">How many calories does an egg have?</div>
                <div className="mini-msg bot">
                  <span className="mini-badge green">🥗 Nutritional Info</span>
                  <p><strong>One large egg (50g)</strong></p>
                  <div style={{ fontSize: 12, marginTop: 8, lineHeight: 1.8 }}>
                    <div>⚡ 78 kcal</div>
                    <div>🧬 6g protein</div>
                    <div>🍳 5g fat</div>
                    <div style={{ color: "var(--color-muted)", marginTop: 6, fontSize: 11 }}>Verified by USDA</div>
                  </div>
                </div>
                <div className="mini-voice">
                  <div className="mini-voice-dot" />
                  Playing audio…
                </div>
              </div>
            </div>
          </div>

          {/* Laptop */}
          <div className="mockup-laptop">
            <div className="laptop-frame">
              <div className="laptop-bar">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
              <div className="laptop-screen">
                <div className="mini-msg user">Give me a recipe for chicken tikka masala</div>
                <div className="mini-msg bot">
                  <span className="mini-badge orange">🍽️ Recipe Search</span>
                  <p style={{ margin: "8px 0 0 0" }}><strong>Chicken Tikka Masala</strong></p>
                  <p style={{ fontSize: 11, color: "var(--color-muted)", margin: "4px 0 0 0" }}>Indian · Serves 4 · 45 min</p>
                  <div style={{ fontSize: 12, marginTop: 12, lineHeight: 1.8, borderLeft: "2px solid var(--color-accent)", paddingLeft: 10 }}>
                    <div><strong>Ingredients:</strong></div>
                    <div style={{ fontSize: 11, marginTop: 6 }}>1kg chicken · yogurt · garam masala · tomatoes · cream · garlic</div>
                  </div>
                </div>
                <div className="mini-msg user">And how many calories per serving?</div>
              </div>
            </div>
            <div className="laptop-base" />
          </div>

          {/* Phone right */}
          <div className="mockup-phone mockup-phone-right">
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="mini-msg user">How do I sear a steak properly?</div>
                <div className="mini-msg bot">
                  <div style={{ fontSize: 12, lineHeight: 1.8, marginBottom: 8 }}>
                    <div><strong>1. Prep</strong> · Pat steak dry with paper towels</div>
                    <div><strong>2. Heat</strong> · Pan 400°F, butter + oil</div>
                    <div><strong>3. Sear</strong> · 3min each side, minimal movement</div>
                    <div><strong>4. Rest</strong> · 5min before serving</div>
                  </div>
                </div>
                <div className="mini-rag">📚 RAG · 3 sources</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
