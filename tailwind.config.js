/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          slate: '#1A1C1E',
          gold: '#D4AF37'
        }
      }
    },
  },
  plugins: [],
}
