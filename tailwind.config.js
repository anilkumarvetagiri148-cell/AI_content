/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0B081D',
        surface: '#17132E',
        'surface-light': '#211C40',
        electric: '#7C4DFF',
        violet: '#9D7BFF',
        cta: '#FF7A1A',
        'cta-hover': '#FF8F3D',
        lavender: '#B9B3D0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at 20% 20%, rgba(124, 77, 255, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255, 122, 26, 0.15) 0%, transparent 45%)',
        'card-gradient': 'linear-gradient(145deg, rgba(23, 19, 46, 0.85) 0%, rgba(11, 8, 29, 0.92) 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 30px -5px rgba(124, 77, 255, 0.4)',
        'glow-orange': '0 0 30px -5px rgba(255, 122, 26, 0.45)',
      }
    },
  },
  plugins: [],
}
