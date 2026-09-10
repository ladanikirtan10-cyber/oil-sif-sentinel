/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        oil: {
          900: '#070B14',
          850: '#0B1120',
          800: '#0F172A',
          750: '#15203B',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
          400: '#64748B',
          accent: '#0284C7',
          amber: '#F59E0B',
          red: '#EF4444',
          green: '#10B981',
          gold: '#FBBF24'
        }
      }
    },
  },
  plugins: [],
}
