/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#0052FF',
          50: '#f0f6ff',
          100: '#e6f0ff',
          200: '#bfe0ff',
          300: '#99d1ff',
          400: '#4da8ff',
          500: '#1a7bff',
          600: '#0052FF',
          700: '#0041d1',
          800: '#0032a3',
          900: '#001e66',
        },
        accent: {
          DEFAULT: '#7C3AED',
        },
        success: '#16A34A',
        danger: '#DC2626',
        neutral: {
          900: '#0A0B0D',
          800: '#111214',
          700: '#17181A',
          600: '#1f2124',
          500: '#242629',
          400: '#6B7280',
          300: '#9CA3AF',
          200: '#D1D5DB',
          100: '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        'card-sm': '0 6px 18px rgba(2,6,23,0.5)',
        'glow-md': '0 8px 40px rgba(0,82,255,0.18)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
