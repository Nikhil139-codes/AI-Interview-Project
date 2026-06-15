/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#060E18', // Deeper navy
          800: '#0B192C', // Dominant navy blue
          700: '#1A3359', // Lighter navy for borders
        },
        primary: {
          400: '#33dbff', // Lighter cyan
          500: '#00D2FF', // Vibrant cyan (Accent)
          600: '#00a8cc', // Darker cyan for hover
          900: '#00404d', // Deep cyan
        },
        accent: {
          500: '#a855f7', // Purple 500
          600: '#9333ea', // Purple 600
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
