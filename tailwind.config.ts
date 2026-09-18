import type { Config } from "tailwindcss";

// Tokens extracted from design/Klubbies.dc.html (Modernist design system).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f3f2f2",
        surface: "#eae9e9",
        ink: "#201e1d",
        divider: "color-mix(in srgb, #201e1d 40%, transparent)",
        neutral: {
          100: "#f8f4f4",
          200: "#eae7e7",
          300: "#d7d3d3",
          400: "#bab6b6",
          500: "#9b9797",
          600: "#7d7979",
          700: "#605d5d",
          800: "#444141",
          900: "#2d2b2b",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          100: "var(--color-accent-100)",
          200: "var(--color-accent-200)",
          300: "var(--color-accent-300)",
          400: "var(--color-accent-400)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
        },
        "accent-2": {
          DEFAULT: "var(--color-accent-2)",
          100: "var(--color-accent-2-100)",
          800: "var(--color-accent-2-800)",
        },
      },
      fontFamily: {
        heading: ["var(--font-archivo)", "system-ui", "sans-serif"],
        body: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "0px",
        md: "0px",
        lg: "0px",
      },
      boxShadow: {
        sm: "0 1px 2px color-mix(in srgb, #2d2b2b 14%, transparent)",
        md: "0 3px 10px color-mix(in srgb, #2d2b2b 16%, transparent)",
        lg: "0 12px 32px color-mix(in srgb, #2d2b2b 22%, transparent)",
      },
      fontSize: {
        h1: ["42px", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
        h2: ["32px", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
        h3: ["25px", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
        h4: ["20px", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
      },
    },
  },
};

export default config;
