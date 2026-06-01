import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#f97316",
        accent2: "#fb923c",
        surface: "#0f172a",
        surface2: "#1e293b",
        "app-bg": "#030712",
        "app-border": "#334155",
        "app-text": "#f8fafc",
        "app-muted": "#94a3b8",
        "app-green": "#4ade80",
        "app-yellow": "#facc15",
        "app-red": "#f87171",
        "app-blue": "#60a5fa",
      },
      fontFamily: {
        // Reference the CSS variable injected by next/font/google
        jakarta: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
