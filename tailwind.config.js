/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdf9f6',
          100: '#faf7f4',
          200: '#f5f0eb',
          300: '#e8e4df',
          400: '#d4cfc7',
        },
        pearl: {
          50: '#faf7f4',
          100: '#f5f0eb',
          200: '#e8e0d8',
        },
        champagne: '#f8e8dc',
        rose: {
          50: '#fdf2f0',
          100: '#fce8e4',
        },
        gold: {
          300: '#e0c078',
          400: '#d4a853',
          500: '#c9a045',
          600: '#b8953f',
        },
        'rose-gold': '#e8c4b8',
        accent: {
          indigo: '#4f46e5',
          rose: '#ec4899',
          amber: '#f59e0b',
          emerald: '#10b981',
          violet: '#8b5cf6',
        },
        slate: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          200: '#e8eaed',
          300: '#d3d6da',
          400: '#9aa0a6',
          500: '#5f6368',
          600: '#3c4043',
          700: '#2d2e30',
          800: '#1a1a2e',
          900: '#1a1a2e',
        },
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(212, 168, 83, 0.3)',
        'gold-lg': '0 10px 40px rgba(212, 168, 83, 0.4)',
        'elegant': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'elegant-lg': '0 20px 60px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #fff9f5 0%, #fef6f0 40%, #fdf8f3 70%, #faf5ef 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(212,168,83,0.3), transparent)',
        'pearl-gradient': 'linear-gradient(135deg, #ffffff 0%, #faf7f4 50%, #f5f0eb 100%)',
        'rose-gradient': 'linear-gradient(135deg, #fdf2f0 0%, #fce8e4 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};