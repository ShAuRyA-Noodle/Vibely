// Zero-JS background — pure CSS, works in both light and dark mode
// No canvas, no requestAnimationFrame, no performance cost
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-background">
      {/* Ambient radial gradient — theme-aware */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.6]"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 20% 0%, hsl(var(--primary) / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 80% 100%, hsl(var(--primary) / 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle grain — only visible in dark mode */}
      <div
        aria-hidden
        className="absolute inset-0 hidden dark:block opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
        }}
      />
    </div>
  );
}
