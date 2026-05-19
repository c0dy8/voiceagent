import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap-setup";

const CASES = [
  {
    name: "Marta R.",
    role: "Home chef",
    quote: "I finally stopped second-guessing what I cook for my kids on weekdays.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop",
  },
  {
    name: "Daniel K.",
    role: "Restaurant prep cook",
    quote: "I check macros before I prep — saves us from re-doing entire batches.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop",
  },
  {
    name: "Lin S.",
    role: "Nutrition-focused cook",
    quote: "Real USDA numbers, not whatever the internet thinks an avocado weighs.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop",
  },
];

export function UseCases() {
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

      gsap.set(".case-card", { opacity: 0, y: 40, scale: 0.95 });
      gsap.to(".case-card", {
        y: 0,
        scale: 1,
        opacity: 1,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="use-cases" id="use-cases" ref={ref}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Use cases</span>
          <h2>Built for everyone who actually cooks.</h2>
        </div>
        <div className="cases">
          {CASES.map((c) => (
            <div className="case-card" key={c.name}>
              <img src={c.img} alt={c.name} className="case-avatar" />
              <blockquote>“{c.quote}”</blockquote>
              <div className="case-meta">
                <strong>{c.name}</strong>
                <span>{c.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
