/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Recoleta', 'serif'],
        body:    ['Nunito', 'sans-serif'],
      },
      colors: {
        brand: {
          pink:   '#E91E8C',
          deep:   '#C2185B',
          orange: '#FF6B35',
          coral:  '#FF8A65',
          mint:   '#26C6A0',
          bg:     '#FFF0F6',
          border: '#F8BBD0',
          active: '#FCE4EC',
          text:   '#1A1A2E',
          muted:  '#6B7280',
        },
      },
      borderRadius: {
        card: '16px',
        pill: '50px',
      },
      boxShadow: {
        card:       '0 2px 12px rgba(233,30,140,0.08)',
        'card-hover': '0 4px 20px rgba(233,30,140,0.16)',
      },
    },
  },
  plugins: [],
}
