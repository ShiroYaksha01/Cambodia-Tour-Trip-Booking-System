import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#c8963e",
        'dark-green': "#117F81",
        'green-dark': "#1e3f30",
        'teal-dark': "#2d5a47",
        'bg-dark': "#111",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      backdropBlur: {
        md: '14px',
        lg: '16px',
      },
    },
  },
  plugins: [],
}

export default config