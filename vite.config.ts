import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        background: "src/background/background.js",
        content: "src/content/content.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
