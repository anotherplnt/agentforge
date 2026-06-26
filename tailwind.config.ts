import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        space: ["var(--font-space)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        inter: ["var(--font-sans)"],
      },
      colors: {
        // Single accent: warm gold (settlement / money coded). Keys kept as
        // primary+accent so existing pages inherit the new palette unchanged.
        primary: {
          50: "#fbf6ec",
          100: "#f6e9cd",
          200: "#eecf94",
          300: "#e6b95f",
          400: "#dca942",
          500: "#c8922f",
          600: "#a87526",
          700: "#855a21",
          800: "#5f4019",
          900: "#3f2b12",
          950: "#241809",
        },
        accent: {
          50: "#fbf6ec",
          100: "#f6e9cd",
          200: "#eecf94",
          300: "#e6b95f",
          400: "#dca942",
          500: "#c8922f",
          600: "#a87526",
          700: "#855a21",
          800: "#5f4019",
          900: "#3f2b12",
        },
        // Warm ink ramp (near-black, never pure #000).
        dark: {
          50: "#ededef",
          100: "#d9d9dd",
          200: "#b8b8bf",
          300: "#8d8d96",
          400: "#6a6a73",
          500: "#4a4a52",
          600: "#34343a",
          700: "#252529",
          800: "#1a1a1d",
          900: "#131315",
          950: "#0a0a0b",
        },
        ink: {
          DEFAULT: "#0a0a0b",
          soft: "#131315",
          line: "#252529",
        },
        cyber: {
          blue: "#dca942",
          cyan: "#e6b95f",
          purple: "#c8922f",
          soft: "#ededef",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
