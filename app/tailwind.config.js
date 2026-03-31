/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f0f7ff', 100: '#e0effe', 200: '#bae0fd', 300: '#7cc8fb', 400: '#36adf6', 500: '#0c93e7', 600: '#0074c5', 700: '#015da0', 800: '#064f84', 900: '#0b426e' },
        danger: { 500: '#ef4444', 600: '#dc2626' },
        success: { 500: '#22c55e', 600: '#16a34a' },
        warning: { 500: '#f59e0b', 600: '#d97706' },
      },
    },
  },
  plugins: [],
};
