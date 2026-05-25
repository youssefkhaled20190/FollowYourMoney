/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {

      /* =========================
       * Fonts
       * ========================= */
      fontFamily: {
        Cairo: ['"Cairo"', 'sans-serif'],

        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],

        "headline-lg": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],

        "label-caps": ["Inter", "sans-serif"],

        "currency-display": ["JetBrains Mono", "monospace"],
        "currency-table": ["JetBrains Mono", "monospace"],
      },

      /* =========================
       * Breakpoints
       * ========================= */
      screens: {
        // ── Mobile ──────────────────────────
        "xs": "320px",   // Small phones (iPhone SE)
        "sm": "390px",   // Standard phones (iPhone 14, Pixel 7)
        "md": "430px",   // Large phones (iPhone 14 Plus, Pro Max)

        // ── Tablet ──────────────────────────
        "tab-sm": "600px",    // Small tablets / large phones landscape
        "tab-md": "768px",    // iPad Mini / iPad portrait
        "tab-lg": "1024px",   // iPad Pro 11" / iPad Air landscape

        // ── Desktop / Web App ───────────────
        "lg": "1280px",  // Small laptops / desktops
        "xl": "1440px",  // Standard desktops / MacBook Pro 14"
        "2xl": "1680px",  // Wide desktops

        // ── Large / TV ──────────────────────
        "3xl": "1920px",  // Full HD
        "4xl": "2560px",  // 2K / QHD
        "tv": "3840px",  // 4K UHD
      },
      /* =========================
       * Colors
       * ========================= */
      colors: {
        primary: "#003b5a",
        secondary: "#006397",

        background: "#f7fafc",
        surface: "#f7fafc",

        "surface-bright": "#f7fafc",
        "surface-dim": "#d7dadc",

        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f4f6",
        "surface-container": "#ebeef0",
        "surface-container-high": "#e5e9eb",
        "surface-container-highest": "#e0e3e5",

        "surface-variant": "#e0e3e5",

        "on-surface": "#181c1e",
        "on-surface-variant": "#41474e",
        "on-background": "#181c1e",

        "primary-container": "#1a5276",
        "primary-fixed": "#cbe6ff",
        "primary-fixed-dim": "#9bccf6",

        "on-primary": "#ffffff",
        "on-primary-container": "#94c5ee",
        "on-primary-fixed": "#001e30",
        "on-primary-fixed-variant": "#0e4b6e",

        "secondary-container": "#71c0fe",
        "secondary-fixed": "#cce5ff",
        "secondary-fixed-dim": "#92ccff",

        "on-secondary": "#ffffff",
        "on-secondary-container": "#004d77",
        "on-secondary-fixed": "#001d31",
        "on-secondary-fixed-variant": "#004b73",

        tertiary: "#4d3100",
        "tertiary-container": "#6b4604",
        "tertiary-fixed": "#ffddb3",
        "tertiary-fixed-dim": "#f2bd74",

        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#eab66d",
        "on-tertiary-fixed": "#291800",
        "on-tertiary-fixed-variant": "#633f00",

        error: "#ba1a1a",
        "error-container": "#ffdad6",

        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        outline: "#72787f",
        "outline-variant": "#c1c7cf",

        "surface-tint": "#2f6388",

        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eef1f3",
        "inverse-primary": "#9bccf6",
      },

      /* =========================
       * Border Radius
       * ========================= */
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },

      /* =========================
       * Spacing
       * ========================= */
      spacing: {
        18: "4.5rem",
        88: "22rem",
        100: "25rem",
        128: "32rem",

        container_max_width: "1280px",
        base_unit: "8px",
        sidebar_width: "280px",
        margin_mobile: "16px",
        gutter: "24px",
      },

      /* =========================
       * Font Sizes
       * ========================= */
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        tv: ["8rem", { lineHeight: "1.1" }],

        "body-md": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: "400",
          },
        ],

        "body-lg": [
          "18px",
          {
            lineHeight: "28px",
            fontWeight: "400",
          },
        ],

        "body-sm": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "400",
          },
        ],

        "headline-lg": [
          "32px",
          {
            lineHeight: "40px",
            letterSpacing: "-0.02em",
            fontWeight: "700",
          },
        ],

        "headline-lg-mobile": [
          "24px",
          {
            lineHeight: "32px",
            fontWeight: "700",
          },
        ],

        "headline-md": [
          "20px",
          {
            lineHeight: "28px",
            fontWeight: "600",
          },
        ],

        "label-caps": [
          "12px",
          {
            lineHeight: "16px",
            letterSpacing: "0.05em",
            fontWeight: "600",
          },
        ],

        "currency-display": [
          "24px",
          {
            lineHeight: "32px",
            letterSpacing: "-0.01em",
            fontWeight: "500",
          },
        ],

        "currency-table": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "500",
          },
        ],
      },
    },
  },

  plugins: [],
};