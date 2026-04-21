/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0F',
          50: '#F5F5F7',
          100: '#E8E8ED',
          200: '#C8C8D0',
          300: '#9898A8',
          400: '#68687A',
          500: '#3C3C50',
          600: '#252535',
          700: '#16161F',
          800: '#0E0E16',
          900: '#0A0A0F',
        },
        acid: {
          DEFAULT: '#C8FF00',
          dim: '#A0CC00',
          glow: '#C8FF0033',
        },
        ember: {
          DEFAULT: '#FF4D1C',
          dim: '#CC3E16',
          glow: '#FF4D1C22',
        },
        ice: {
          DEFAULT: '#00E5FF',
          dim: '#00B8CC',
          glow: '#00E5FF22',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
};
