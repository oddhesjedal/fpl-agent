import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Official FPL palette
        fpl: {
          purple: "#37003c",
          purpleDark: "#2a002e",
          purpleMid: "#4a1050",
          purpleSoft: "#6b2d72",
          green: "#00ff87",
          greenDark: "#00c46a",
          pink: "#e90052",
          cyan: "#04f5ff",
        },
        pitch: "#1b9e57",
        pitchDark: "#137a42",
        ink: "#1a0820",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(55,0,60,0.08), 0 1px 2px rgba(55,0,60,0.06)",
        cardHover: "0 10px 25px rgba(55,0,60,0.12)",
      },
      backgroundImage: {
        "fpl-header": "linear-gradient(135deg, #37003c 0%, #4a1050 60%, #6b2d72 100%)",
        "fpl-pitch": "linear-gradient(180deg, #1fae60 0%, #137a42 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
