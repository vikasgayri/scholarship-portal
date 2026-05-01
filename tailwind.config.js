/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        portal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0f766e",
          700: "#115e59",
          800: "#134e4a",
          900: "#042f2e",
        },
        ink: {
          950: "#0f172a",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        strong: "0 18px 40px rgba(15, 23, 42, 0.12)",
        inset:
          "inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(148, 163, 184, 0.12)",
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', "sans-serif"],
        serif: ['"Iowan Old Style"', '"Palatino Linotype"', "serif"],
      },
      backgroundImage: {
        "hero-orb":
          "radial-gradient(circle at top left, rgba(20, 184, 166, 0.18), transparent 38%), radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.16), transparent 28%)",
      },
    },
  },
  plugins: [],
};
