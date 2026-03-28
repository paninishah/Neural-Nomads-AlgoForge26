import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        mukta: ["Mukta", "sans-serif"],
        hind: ["Hind", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        kisan: {
          green: "hsl(var(--kisan-green))",
          "green-light": "hsl(var(--kisan-green-light))",
          yellow: "hsl(var(--kisan-yellow))",
          "yellow-muted": "hsl(var(--kisan-yellow-muted))",
          red: "hsl(var(--kisan-red))",
          parchment: "hsl(var(--kisan-parchment))",
          cream: "hsl(var(--kisan-cream))",
          soil: "hsl(var(--kisan-soil))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundColor: {
        glass: "rgba(255, 255, 255, 0.25)",
        "glass-dark": "rgba(0, 0, 0, 0.15)",
      },
      backdropBlur: {
        glass: "6px",
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
        "wheat-sway": {
          "0%, 100%": { transform: "rotate(-1.5deg) translateX(0)" },
          "25%": { transform: "rotate(0.5deg) translateX(2px)" },
          "50%": { transform: "rotate(1.5deg) translateX(-1px)" },
          "75%": { transform: "rotate(-0.5deg) translateX(1px)" },
        },
        "float-card": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "mic-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 hsl(120 52% 24% / 0.4), 0 0 0 0 hsl(120 52% 24% / 0.2)",
          },
          "50%": {
            boxShadow: "0 0 0 14px hsl(120 52% 24% / 0), 0 0 0 28px hsl(120 52% 24% / 0)",
          },
        },
        "slide-up-fade": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "stamp-in": {
          "0%": { transform: "rotate(-8deg) scale(3)", opacity: "0" },
          "60%": { transform: "rotate(-8deg) scale(0.9)", opacity: "1" },
          "100%": { transform: "rotate(-8deg) scale(1)", opacity: "0.85" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "wheat-sway": "wheat-sway 4s ease-in-out infinite",
        "float-card": "float-card 3s ease-in-out infinite",
        "mic-pulse": "mic-pulse 2s ease-in-out infinite",
        "slide-up-fade": "slide-up-fade 0.8s ease-out forwards",
        "stamp-in": "stamp-in 0.5s ease-out forwards",
        ripple: "ripple 1.5s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
