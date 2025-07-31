import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
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
        // Madagascar brand colors
        madagascar: {
          50: "hsl(var(--madagascar-50))",
          100: "hsl(var(--madagascar-100))",
          200: "hsl(var(--madagascar-200))",
          300: "hsl(var(--madagascar-300))",
          400: "hsl(var(--madagascar-400))",
          500: "hsl(var(--madagascar-500))",
          600: "hsl(var(--madagascar-600))",
          700: "hsl(var(--madagascar-700))",
          800: "hsl(var(--madagascar-800))",
          900: "hsl(var(--madagascar-900))",
        },
        ocean: {
          50: "hsl(var(--ocean-50))",
          100: "hsl(var(--ocean-100))",
          200: "hsl(var(--ocean-200))",
          300: "hsl(var(--ocean-300))",
          400: "hsl(var(--ocean-400))",
          500: "hsl(var(--ocean-500))",
          600: "hsl(var(--ocean-600))",
          700: "hsl(var(--ocean-700))",
          800: "hsl(var(--ocean-800))",
          900: "hsl(var(--ocean-900))",
        },
        forest: {
          50: "hsl(var(--forest-50))",
          100: "hsl(var(--forest-100))",
          200: "hsl(var(--forest-200))",
          300: "hsl(var(--forest-300))",
          400: "hsl(var(--forest-400))",
          500: "hsl(var(--forest-500))",
          600: "hsl(var(--forest-600))",
          700: "hsl(var(--forest-700))",
          800: "hsl(var(--forest-800))",
          900: "hsl(var(--forest-900))",
        },
        sunset: {
          50: "hsl(var(--sunset-50))",
          100: "hsl(var(--sunset-100))",
          200: "hsl(var(--sunset-200))",
          300: "hsl(var(--sunset-300))",
          400: "hsl(var(--sunset-400))",
          500: "hsl(var(--sunset-500))",
          600: "hsl(var(--sunset-600))",
          700: "hsl(var(--sunset-700))",
          800: "hsl(var(--sunset-800))",
          900: "hsl(var(--sunset-900))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
