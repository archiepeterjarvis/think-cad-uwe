import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-primary/10",
    "text-primary",
    "bg-teal/10",
    "text-teal",
    "bg-purple/10",
    "text-purple",
    "bg-pink/10",
    "text-pink",
    "hover:text-white",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#eef9ff",
          100: "#dcf3ff",
          200: "#b2e8ff",
          300: "#6dd8ff",
          400: "#22c0ff",
          500: "#00a3ff",
          600: "#0080d9",
          700: "#0066b0",
          800: "#005691",
          900: "#0a4877",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        pink: {
          DEFAULT: "#D99AC5",
        },
        orange: {
          DEFAULT: "#FF6B35",
          50: "#fff3ee",
          100: "#ffe5d7",
          200: "#ffc7ae",
          300: "#ffa077",
          400: "#ff7a47",
          500: "#ff6b35",
          600: "#ff4005",
          700: "#cc2700",
          800: "#a82300",
          900: "#8a2100",
        },
        teal: {
          DEFAULT: "#2EC4B6",
          50: "#e9faf8",
          100: "#c8f1ed",
          200: "#97e5de",
          300: "#5ed3c8",
          400: "#2ec4b6",
          500: "#1ca99c",
          600: "#158a80",
          700: "#156f68",
          800: "#155a55",
          900: "#164b47",
        },
        purple: {
          DEFAULT: "#7209B7",
          50: "#f6eeff",
          100: "#eddeff",
          200: "#dbbdff",
          300: "#c48dff",
          400: "#ab57ff",
          500: "#9724ff",
          600: "#8a00ff",
          700: "#7209b7",
          800: "#5d0a95",
          900: "#4c0d77",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        pulse: "pulse 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
