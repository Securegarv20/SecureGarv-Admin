/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e4ddff',
          300: '#d1c2ff',
          400: '#b89eff',
          500: '#7c6cc5',
          600: '#6b5bb3',
          700: '#5a4a9f',
          800: '#4a3d85',
          900: '#3d326b',
        },
        slate: {
          850: '#1e293b',
          950: '#020617',
        }
      },
    },
  },
  plugins: [],
};
