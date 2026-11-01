import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Zero-Config Local Sync Plugin (Req 7)
// Automatically syncs data between JOB & Pealpeal on Wi-Fi without needing Supabase!
function localSyncPlugin() {
  const dataDir = path.resolve(__dirname, 'data')
  const dbFile = path.resolve(dataDir, 'db.json')

  return {
    name: 'local-sync-plugin',
    configureServer(server) {
      server.middlewares.use('/api/sync', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true })
        }

        if (req.method === 'GET') {
          if (fs.existsSync(dbFile)) {
            const data = fs.readFileSync(dbFile, 'utf-8')
            res.end(data)
          } else {
            res.end(JSON.stringify({ exists: false }))
          }
        } else if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', () => {
            try {
              if (body) {
                fs.writeFileSync(dbFile, body, 'utf-8')
                res.end(JSON.stringify({ success: true, timestamp: Date.now() }))
              } else {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Empty body' }))
              }
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localSyncPlugin()
  ],
})
