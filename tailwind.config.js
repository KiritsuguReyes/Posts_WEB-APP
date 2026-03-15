/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts,scss,css}",
    "./src/**/*.component.html",
    "./src/**/*.component.ts"
  ],
  theme: {
    extend: {
      colors: {
        'carbon-black': {
          50: '#f2f4f0',
          100: '#e5eae1',
          200: '#cbd5c3',
          300: '#b1c0a5',
          400: '#97aa88',
          500: '#7d956a',
          600: '#647755',
          700: '#4b5a3f',
          800: '#323c2a',
          900: '#191e15',
          950: '#12150f'
        },
        'black-forest': {
          50: '#eef7ee',
          100: '#ddeede',
          200: '#badebd',
          300: '#98cd9b',
          400: '#75bd7a',
          500: '#53ac59',
          600: '#428a47',
          700: '#326735',
          800: '#214524',
          900: '#112212',
          950: '#0c180c'
        },
        'hunter-green': {
          50: '#eff6ef',
          100: '#e0edde',
          200: '#c0dbbd',
          300: '#a1c99c',
          400: '#81b77b',
          500: '#62a45b',
          600: '#4e8448',
          700: '#3b6336',
          800: '#274224',
          900: '#142112',
          950: '#0e170d'
        },
        'fern': {
          50: '#eff5f1',
          100: '#dfece3',
          200: '#c0d8c6',
          300: '#a0c5aa',
          400: '#81b18e',
          500: '#619e71',
          600: '#4e7e5b',
          700: '#3a5f44',
          800: '#273f2d',
          900: '#132017',
          950: '#0e1610'
        },
        'aquamarine': {
          50: '#e9fbf2',
          100: '#d4f7e5',
          200: '#a8f0cb',
          300: '#7de8b1',
          400: '#52e097',
          500: '#26d97d',
          600: '#1fad64',
          700: '#17824b',
          800: '#0f5732',
          900: '#082b19',
          950: '#051e11'
        },
        // Semantic aliases
        'background': 'var(--color-background)',
        'surface': 'var(--color-surface)',
        'primary': 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-light': 'var(--color-primary-light)',
        'text': 'var(--color-text)',
        'muted': 'var(--color-muted)',
        'border': 'var(--color-border)',
        'error': 'var(--color-error)',
        'success': 'var(--color-success)'
      },
      borderRadius: {
        'card': '0.75rem',
        'btn': '0.5rem',
        'input': '0.375rem'
      },
      boxShadow: {
        'card': '0 1px 3px oklch(0% 0 0 / 0.08), 0 4px 12px oklch(0% 0 0 / 0.06)',
        'hover': '0 4px 16px oklch(0% 0 0 / 0.14)'
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'spin': 'spin 1s linear infinite'
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};
