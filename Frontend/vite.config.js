import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    cors: {
      origin: /^https?:\/\/(?:.+\.)?localhost(?::\d+)?$/
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    // Ensure xterm addons are pre-bundled
    include: ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-web-links'],
  },
})
