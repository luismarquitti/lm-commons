import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import app from '../index'
import { initDb, closeDb, insertPage } from '../db'
import type { Page } from '../../src/shared/types'

describe('Pages API Routes', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    initDb()
  })

  afterEach(() => {
    closeDb()
  })

  it('GET /api/pages returns empty array and total: 0 on fresh DB', async () => {
    const res = await request(app).get('/api/pages')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ pages: [], total: 0 })
  })

  it('POST /api/pages creates page and returns 201 with ID and URL', async () => {
    const payload = {
      template: 'DailyPlan',
      title: 'Plan of the Day — 2026-05-20',
      author: 'openclaw-primary',
      ttlHours: 48,
      tags: ['daily-plan', 'automated'],
      data: {
        date: '2026-05-20',
        summary: 'Focus on Mission Control Phase 1.',
        sections: [
          { heading: 'Priority', items: ['Scaffold React shell', 'Wire DailyPlan template'] }
        ]
      }
    }

    const res = await request(app)
      .post('/api/pages')
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.url).toContain(`/portal/pages/${res.body.id}`)
  })

  it('POST /api/pages rejects payloads with validation errors (400)', async () => {
    // Missing template
    let res = await request(app)
      .post('/api/pages')
      .send({
        title: 'Title',
        author: 'author',
        data: {}
      })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
    expect(res.body.details).toBeDefined()

    // Invalid template
    res = await request(app)
      .post('/api/pages')
      .send({
        template: 'Unknown',
        title: 'Title',
        author: 'author',
        data: {}
      })
    expect(res.status).toBe(400)
  })

  it('GET /api/pages?template=DailyPlan filters output', async () => {
    const p1: Page = {
      id: 'id1',
      title: 'Plan 1',
      template: 'DailyPlan',
      author: 'agent-1',
      createdAt: new Date().toISOString(),
      expiresAt: null,
      tags: [],
      payload: {}
    }
    const p2: Page = {
      id: 'id2',
      title: 'Status 1',
      template: 'AgentStatus',
      author: 'system',
      createdAt: new Date().toISOString(),
      expiresAt: null,
      tags: [],
      payload: {}
    }

    insertPage(p1)
    insertPage(p2)

    const res = await request(app).get('/api/pages?template=DailyPlan')
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(1)
    expect(res.body.pages[0].id).toBe('id1')
  })

  it('GET /api/pages/:id returns 200 with page or 404 if not found', async () => {
    const page: Page = {
      id: 'some-id',
      title: 'Page Title',
      template: 'DailyPlan',
      author: 'agent-1',
      createdAt: new Date().toISOString(),
      expiresAt: null,
      tags: [],
      payload: { value: 42 }
    }
    insertPage(page)

    // Happy path
    let res = await request(app).get('/api/pages/some-id')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('some-id')
    expect(res.body.payload).toEqual({ value: 42 })

    // 404
    res = await request(app).get('/api/pages/nonexistent')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Page not found')
  })

  it('DELETE /api/pages/:id deletes page (244/204) and returns 404 if unknown', async () => {
    const page: Page = {
      id: 'delete-id',
      title: 'Page Title',
      template: 'DailyPlan',
      author: 'agent-1',
      createdAt: new Date().toISOString(),
      expiresAt: null,
      tags: [],
      payload: {}
    }
    insertPage(page)

    // Happy path
    let res = await request(app).delete('/api/pages/delete-id')
    expect(res.status).toBe(204)

    // 404 on subsequent get
    res = await request(app).get('/api/pages/delete-id')
    expect(res.status).toBe(404)

    // 404 on delete unknown
    res = await request(app).delete('/api/pages/nonexistent')
    expect(res.status).toBe(404)
  })
})
