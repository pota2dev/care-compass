import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-fraunces)", "serif"],
      },
      colors: {
        forest: {
          50:  "#F2F7EC",
          100: "#C8DFB0",
          200: "#9DC87A",
          300: "#7FAE5A",
          400: "#4A7C28",
          500: "#2D5016",
          600: "#1E3810",
          700: "#10200A",
        },
        cream: {
          50:  "#FEFCF8",
          100: "#FAF7F2",
          200: "#F0EBE0",
        },
        sage:  "#7FAE5A",
        mint:  "#C8DFB0",
        amber: {
          DEFAULT: "#E8A030",
          light:   "#FDF0D5",
          dark:    "#C47A10",
        },
        clay: {
          DEFAULT: "#C8593A",
          light:   "#F9EDE8",
        },
        sky: {
          DEFAULT: "#3A7AB5",
          50:      "#E3EFF8",
        },
      },
      borderRadius: {
        lg:   "0.75rem",
        md:   "0.5rem",
        sm:   "0.25rem",
        xl:   "1rem",
        "2xl":"1.25rem",
        "3xl":"1.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
