// Simple, consistent button used across the app.
// variant: "primary" | "secondary" | "ghost"
const VARIANTS = {
  primary:
    "bg-accent-cyan/90 text-base-bg font-semibold hover:bg-accent-cyan hover:shadow-glow",
  secondary:
    "bg-base-surface2 text-ink-primary border border-base-border hover:border-accent-cyan/50",
  ghost: "text-ink-secondary hover:text-ink-primary hover:bg-base-surface2",
};

export default function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
