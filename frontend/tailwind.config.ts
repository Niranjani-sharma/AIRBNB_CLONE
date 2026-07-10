import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand stays constant across themes.
        brand: "#FF385C",
        "brand-dark": "#E31C5F",

        // Neutral tokens are CSS variables (channel triplets) so they flip in
        // dark mode automatically — see globals.css :root / .dark.
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-soft": "rgb(var(--bg-soft) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-soft": "rgb(var(--line-soft) / <alpha-value>)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(to right, #E61E4D 0%, #E31C5F 50%, #D70466 100%)",
      },
      borderRadius: {
        card: "12px",
        pill: "40px",
      },
      boxShadow: {
        card: "0 6px 16px rgba(0,0,0,0.12)",
        pill: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
      },
      maxWidth: {
        content: "2520px",
      },
    },
  },
  plugins: [],
};

export default config;
