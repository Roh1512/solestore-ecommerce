/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],

  daisyui: {
    themes: [
      {
        acid: {
          ...require("daisyui/src/theming/themes")["acid"],
          primary: "#000000",
          "primary-content": "#FFFFFF",
          secondary: "#545350",
          success: "#06402B",
          "secondary-content": "white",
          accent: "#cdc4cf",
          "accent-content": "#000000",
          error: "#5e0000",
          "error-content": "white",
        },
        coffee: {
          ...require("daisyui/src/theming/themes")["coffee"],
          success: "#06402B",
          "success-content": "white",
          error: "#5e0000",
          "error-content": "white",
        },
      },
      "coffee",
      "acid",
    ], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "coffee", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
};
