import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ReactWebapp/', // 👈 CRUCIAL for GitHub Pages
  plugins: [react()],
})
