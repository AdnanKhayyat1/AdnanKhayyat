/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Azeret Mono"', 'monospace'],
      },
      colors: {
        'paper': '#ffffff',
        'ink': '#000000',
      },
      spacing: {
        'receipt': '400px',
      }
    },
  },
  plugins: [],
}
