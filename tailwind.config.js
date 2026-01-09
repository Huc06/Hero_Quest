/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{ts,tsx}",
    "./scenes/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'medieval': ['MedievalSharp', 'cursive'],
        'almendra': ['Almendra', 'serif'],
      },
    },
  },
  plugins: [],
}

