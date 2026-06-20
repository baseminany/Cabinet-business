/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Inter for clean UI text, Fraunces (a warm serif) for headings & price.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        // Luxury system: deep walnut/espresso primary (replaces the old orange clay).
        // Existing `clay-*` usages now read as refined walnut — de-oranges the whole app.
        clay: {
          50: '#f3ece2',
          100: '#e7d8c6',
          200: '#cdb495',
          300: '#a98a66',
          400: '#7e5a3c',
          500: '#5a3b27',
          600: '#41291b',
          700: '#2e1c12',
          800: '#21140d',
          900: '#150c07',
        },
        // Named luxury tokens (use these in new components).
        obsidian: '#0b0b0a',
        charcoal: '#171412',
        espresso: '#211813',
        walnut: '#4b2e20',
        walnutSoft: '#6e4a36',
        porcelain: '#fafafa',
        warmWhite: '#ffffff',
        parchment: '#f0efec',
        champagne: '#d9c6a3',
        brass: '#b88a44',
        deepGreen: '#173b33',
        sageStone: '#73806f',
        blueStone: '#718493',
        // Warm near-black for headings + body (replaces washed-out grays).
        ink: {
          DEFAULT: '#241c15',
          soft: '#4a4038',
          muted: '#736658',
        },
        // Clean near-white surfaces (de-beiged — editorial white look).
        ivory: {
          DEFAULT: '#fafafa',
          50: '#ffffff',
          100: '#f6f6f5',
          200: '#eaeae8',
        },
        ink: {
          DEFAULT: '#14110e',
          soft: '#45403a',
          muted: '#8a847c',
        },
        // Champagne/antique-brass accent (rules, eyebrows, selected outlines).
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
        premiumCard: '0 1px 0 rgba(255,253,248,0.6) inset, 0 4px 12px rgba(20,14,8,0.06), 0 30px 60px -20px rgba(20,14,8,0.22)',
        premiumGlow: '0 0 0 1px rgba(217,198,163,0.25), 0 20px 60px -15px rgba(184,138,68,0.25)',
        darkPanel: '0 30px 80px -30px rgba(0,0,0,0.65)',
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
