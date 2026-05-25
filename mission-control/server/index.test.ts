import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import app from './index'
import { closeDb } from './db'

describe('Express Server Foundation', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    closeDb()
  })

  it('GET /api/health returns 200 and ok status', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('GET / returns 200 when dist/client/index.html is absent', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('Mission Control API Running')
  })
})
