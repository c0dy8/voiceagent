export function Logo({ size = 32, variant = "full" }) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M9 18c0-3 2-5 5-5h4c3 0 5 2 5 5v3H9v-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 13a3 3 0 1 1 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21 13a3 3 0 1 0-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="23" cy="9" r="1.6" fill="var(--color-accent)" />
    </svg>
  );

  if (variant === "mark") return mark;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {mark}
      <span
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 600,
          fontSize: size * 0.6,
          letterSpacing: "-0.01em",
          color: "var(--color-ink)",
        }}
      >
        ChefBot
      </span>
    </span>
  );
}
