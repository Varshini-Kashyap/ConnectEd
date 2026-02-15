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
        // Warm theme (ConnectEd)
        coral: {
          400: '#FFB894',
          500: '#FF9B85',
          600: '#FF8A6F',
        },
        cream: {
          50: '#FFFBF5',
          100: '#F5F1E8',
          200: '#F0E9DC',
          300: '#E8DFD1',
          700: '#6B5E52',
          800: '#4A3F35',
          900: '#3D3229',
        },
        sage: {
          500: '#6FA66C',
          600: '#5C8F5A',
        },
        gold: {
          500: '#F4B95E',
          600: '#E6A84E',
        },
      },
      fontFamily: {
        'dm-sans': ['"DM Sans"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(61, 50, 41, 0.1)',
        'warm-md': '0 4px 6px -1px rgba(61, 50, 41, 0.1)',
        'warm-lg': '0 10px 15px -3px rgba(61, 50, 41, 0.15)',
        'focus-coral': '0 0 0 3px rgba(255, 138, 111, 0.25)',
      },
    },
  },
  plugins: [],
}
