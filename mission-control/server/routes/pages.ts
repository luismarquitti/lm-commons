import { Router } from 'express'
import { nanoid } from 'nanoid'
import { CreatePageSchema, ListPagesQuerySchema } from '../schemas/pages.js'
import { insertPage, getPage, listPages, deletePageById } from '../db.js'
import type { Page } from '../../src/shared/types.js'

const router = Router()

// POST /api/pages
router.post('/pages', (req, res) => {
  const result = CreatePageSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid request payload',
      details: result.error.errors
    })
  }

  const { template, title, author, ttlHours, tags, data } = result.data
  const id = nanoid(10)
  const createdAt = new Date().toISOString()
  const expiresAt = ttlHours 
    ? new Date(Date.now() + ttlHours * 3600000).toISOString()
    : null

  const newPage: Page = {
    id,
    title,
    template,
    author,
    createdAt,
    expiresAt,
    tags: tags || [],
    payload: data
  }

  insertPage(newPage)

  const host = req.get('host')
  const baseUrl = process.env.BASE_URL || `http://${host}`
  const url = `${baseUrl}/portal/pages/${id}`

  res.status(201).json({
    id,
    url
  })
})

// GET /api/pages
router.get('/pages', (req, res) => {
  const queryResult = ListPagesQuerySchema.safeParse(req.query)
  if (!queryResult.success) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: queryResult.error.errors
    })
  }

  const filters = queryResult.data
  const pages = listPages(filters)

  // Map to exclude payload in list view for performance (optional, but matching spec output is good)
  const mappedPages = pages.map(({ payload, ...meta }) => meta)

  res.json({
    pages: mappedPages,
    total: mappedPages.length
  })
})

// GET /api/pages/:id
router.get('/pages/:id', (req, res) => {
  const { id } = req.params
  const page = getPage(id)

  if (!page) {
    return res.status(404).json({
      error: 'Page not found'
    })
  }

  res.json(page)
})

// DELETE /api/pages/:id
router.get('/pages/:id', (req, res) => {
  const { id } = req.params
  const page = getPage(id)

  if (!page) {
    return res.status(404).json({
      error: 'Page not found'
    })
  }

  res.json(page)
})

// DELETE /api/pages/:id
router.delete('/pages/:id', (req, res) => {
  const { id } = req.params
  const deleted = deletePageById(id)

  if (!deleted) {
    return res.status(404).json({
      error: 'Page not found'
    })
  }

  res.status(204).end()
})

export default router
