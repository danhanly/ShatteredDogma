
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./node_modules/*",
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
          purple: '#9333ea', // Reverted to vibrant purple (Purple 600 equivalent) for the Orb/Effects
          lilac: '#d8b4fe',  // New light purple for Developer Mode Text/UI
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
        gothic: ['Pirata One', 'cursive'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-out-up': 'fadeOutUp 1s ease-out forwards',
        'progress': 'progress 1s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeOutUp: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-50px)' },
        },
        progress: {
          '0%': { width: '0%', opacity: '0.8' },
          '100%': { width: '100%', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
