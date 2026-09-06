import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

// Plugin that writes _redirects into dist after build
// Cloudflare Pages needs this for client-side routing (React Router)
function cloudflareRedirects() {
  return {
    name: 'cloudflare-redirects',
    closeBundle() {
      writeFileSync(
        resolve(__dirname, 'dist', '_redirects'),
        '/* /index.html 200\n'
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflareRedirects()],
  build: {
    outDir: 'dist',
  },
})
