/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emergency: {
          red: '#EF4444',
          orange: '#F97316',
          amber: '#F59E0B',
          purple: '#8B5CF6',
          blue: '#3B82F6',
          indigo: '#6366F1',
          slate: '#64748B',
        },
        navy: {
          950: '#070a12',
          900: '#0b1120',
          850: '#0f172a',
          800: '#17223b',
          700: '#1e293b',
          600: '#334155',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'siren': 'siren 1.5s ease-in-out infinite alternate',
        'beacon': 'beacon 2.5s ease-out infinite',
      },
      keyframes: {
        siren: {
          '0%': { boxShadow: '0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(239, 68, 68, 0.85), inset 0 0 20px rgba(239, 68, 68, 0.5)' }
        },
        beacon: {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.4' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
