import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap-setup";

export function Hero({ onOpenWidget, isReady = true }) {
  const headlineRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion || !isReady) return;

    const ctx = gsap.context(() => {
      const words = headlineRef.current?.querySelectorAll(".word");
      if (words) {
        gsap.set(words, { opacity: 0, y: 20 });
        gsap.to(words, {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 1.2,
          ease: "power3.out",
        });
      }

      gsap.set(".hero-eyebrow, .hero-sub, .hero-ctas", { opacity: 0, y: 20 });
      gsap.to(".hero-eyebrow, .hero-sub, .hero-ctas", {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        delay: 0.6,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.set(imageRef.current, { opacity: 0, scale: 0.9 });
      gsap.to(imageRef.current, {
        scale: 1,
        opacity: 1,
        duration: 1.4,
        delay: 0.4,
        ease: "power3.out",
      });

      gsap.to(imageRef.current, {
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, [isReady]);

  const headline = "Cook with an AI that actually knows the kitchen.";
  const words = headline.split(" ");

  return (
    <section className="hero" id="top">
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">AI Cooking Assistant</span>
          <h1 ref={headlineRef} className="hero-headline">
            {words.map((w, i) => (
              <span key={i} className="word-wrap">
                <span className="word">{w}</span>{" "}
              </span>
            ))}
          </h1>
          <p className="hero-sub">
            ChefBot finds recipes, calculates nutrition, and explains techniques —
            using real culinary knowledge, not generic answers.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary" onClick={onOpenWidget}>
              Start cooking →
            </button>
            <a href="#how" className="btn btn-secondary">See how it works</a>
          </div>
        </div>
        <div className="hero-visual" ref={imageRef}>
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80&auto=format&fit=crop"
            alt="A beautifully plated dish viewed from above"
            loading="eager"
          />
          <div className="hero-card-float">
            <div className="hero-card-dot" />
            <div>
              <div className="hero-card-title">Recipe Search</div>
              <div className="hero-card-sub">Tool active · 0.4s</div>
            </div>
          </div>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
          <path d="M7 2v16m0 0l5-5m-5 5l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}
