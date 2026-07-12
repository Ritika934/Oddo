/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#09090b',
          900: '#121212',
          850: '#1a1a1c',
          800: '#262626',
          700: '#3f3f46',
          600: '#52525b',
          500: '#71717a',
        },
        paper: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
        },
        signal: {
          DEFAULT: '#e67e22',
          light: '#f39c12',
          dark: '#d35400',
        },
        transit: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        success: '#10b981',
        danger: '#ef4444',
        warn: '#f59e0b',
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
