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
        // Single accent: cobalt blue (intelligence / trust coded) with cyan
        // highlight. Keys kept as primary+accent so existing pages inherit
        // the new palette unchanged.
        primary: {
          50: "#eef2ff",
          100: "#dbe4ff",
          200: "#b8caff",
          300: "#8aa8ff",
          400: "#5c83ff",
          500: "#3b6bff",
          600: "#2b4fe0",
          700: "#213cb4",
          800: "#1a2f88",
          900: "#15265e",
          950: "#0d1838",
        },
        accent: {
          50: "#eef2ff",
          100: "#dbe4ff",
          200: "#b8caff",
          300: "#8aa8ff",
          400: "#5c83ff",
          500: "#3b6bff",
          600: "#2b4fe0",
          700: "#213cb4",
          800: "#1a2f88",
          900: "#15265e",
        },
        // Cool ink ramp (near-black, faint blue tint, never pure #000).
        dark: {
          50: "#eceef2",
          100: "#d6dae2",
          200: "#b3bac7",
          300: "#8a93a6",
          400: "#666f82",
          500: "#474f5e",
          600: "#323844",
          700: "#232732",
          800: "#181b24",
          900: "#11131a",
          950: "#080910",
        },
        ink: {
          DEFAULT: "#080910",
          soft: "#11131a",
          line: "#232732",
        },
        cyber: {
          blue: "#3b6bff",
          cyan: "#22d3ee",
          purple: "#5c83ff",
          soft: "#eceef2",
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
