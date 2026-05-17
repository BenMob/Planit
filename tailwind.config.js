/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/renderer/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1419',
          raised: '#1a2332',
          border: '#2d3a4f'
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          muted: '#1e3a5f'
        }
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
}
