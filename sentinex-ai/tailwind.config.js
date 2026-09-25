/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#05070d",
          panel: "#0a0e1a",
          surface: "#0e1320",
          surface2: "#131a2b",
          border: "#1c2436",
        },
        accent: {
          cyan: "#22d3ee",
          blue: "#3b82f6",
          purple: "#a855f7",
          green: "#22c55e",
        },
        sentiment: {
          positive: "#22c55e",
          negative: "#ef4444",
          neutral: "#94a3b8",
          warning: "#f59e0b",
        },
        ink: {
          primary: "#e6ebf5",
          secondary: "#94a3b8",
          muted: "#5b6579",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px -6px rgba(34, 211, 238, 0.35)",
        card: "0 4px 24px -8px rgba(0,0,0,0.5)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out both",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
