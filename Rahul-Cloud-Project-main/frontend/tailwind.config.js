export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      colors: {
        ink: {
          50:  "#f8f8f8",
          100: "#f0f0f0",
          200: "#e4e4e4",
          300: "#d1d1d1",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#3d3d3d",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        accent: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      boxShadow: {
        "xs":    "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        "float": "0 4px 16px -4px rgb(0 0 0 / 0.10), 0 2px 6px -2px rgb(0 0 0 / 0.06)",
        "modal": "0 20px 60px -12px rgb(0 0 0 / 0.20), 0 8px 20px -8px rgb(0 0 0 / 0.12)",
      },
      keyframes: {
        in:       { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "in-fast":{ from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer:  { "0%,100%": { opacity: 0.35 }, "50%": { opacity: 0.7 } },
        "scale-in":{ from: { opacity: 0, transform: "scale(0.96)" }, to: { opacity: 1, transform: "scale(1)" } },
      },
      animation: {
        "in":       "in 0.22s ease-out both",
        "in-fast":  "in-fast 0.15s ease-out both",
        "shimmer":  "shimmer 1.8s ease-in-out infinite",
        "scale-in": "scale-in 0.18s ease-out both",
      },
    },
  },
  plugins: [],
};
