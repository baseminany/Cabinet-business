/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Editorial serif for high-end moments; Inter for precise product UI.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        // Keep clay as a backward-compatible alias, but shift it to walnut/espresso.
        clay: {
          50: '#f4efe8',
          100: '#e8dbcb',
          200: '#d1b99c',
          300: '#af8e69',
          400: '#835f42',
          500: '#5c3d2a',
          600: '#432b1d',
          700: '#2f1d13',
          800: '#21140d',
          900: '#140c08',
        },
        obsidian: '#0b0b0a',
        charcoal: '#171412',
        espresso: '#211813',
        walnut: '#4b2e20',
        walnutSoft: '#6e4a36',
        porcelain: '#f7f3ea',
        warmWhite: '#fffdf8',
        parchment: '#ece1cf',
        champagne: '#d9c6a3',
        brass: '#b88a44',
        deepGreen: '#173b33',
        sageStone: '#73806f',
        blueStone: '#718493',
        plaster: '#e9e1d2',
        oakFloor: '#b98555',
        ink: {
          DEFAULT: '#14110e',
          soft: '#45403a',
          muted: '#8a847c',
        },
        ivory: {
          DEFAULT: '#faf8f3',
          50: '#fffdf8',
          100: '#f7f3ea',
          200: '#e7dcc8',
        },
        gold: {
          300: '#e2cfa6',
          400: '#d2b67e',
          500: '#b88a44',
          600: '#9a7338',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,14,8,0.05), 0 10px 28px rgba(20,14,8,0.07)',
        card: '0 2px 6px rgba(20,14,8,0.07), 0 18px 44px rgba(20,14,8,0.12)',
        lift: '0 12px 28px rgba(20,14,8,0.18)',
        premiumCard: '0 1px 0 rgba(255,253,248,0.68) inset, 0 10px 24px rgba(20,14,8,0.08), 0 42px 80px -32px rgba(20,14,8,0.32)',
        premiumGlow: '0 0 0 1px rgba(217,198,163,0.28), 0 26px 80px -22px rgba(184,138,68,0.38)',
        darkPanel: '0 34px 90px -35px rgba(0,0,0,0.72)',
      },
      borderRadius: {
        control: '14px',
        card: '24px',
        panel: '32px',
      },
    },
  },
  plugins: [],
};