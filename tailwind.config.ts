import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#FFF8E8',
        foreground: '#212121',
        primary: {
          DEFAULT: '#FFD400',
          foreground: '#212121'
        },
        secondary: {
          DEFAULT: '#E53935',
          foreground: '#FFFFFF'
        },
        accent: {
          DEFAULT: '#FF6F00',
          foreground: '#FFFFFF'
        },
        success: {
          DEFAULT: '#16A34A',
          foreground: '#FFFFFF'
        },
        dark: {
          DEFAULT: '#111111',
          foreground: '#FFFFFF'
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#212121'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#212121'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        destructive: {
          DEFAULT: '#E53935',
          foreground: '#FFFFFF'
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      backgroundImage: {
        'gradient-yellow': 'linear-gradient(135deg, #FFD400, #FFB300)',
        'gradient-red': 'linear-gradient(135deg, #FF5252, #E53935)',
        'gradient-hero': 'linear-gradient(135deg, #FFD400, #E53935)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'float': '0 20px 40px -10px rgba(0,0,0,0.1)',
        '3d': '0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.1), 0 0 100px -10px rgba(255, 212, 0, 0.3)',
      },
      borderRadius: {
        lg: '20px',
        md: '16px',
        sm: '12px',
        xl: '24px',
        '2xl': '32px',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    }
  },
  plugins: [
    animate,
    typography,
  ],
} satisfies Config;
