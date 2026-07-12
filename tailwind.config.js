/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070B14',
          900: '#0B1220',
          850: '#0F1729',
          800: '#141B2D',
          700: '#1B2438',
          600: '#2A3550',
          500: '#3E4B6B',
        },
        paper: {
          50: '#F7F8FA',
          100: '#EEF0F4',
          200: '#E2E6ED',
        },
        signal: {
          DEFAULT: '#E8A33D',
          light: '#F3C57A',
          dark: '#C1811F',
        },
        transit: {
          DEFAULT: '#3DA5A0',
          light: '#6FC4C0',
          dark: '#2A7C78',
        },
        success: '#3FAE6B',
        danger: '#E15554',
        warn: '#E8A33D',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        plate: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
}
