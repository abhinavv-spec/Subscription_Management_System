/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B1020",
        sidebar: "#0E1526",
        card: "#111B2E",
        "card-secondary": "#172238",
        border: "#263449",
        primary: {
          DEFAULT: "#38BDF8",
          hover: "#0284C7",
          dark: "#0369A1"
        },
        secondary: "#818CF8",
        success: "#34D399",
        warning: "#FBBF24",
        danger: "#F87171",
        "text-main": "#F1F5F9",
        "text-secondary": "#94A3B8"
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
        elevated: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)"
      }
    },
  },
  plugins: [],
}
