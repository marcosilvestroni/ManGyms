import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "ManGyms",
        short_name: "ManGyms",
        description: "Gestione Allenamenti e Partite",
        theme_color: "#ffffff",
        icons: [
          {
            src: "logo.png",
            sizes: "192x192", // Assuming the logo is high res, might need resizing ideally but for now pointing to it
            type: "image/png",
          },
          {
            src: "logo.png", // Using the same logo for 512 as placeholder, ideally we'd resize
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
