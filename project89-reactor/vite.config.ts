import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const poseOutputDir = path.resolve(__dirname, 'src/poses')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'pose-export-endpoint',
      configureServer(server) {
        server.middlewares.use('/__pose-export', (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405)
            res.end('Method not allowed')
            return
          }

          let raw = ''
          req.on('data', (chunk) => {
            raw += chunk
          })
          req.on('end', () => {
            try {
              const payload = JSON.parse(raw || '{}')
              const { poseId, data } = payload
              if (!poseId || !data) {
                res.writeHead(400)
                res.end('Missing poseId or data')
                return
              }
              const safeId = String(poseId).replace(/[^a-zA-Z0-9-_]/g, '')
              const filePath = path.join(poseOutputDir, `${safeId}.json`)
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true, filePath }))
            } catch (err) {
              console.error('[pose-export] failed', err)
              res.writeHead(500)
              res.end('Failed to save pose')
            }
          })
        })
      },
    },
  ],
})
