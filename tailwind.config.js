/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/renderer/**/*.{html,tsx,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          border: 'var(--color-surface-border)'
        },
        fg: {
          DEFAULT: 'var(--color-fg)',
          muted: 'var(--color-fg-muted)',
          subtle: 'var(--color-fg-subtle)'
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          muted: 'var(--color-accent-muted)'
        }
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
}
