import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: "#f4f5f7",
          surface: "#ffffff",
          border: "#e2e5eb",
          muted: "#6b7280",
          primary: "#2d6a4f",
          "primary-hover": "#1b4332",
          danger: "#b91c1c",
          "danger-hover": "#991b1b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
