/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E91E63',
          dark: '#C2185B',
        },
        secondary: {
          DEFAULT: '#6A1B9A',
          dark: '#4A148C',
        },
      },
    },
  },
  plugins: [],
};
