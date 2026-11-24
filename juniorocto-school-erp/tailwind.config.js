/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14335E", aqua: "#3FB6C9", sun: "#FFC24B", foam: "#EAF6F8", reef: "#0D2545",
        navy:  { DEFAULT: "#14335E", 900: "#0E2747", 700: "#1E4576", 600: "#2C5688" },
        royal: { DEFAULT: "#1651A3", 600: "#113F82", 500: "#2E6BC4", 100: "#E1ECF9" },
        coral: { DEFAULT: "#E85410", 600: "#C8470A", 500: "#F7714E", 100: "#FDE6DB" },
        sea:   { DEFAULT: "#446D98", 100: "#E7EEF6" },
        cream: { DEFAULT: "#F2F6FC", 200: "#E7EFF9" },
      },
      fontFamily: {
        display: ['"Fredoka"', "system-ui", "sans-serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: { blob: "1.4rem", xl2: "20px", xl3: "26px" },
      boxShadow: {
        glass: "0 12px 44px rgba(30,54,79,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
        soft: "0 6px 22px rgba(30,54,79,0.08)",
        lift: "0 24px 60px -18px rgba(20,51,94,.28)",
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        pop: { "0%": { transform: "scale(.96)", opacity: 0 }, "100%": { transform: "scale(1)", opacity: 1 } },
      },
      animation: { floaty: "floaty 6s ease-in-out infinite", pop: "pop .18s ease-out" },
    },
  },
  plugins: [],
};
