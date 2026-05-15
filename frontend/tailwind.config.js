/** @type {import('tailwindcss').Config} */
// Trigger Vite rebuild for darkMode
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f2f8f5',
          100: '#e1f0e8',
          200: '#c4e2d3',
          800: '#1e4635', // Deep forest green
          900: '#143024', // Very deep forest green
        }
      }
    },
  },
  plugins: [],
}
