/**
 * Shared Tailwind preset. Tailwind is scoped to utility classes only
 * (spacing/layout/flex helpers) and its preflight is disabled so it never
 * fights MUI's CSS baseline/theme, which owns color, typography and
 * component styling.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9eaff',
          500: '#2f6fed',
          600: '#1f56c9',
          700: '#1a459e',
        },
        surface: {
          light: '#ffffff',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
