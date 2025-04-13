import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
        "gradient-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        aurora: "aurora 60s linear infinite",
        "gradient-shift": "gradient-shift 60s ease infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Comment out the custom plugin
    /*
    plugin(({ addBase, theme }) => {
      // Define CSS variables for colors
      const colors = theme("colors")
      // Explicitly type colorVariables and initialize
      const colorVariables: Record<string, string> = {}

      // Check if colors is defined before proceeding
      if (colors) {
        // Flatten the nested color object and create CSS variables
        Object.entries(colors).forEach(([colorName, colorValue]) => {
          if (typeof colorValue === "object" && colorValue !== null) { // Added null check for robustness
            Object.entries(colorValue).forEach(([shade, value]) => {
              // Ensure value is a string before assigning
              if (typeof value === 'string') { 
                if (shade === "DEFAULT") {
                  colorVariables[`--${colorName}`] = value
                } else {
                  colorVariables[`--${colorName}-${shade}`] = value
                }
              }
            })
          } else if (typeof colorValue === 'string') { // Handle top-level string colors
            colorVariables[`--${colorName}`] = colorValue
          }
        })
      }

      // Add the variables to the :root selector
      addBase({
        ":root": {
          ...colorVariables,
          // Add transparent variable which is used in the aurora background
          "--transparent": "transparent",
        }
      })
    }),
    */
  ],
} satisfies Config

export default config

