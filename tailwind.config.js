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
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
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
