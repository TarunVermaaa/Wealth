// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",  // All JS/TS files in app/
    "./app/**/*.css",              // CSS files (globals.css ko include karega)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};