/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gmu-green': '#006633',
        'gmu-gold': '#FFCC33',
      }
    },
  },
  plugins: [],
}
