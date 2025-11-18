/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0b0b0c',
          soft: '#121214',
        },
        surface: '#18181b',
        accent: {
          DEFAULT: '#f97316',
          soft: '#fb923c',
        },
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(0,0,0,0.2), 0 1px 3px 1px rgba(0,0,0,0.1)'
      }
    },
  },
  plugins: [],
}
