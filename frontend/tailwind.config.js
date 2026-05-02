export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a",
        "primary-light": "#3b82f6",
        bg: "#f8fafc",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};