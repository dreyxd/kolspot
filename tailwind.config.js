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
          DEFAULT: '#0a0a0f',
          soft: '#111118',
        },
        surface: '#1a1a24',
        accent: {
          DEFAULT: '#8b5cf6',
          soft: '#a78bfa',
          dark: '#6d28d9',
        },
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(0,0,0,0.2), 0 1px 3px 1px rgba(0,0,0,0.1)',
        glow: '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
        '3d': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 5px 15px -3px rgba(0, 0, 0, 0.3)',
        '3d-hover': '0 20px 40px -5px rgba(139, 92, 246, 0.3), 0 10px 25px -3px rgba(0, 0, 0, 0.4)'
      }
    },
  },
  plugins: [],
}
