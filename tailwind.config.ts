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
        // Brand palette
        moss: {
          50:  "#f3f5e8",
          100: "#e4e9c9",
          200: "#cbd49b",
          300: "#adb96a",
          400: "#94a247",
          500: "#7B8D3E", // primary moss green
          600: "#627134",
          700: "#4c572a",
          800: "#3a4220",
          900: "#2a3018",
          950: "#161a0c",
        },
        heliotrope: {
          50:  "#f2eef8",
          100: "#e4dcf1",
          200: "#cabde4",
          300: "#ab97d3",
          400: "#8e73c1",
          500: "#7558b3",
          600: "#4F3872", // primary heliotrope/purple
          700: "#3e2c5a",
          800: "#2f2143",
          900: "#20172e",
          950: "#120d1a",
        },
        lavender: {
          50:  "#faf8fc",
          100: "#f4f0f8",
          200: "#E8DCEE", // very light lavender
          300: "#C9B8D6", // light lavender background
          400: "#aa93bc",
          500: "#8e73a3",
          600: "#74598a",
          700: "#5b4570",
          800: "#443355",
          900: "#2e223a",
          950: "#1a1221",
        },
        brand: {
          green:        "#7B8D3E",
          purple:       "#4F3872",
          lavender:     "#C9B8D6",
          "lavender-light": "#E8DCEE",
          white:        "#FFFFFF",
        },
      },
      fontFamily: {
        sans:     ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading:  ["var(--font-montserrat)", "Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:     ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #4F3872 0%, #7B8D3E 100%)",
        "gradient-lavender":
          "linear-gradient(180deg, #E8DCEE 0%, #C9B8D6 100%)",
        "gradient-hero":
          "linear-gradient(135deg, #4F3872 0%, #3e2c5a 50%, #7B8D3E 100%)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        brand:
          "0 4px 24px 0 rgba(79, 56, 114, 0.15), 0 1px 4px 0 rgba(79, 56, 114, 0.08)",
        "brand-lg":
          "0 8px 40px 0 rgba(79, 56, 114, 0.2), 0 2px 8px 0 rgba(79, 56, 114, 0.12)",
        moss:
          "0 4px 24px 0 rgba(123, 141, 62, 0.15), 0 1px 4px 0 rgba(123, 141, 62, 0.08)",
      },
      animation: {
        "fade-in":      "fadeIn 0.4s ease-in-out",
        "slide-up":     "slideUp 0.4s ease-out",
        "slide-down":   "slideDown 0.3s ease-out",
        "scale-in":     "scaleIn 0.25s ease-out",
        "spin-slow":    "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-headings":    "#4F3872",
            "--tw-prose-links":       "#7B8D3E",
            "--tw-prose-bold":        "#4F3872",
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
