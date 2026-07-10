import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- the design brief §4 design tokens (authoritative) ---
        brand: "#FF385C",
        "brand-dark": "#E31C5F",
        ink: "#222222",
        muted: "#717171",
        line: "#DDDDDD",
        "line-soft": "#EBEBEB",
        bg: "#FFFFFF",
        "bg-soft": "#F7F7F7",

        // --- legacy aliases (kept until each page is migrated in §7 order) ---
        rausch: "#FF385C",
        "rausch-dark": "#E31C5F",
        babu: "#00A699",
        foggy: "#717171",
        hof: "#222222",
        border: "#DDDDDD",
      },
      backgroundImage: {
        // brand-gradient for primary CTAs (Reserve / Search / Confirm)
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
