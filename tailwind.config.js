/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
            romantic: {
                50: '#fff1f2',  // Rose 50
                100: '#ffe4e6', // Rose 100
                200: '#fecdd3', // Rose 200
                300: '#fda4af', // Rose 300
                400: '#fb7185', // Rose 400
                500: '#f43f5e', // Rose 500
                600: '#e11d48', // Rose 600
                700: '#be123c', // Rose 700
                800: '#9f1239', // Rose 800
                900: '#881337', // Rose 900
            },
            pastel: {
                pink: '#FFD1DC',
                blue: '#AEC6CF',
                purple: '#B39EB5',
                green: '#77DD77',
                yellow: '#FDFD96',
            }
        },
        fontFamily: {
            sans: ['Inter', 'sans-serif'], // You might want to import a google font later
            serif: ['Playfair Display', 'serif'], // Good for romantic titles
        },
        animation: {
            'spin-slow': 'spin 3s linear infinite',
            'bounce-slow': 'bounce 2s infinite',
            'float': 'float 3s ease-in-out infinite',
        },
        keyframes: {
            float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
            }
        }
      },
    },
    plugins: [],
  }
