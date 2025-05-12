import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    host: "0.0.0.0", // makes it accessible from other machines on the network
    port: 5173       // or any open port you want (instead of random)
  }
});