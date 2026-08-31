/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Modern Indigo
          container: '#4338CA',
          light: '#EEF2FF',
          dark: '#312E81',
        },
        secondary: {
          DEFAULT: '#0284C7', // Sky Blue
          light: '#E0F2FE',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          container: {
            lowest: '#FFFFFF',
            low: '#F8FAFC',
            DEFAULT: '#F1F5F9',
            high: '#E2E8F0',
            highest: '#CBD5E1',
          }
        },
        'on-surface': '#0F172A',
        'on-surface-variant': '#475569',
        outline: {
          DEFAULT: '#64748B',
          variant: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'elevation-1': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'elevation-2': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'elevation-3': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
};
