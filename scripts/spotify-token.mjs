// One-time setup for "Recently played": gets a Spotify refresh token that lets
// api/recently-played.ts read your listening history.
//
// 1. Create an app at https://developer.spotify.com/dashboard and add this
//    redirect URI to it: http://127.0.0.1:8888/callback
// 2. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local
// 3. Run `npm run spotify:token`, open the link it prints, and approve.
// 4. Copy the SPOTIFY_REFRESH_TOKEN it prints into .env.local and into the
//    Vercel project's environment variables (with the other two).
import fs from 'node:fs'
import http from 'node:http'

const REDIRECT = 'http://127.0.0.1:8888/callback'
const SCOPE = 'user-read-recently-played'

function readEnv(file) {
  if (!fs.existsSync(file)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2].replace(/^['"]|['"]$/g, '')]),
  )
}

const env = { ...readEnv('.env.local'), ...process.env }
const id = env.SPOTIFY_CLIENT_ID
const secret = env.SPOTIFY_CLIENT_SECRET
if (!id || !secret) {
  console.error('Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local first.')
  process.exit(1)
}

const state = Math.random().toString(36).slice(2)
const authorize = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  client_id: id,
  response_type: 'code',
  redirect_uri: REDIRECT,
  scope: SCOPE,
  state,
})}`

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT)
  if (url.pathname !== '/callback') return res.writeHead(404).end()
  const code = url.searchParams.get('code')
  if (!code || url.searchParams.get('state') !== state) {
    res.writeHead(400).end('Spotify did not approve the request. Close this tab and try again.')
    return
  }
  const token = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT }),
  }).then((r) => r.json())
  if (!token.refresh_token) {
    res.writeHead(500).end('No refresh token came back. See the terminal.')
    console.error(token)
  } else {
    res.writeHead(200, { 'content-type': 'text/plain' }).end('Done. You can close this tab and go back to the terminal.')
    console.log(`\nAdd this to .env.local and to Vercel's environment variables:\n\nSPOTIFY_REFRESH_TOKEN=${token.refresh_token}\n`)
  }
  server.close()
})

server.listen(8888, '127.0.0.1', () => {
  console.log(`Open this link, sign in to Spotify and approve:\n\n${authorize}\n`)
})
