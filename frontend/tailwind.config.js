/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dde7ff',
          200: '#c3d2ff',
          300: '#9db5ff',
          400: '#748dff',
          500: '#4f63ff',
          600: '#3a42f5',
          700: '#2f32e0',
          800: '#272ab5',
          900: '#26298f',
          950: '#171857',
        },
        gray: {
          950: '#0a0a0f',
        }
      }
    },
  },
  plugins: [],
}
