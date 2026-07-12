/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E0E0E',
        panel: '#1A1A1A',
        orange: '#F04E23',
        teal: '#00B4A6',
        red: '#E24B4A',
        yellow: '#F5C518',
        purple: '#7B4FD4',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
