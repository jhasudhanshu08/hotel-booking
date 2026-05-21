/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bone: '#F5F1EA',
        cream: '#FAF7F0',
        ink: '#1A1815',
        slate: {
          deep: '#2B2A28',
        },
        ember: '#B7472A', // occupied
        moss: '#3F5E3F',  // just booked
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(63, 94, 63, 0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(63, 94, 63, 0)' },
        },
      },
    },
  },
  plugins: [],
};
