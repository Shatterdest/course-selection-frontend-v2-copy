/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "480px",
      sm: "600px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    extend: {
      colors: {
        "primary-s": "#A3C2DF",
        "secondary-s": "#334867",
        "tertiary-s": "#E9F0FA",
        "other-s": "#c1d6eb",
        'primary-g': '#C5D4A4',
        'secondary-g': '#49623C',
        'tertiary-g': '#EDFBE2',
        'other-g': '#99B76F',
      },
      spacing: {
        112: "28rem",
        128: "32rem",
        144: "36rem",
        160: "40rem",
      },
      screens: {
        xs: "480px",
      },
      boxShadow:{
        deepinner:' inset 1px 2px 6px 1px rgb(0 0 0 / 0.1)',
        
      }
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
