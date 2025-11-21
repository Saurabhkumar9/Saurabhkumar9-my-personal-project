/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1", // violet blue
        secondary: "#F1F5F9", // light background
        accent: "#3B82F6", // blue accent
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#FACC15",
        textDark: "#1E293B",
        textLight: "#64748B",
        cardBg: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 14px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
}
