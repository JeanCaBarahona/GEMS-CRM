/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      "colors": {
        "primary": {
          DEFAULT: "#52c2ef",
          "50": "#f0f9ff",
          "100": "#e0f2fe",
          "200": "#bae6fd",
          "300": "#7dd3fc",
          "400": "#38bdf8",
          "500": "#52c2ef",
          "600": "#0ea5e9",
          "700": "#0284c7",
          "800": "#075985",
          "900": "#0c4a6e",
          "container": "#e0f2fe",
          "fixed": "#bae6fd",
        },
        "secondary": {
          DEFAULT: "#6690a3",
          "50": "#f8fafc",
          "100": "#f1f5f9",
          "200": "#e2e8f0",
          "300": "#cbd5e1",
          "400": "#94a3b8",
          "500": "#6690a3",
          "600": "#475569",
          "container": "#f1f5f9",
          "fixed": "#e2e8f0",
        },
        "tertiary": {
          DEFAULT: "#f6ae45",
          "container": "#fef3c7",
          "fixed": "#fde68a",
        },
        "error": {
          DEFAULT: "#ef4444",
          "container": "#fee2e2",
        },
        "background": "#f8fafc",
        "surface": {
          DEFAULT: "#ffffff",
          "variant": "#f1f5f9",
          "dim": "#e2e8f0",
          "bright": "#ffffff",
          "container": {
            DEFAULT: "#f8fafc",
            "low": "#ffffff",
            "high": "#f1f5f9",
            "highest": "#e2e8f0",
            "lowest": "#ffffff",
          }
        },
        "on": {
          "primary": "#ffffff",
          "primary-container": "#0c4a6e",
          "primary-fixed": "#075985",
          "primary-fixed-variant": "#0284c7",
          "secondary": "#ffffff",
          "secondary-container": "#1e293b",
          "secondary-fixed": "#334155",
          "secondary-fixed-variant": "#475569",
          "tertiary": "#ffffff",
          "tertiary-container": "#92400e",
          "tertiary-fixed": "#b45309",
          "tertiary-fixed-variant": "#d97706",
          "surface": "#0f172a",
          "surface-variant": "#475569",
          "error": "#ffffff",
          "error-container": "#991b1b",
          "background": "#0f172a",
        },
        "outline": "#cbd5e1",
        "outline-variant": "#e2e8f0",
        "inverse-surface": "#1e293b",
        "inverse-on-surface": "#f8fafc",
        "inverse-primary": "#7dd3fc",
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "container-padding": "24px",
        "base": "8px",
        "gutter": "16px",
        "toolbar-height": "64px",
        "sidebar-width": "280px"
      },
      "fontFamily": {
        "label-md": ["Inter"],
        "headline-lg-mobile": ["Inter"],
        "headline-md": ["Inter"],
        "headline-xl": ["Inter"],
        "label-sm": ["Inter"],
        "headline-lg": ["Inter"],
        "body-lg": ["Inter"],
        "body-md": ["Inter"]
      },
      "fontSize": {
        "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "headline-xl": ["36px", {"lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "label-sm": ["11px", {"lineHeight": "14px", "fontWeight": "500"}],
        "headline-lg": ["28px", {"lineHeight": "36px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}]
      }
    }
  },
  plugins: [],
}
