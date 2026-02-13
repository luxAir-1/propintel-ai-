import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", ...defaultTheme.fontFamily.serif],
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Refined luxury palette
        slate: {
          950: "#0f172a",
          900: "#0f1729",
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
          500: "#64748b",
        },
        // Strategic accents
        teal: {
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
        },
        amber: {
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "128": "32rem",
      },
      animation: {
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "metric-reveal": "metric-reveal 0.6s ease-out forwards",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "metric-reveal": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "luxury-grad": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      },
      boxShadow: {
        "luxury": "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        "luxury-sm": "0 4px 12px -2px rgba(6, 182, 212, 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
