/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        hebrew: ['"Frank Ruhl Libre"', 'serif'],
      },
      animation: {
        'float-up': 'floatUp 1.2s ease-out forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'pulse-glow': 'pulseGlow 1s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'gradient-shift': 'gradientShift 6s ease infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'slide-right': 'slideRight 0.4s ease-out forwards',
        'fire': 'fire 0.6s ease-in-out infinite alternate',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-80px) scale(1.3)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(251, 191, 36, 0.9)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-6px)' },
          '80%': { transform: 'translateX(6px)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fire: {
          '0%': { transform: 'scale(1) rotate(-2deg)', filter: 'hue-rotate(0deg)' },
          '100%': { transform: 'scale(1.05) rotate(2deg)', filter: 'hue-rotate(15deg)' },
        },
      },
    },
  },
  plugins: [],
}
