import express from 'express'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './db.js'

import pagesRouter from './routes/pages.js'
import agentsRouter from './routes/agents.js'
import homelabRouter from './routes/homelab.js'
import familyRouter from './routes/family.js'

const app = express()
app.use(morgan('dev'))
app.use(express.json())

// Initialize SQLite database
initDb()

const PORT = process.env.PORT || 3001

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', pagesRouter)
app.use('/api', agentsRouter)
app.use('/api', homelabRouter)
app.use('/api', familyRouter)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientPath = path.join(__dirname, '../client')

app.use(express.static(clientPath))

// Fallback all non-API routes to React SPA index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next()
  }
  res.sendFile(path.join(clientPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Mission Control API Running. (Client build not found)')
    }
  })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

export default app
