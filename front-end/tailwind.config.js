/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f1f6ee',
          100: '#e4eedf',
          200: '#cadcc1',
          300: '#a7c39a',
          400: '#82a773',
          500: '#648b56',
          600: '#487041',
          700: '#315e40',
          800: '#274a34',
          900: '#203c2c',
          DEFAULT: '#0056D2', // Stitch / Coursera Signature Brand Blue
          container: '#00419E',
          light: '#E8EDF5',
          dark: '#002554', // Deep Navy
          fixed: '#dae2ff',
          'fixed-dim': '#b2c5ff',
        },
        coursera: {
          DEFAULT: '#0056D2',
          blue: '#0056D2',
          darkBlue: '#002554',
          lightBlue: '#E8EDF5',
          yellow: '#F5C518',
          green: '#006D37',
          surface: '#F8FAFC',
        },
        secondary: {
          DEFAULT: '#006D37', // Stitch Green
          container: '#76f9a0',
          'on-container': '#00723a',
          light: '#E8F5E9',
        },
        tertiary: {
          DEFAULT: '#745b00',
          container: '#d0a600',
          star: '#F5C518', // Star Rating Gold
        },
        surface: {
          DEFAULT: '#F8FAFC',
          bright: '#FCF9F8',
          dim: '#DCD9D9',
          container: {
            lowest: '#FFFFFF',
            low: '#F6F3F2',
            DEFAULT: '#F0EDED',
            high: '#EAE7E7',
            highest: '#E5E2E1',
          },
        },
        'on-surface': '#1B1B1C',
        'on-surface-variant': '#424654',
        outline: {
          DEFAULT: '#737785',
          variant: '#C3C6D6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ambient: '0 1px 3px rgba(0,0,0,0.08)',
        hover: '0 4px 6px rgba(0,0,0,0.05)',
        'elevation-1':
          '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'elevation-2':
          '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'elevation-3':
          '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
