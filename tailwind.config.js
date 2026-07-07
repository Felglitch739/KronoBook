/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dfx: {
          matte: '#111111',
          graphite: '#2B2B2B',
          purple: '#6E3BFF',
          white: '#FFFFFF',
          offwhite: '#E5E5E5'
        },
        tenant: {
          primary: 'rgb(var(--tenant-primary) / <alpha-value>)',
          background: 'rgb(var(--tenant-background) / <alpha-value>)',
          card: 'rgb(var(--tenant-card) / <alpha-value>)',
          text: 'rgb(var(--tenant-text) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
