/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'eu-blue': '#003399',
        'eu-yellow': '#FFCC00',
        'eu-dark-blue': '#002266',
        'eu-light-yellow': '#FFD633',
      },
    },
  },
  plugins: [],
};