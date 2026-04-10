/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'System Sans', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    extend: {
      colors: {
        brand: {
          main: '#1A1C1E',
          light: '#2A2D31',
          dark: '#0D0E10',
          gold: {
            base: '#D4AF37',
            hover: '#F1C40F',
            muted: '#AA8B2C'
          },
          card: '#24272A',
          border: '#3F444A'
        }
      }
    },
  },
  plugins: [],
}
