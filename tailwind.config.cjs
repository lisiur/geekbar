/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "index.html",
    "./src/**/*.{html,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background-color)",
        base: "var(--base-color)",
        primary: "var(--primary-color)",
      }
    },
  },
  plugins: [],
}
