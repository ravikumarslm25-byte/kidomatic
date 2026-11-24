export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { ink: "#14335E", royal: "#1651A3", aqua: "#3FB6C9", coral: "#E85410", sun: "#FFC24B", foam: "#EAF6F8", reef: "#0D2545" },
      fontFamily: { display: ["Fredoka", "sans-serif"], sans: ["Manrope", "sans-serif"] },
      borderRadius: { blob: "1.4rem", xl3: "2rem" },
      boxShadow: { soft: "0 18px 50px -12px rgba(20,51,94,.18)", lift: "0 24px 60px -18px rgba(20,51,94,.28)" },
      maxWidth: { "7xl": "80rem" },
    },
  },
};
