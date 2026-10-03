import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The SSR build only exists to pre-render the page into dist/index.html
// (see scripts/prerender.mjs), so it must not copy public/ a second time.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    copyPublicDir: !isSsrBuild,
  },
}))
