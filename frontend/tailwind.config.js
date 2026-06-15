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
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bacaff',
          300: '#88a4ff',
          400: '#4e73ff',
          550: '#3b5cff', // Primary action accent
          600: '#2640eb',
          700: '#1b2bc7',
          800: '#1c25a0',
          900: '#1c237f',
          950: '#10144b',
        }
      }
    },
  },
  plugins: [],
}
