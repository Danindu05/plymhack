import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "ui-sans-serif", "system-ui"],
        body: ["'Space Grotesk'", "ui-sans-serif", "system-ui"]
      },
      colors: {
        brand: {
          green: "#1DB954",
          dark: "#0B1724",
          light: "#E5FFF4"
        }
      }
    }
  },
  plugins: []
};

export default config;
