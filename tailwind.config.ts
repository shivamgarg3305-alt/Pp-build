import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#0A0A0A",
        fg: "#F5F5F5",
        muted: "#A3A3A3",
        card: "#121212",
        chip: "#1A1A1A",
        line: "#2A2A2A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-archivo)", "Impact", "sans-serif"],
      },
      boxShadow: {
        glow: "0 12px 40px -12px rgba(255, 255, 255, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
