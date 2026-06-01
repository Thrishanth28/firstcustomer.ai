import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        accent:   "var(--accent)",
        surface:  "var(--surface)",
        surface2: "var(--surface2)",
        surface3: "var(--surface3)",
        border:   "var(--border)",
        border2:  "var(--border2)",
        "app-text":   "var(--text)",
        "app-text2":  "var(--text2)",
        "app-text3":  "var(--text3)",
        "app-green":  "var(--green)",
        "app-red":    "var(--red)",
        "app-yellow": "var(--yellow)",
        "app-blue":   "var(--blue)",
      },
    },
  },
  plugins: [],
};

export default config;
