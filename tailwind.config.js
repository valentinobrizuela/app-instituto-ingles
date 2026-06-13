/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#d97706", // Naranja cálido
          beige: "#f5efe6",  // Beige claro
          cream: "#fffaf5",  // Crema
          brown: "#8b5e3c",  // Marrón suave
          gray: "#6b6b6b",   // Gris cálido
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
};
