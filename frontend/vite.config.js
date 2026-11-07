import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Use import.meta.dirname (Node 20+ ESM, Vite 8 native config loader)
      '@': `${import.meta.dirname}/src`,
    },
  },
})
