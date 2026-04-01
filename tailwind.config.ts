import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 16px 50px rgba(74, 55, 32, 0.08)",
      },
      colors: {
        canvas: "#f7f1e8",
        ink: "#221f1a",
        muted: "#695e50",
        line: "#e7d8c5",
        accent: "#d96c06",
        accentSoft: "#f7d9ba",
        success: "#166534",
        warning: "#92400e",
      },
      fontFamily: {
        display: ["Avenir Next", "Avenir", "Segoe UI", "sans-serif"],
        body: ["Avenir Next", "Avenir", "Hiragino Sans", "sans-serif"],
        mono: ["SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

