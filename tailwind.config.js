/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./sidepanel.html",
    "./popup.html",
    "./mobile.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', '"Google Sans Text"', 'Roboto', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'sans-serif'],
        mono: ['"Google Sans Mono"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        batangas: ['"Batangas"', 'sans-serif'],
      },
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
