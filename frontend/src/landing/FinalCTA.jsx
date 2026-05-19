import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap-setup";

export function FinalCTA({ onOpenWidget }) {
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      const inner = ref.current.querySelector(".cta-inner");
      const children = inner.children;

      gsap.set(inner, { opacity: 0, scale: 0.95 });
      gsap.set(children, { opacity: 0, y: 30 });

      gsap.to(inner, {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });

      gsap.to(children, {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="final-cta" ref={ref}>
      <div className="container">
        <div className="cta-inner">
          <span className="eyebrow">Your turn</span>
          <h2>Ready to cook smarter?</h2>
          <p>Talk to ChefBot — it&apos;s right there, in the corner.</p>
          <button className="btn btn-primary cta-btn" onClick={onOpenWidget}>
            Open ChefBot →
          </button>
        </div>
      </div>
    </section>
  );
}
