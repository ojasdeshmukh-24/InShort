/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./sidepanel.html",
    "./popup.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          blue: "#2563eb",
          purple: "#7c3aed",
          emerald: "#059669",
          amber: "#d97706",
          rose: "#e11d48",
        }
      }
    },
  },
  plugins: [],
}
