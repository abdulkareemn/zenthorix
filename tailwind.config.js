/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo
          hover: '#4338CA',
        },
        secondary: {
          DEFAULT: '#22C55E', // Green
          hover: '#16A34A',
        },
        background: '#F9FAFB',
        text: '#111827',
      },
    },
  },
  plugins: [],
}
