/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eldritch: {
          black: '#0a0a0a',
          dark: '#1a1a1a',
          crimson: '#660000',
          blood: '#8a0303',
          gold: '#c5a059',
          grey: '#4a4a4a',
          purple: '#2d004d',
        },
        worshipper: {
          worldly: '#4ade80', // Greenish
          lowly: '#9ca3af',   // Grey
          zealous: '#ef4444', // Red
          indolent: '#60a5fa', // Blue
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Lato', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-out-up': 'fadeOutUp 1s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeOutUp: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-50px)' },
        }
      }
    },
  },
  plugins: [],
}