import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * In `npm run dev`, serves the Vercel functions in api/ (only
 * /api/recently-played so far), with .env.local loaded, so the site works
 * locally without the Vercel CLI. On Vercel, the functions run as deployed.
 */
function devApi(mode: string): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv(mode, process.cwd(), 'SPOTIFY_'))
      server.middlewares.use('/api/recently-played', async (_req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/recently-played.ts')
          const reply: Response = await mod.GET()
          res.statusCode = reply.status
          reply.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(await reply.text())
        } catch (e) {
          res.statusCode = 500
          res.end(String(e))
        }
      })
    },
  }
}

// The SSR build only exists to pre-render the page into dist/index.html
// (see scripts/prerender.mjs), so it must not copy public/ a second time.
export default defineConfig(({ isSsrBuild, mode }) => ({
  plugins: [react(), devApi(mode)],
  build: {
    copyPublicDir: !isSsrBuild,
  },
}))
