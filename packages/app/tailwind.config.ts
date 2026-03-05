import { radixColors, tailwindSafelist } from './src/styles/tailwind-colors';
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ['class', '[data-theme="dark"]'],
  safelist: [
    tailwindSafelist
  ],
  theme: {
    // OVERRIDE the base theme completely instead of extending it
    colors: {
      ...radixColors,
      dls: {
        surface: "var(--dls-surface)",
        sidebar: "var(--dls-sidebar)",
        border: "var(--dls-border)",
        accent: "var(--dls-accent)",
        text: "var(--dls-text-primary)",
        secondary: "var(--dls-text-secondary)",
        hover: "var(--dls-hover)",
        active: "var(--dls-active)",
      },
      white: "#ffffff",
      black: "#000000",
      earth: {
        50: '#fdf8f6', 
        100: '#f2e8e5', 
        200: '#eaddd7', 
        800: '#4a3728', 
        900: '#2d1e16', 
      },
      flora: "#7FB069", 
      bloom: "#D36582", 
      mist: "#6DB1BF", 
      iridescent: "#A3E4D7", 
    },
    extend: {
      fontFamily: {
        sans: ["'Quicksand'", "sans-serif"], 
        display: ["'Comfortaa'", "cursive"], 
        script: ["'Caveat'", "cursive"], 
      }
    }
  }
};
