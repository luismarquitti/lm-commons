import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initDb, closeDb, insertPage, getPage, listPages, deletePageById, getDatabaseInstance } from './db'
import type { Page } from '../src/shared/types'

describe('Database Operations', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    initDb()
  })

  afterEach(() => {
    closeDb()
  })

  it('initDb creates pages table and is idempotent', () => {
    const db = getDatabaseInstance()
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pages'").all()
    expect(tables).toHaveLength(1)

    // Call initDb again to test idempotency
    expect(() => initDb()).not.toThrow()
  })

  it('insertPage persists page and getPage retrieves it', () => {
    const page: Page = {
      id: 'page1',
      title: 'Daily Plan May 22',
      template: 'DailyPlan',
      author: 'agent-1',
      createdAt: new Date().toISOString(),
      expiresAt: null,
      tags: ['plan', 'today'],
      payload: { tasks: ['scaffold', 'db'] }
    }

    const inserted = insertPage(page)
    expect(inserted).toEqual(page)

    const retrieved = getPage('page1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.id).toBe('page1')
    expect(retrieved?.title).toBe('Daily Plan May 22')
    expect(retrieved?.tags).toEqual(['plan', 'today'])
    expect(retrieved?.payload).toEqual({ tasks: ['scaffold', 'db'] })
  })

  it('getPage returns undefined for unknown or expired pages', () => {
    expect(getPage('unknown')).toBeUndefined()

    // Expired page
    const pastDate = new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    const page: Page = {
      id: 'expired1',
      title: 'Expired Plan',
      template: 'DailyPlan',
      author: 'agent-1',
      createdAt: pastDate,
      expiresAt: pastDate,
      tags: ['expired'],
      payload: {}
    }

    insertPage(page)
    expect(getPage('expired1')).toBeUndefined()
  })

  it('listPages filters by template, tag, limit, and excludes expired', () => {
    const now = new Date().toISOString()
    const futureDate = new Date(Date.now() + 3600000).toISOString() // 1 hour in future
    const pastDate = new Date(Date.now() - 3600000).toISOString() // 1 hour ago

    const pages: Page[] = [
      {
        id: 'p1',
        title: 'Plan 1',
        template: 'DailyPlan',
        author: 'agent-1',
        createdAt: new Date(Date.now() - 1000).toISOString(),
        expiresAt: futureDate,
        tags: ['plan', 'active'],
        payload: {}
      },
      {
        id: 'p2',
        title: 'Status 1',
        template: 'AgentStatus',
        author: 'system',
        createdAt: new Date(Date.now() - 2000).toISOString(),
        expiresAt: null,
        tags: ['status', 'active'],
        payload: {}
      },
      {
        id: 'p3',
        title: 'Plan Expired',
        template: 'DailyPlan',
        author: 'agent-1',
        createdAt: new Date(Date.now() - 3000).toISOString(),
        expiresAt: pastDate,
        tags: ['plan'],
        payload: {}
      }
    ]

    for (const p of pages) {
      insertPage(p)
    }

    // List all active pages (p3 is expired, so only p1 and p2 should be returned)
    const activePages = listPages()
    expect(activePages).toHaveLength(2)
    expect(activePages.map(p => p.id)).toContain('p1')
    expect(activePages.map(p => p.id)).toContain('p2')

    // Filter by template
    const dailyPlans = listPages({ template: 'DailyPlan' })
    expect(dailyPlans).toHaveLength(1)
    expect(dailyPlans[0].id).toBe('p1')

    // Filter by tag
    const statusPages = listPages({ tag: 'status' })
    expect(statusPages).toHaveLength(1)
    expect(statusPages[0].id).toBe('p2')

    // Filter by template and tag
    const plansWithActiveTag = listPages({ template: 'DailyPlan', tag: 'active' })
    expect(plansWithActiveTag).toHaveLength(1)
    expect(plansWithActiveTag[0].id).toBe('p1')

    // Limit
    const limited = listPages({ limit: 1 })
    expect(limited).toHaveLength(1)
  })

  it('deletePageById deletes the page and getPage returns undefined', () => {
    const page: Page = {
      id: 'delete-me',
      title: 'Temp Plan',
      template: 'DailyPlan',
      author: 'agent-1',
      createdAt: new Date().toISOString(),
      expiresAt: null,
      tags: [],
      payload: {}
    }

    insertPage(page)
    expect(getPage('delete-me')).toBeDefined()

    const deleted = deletePageById('delete-me')
    expect(deleted).toBe(true)

    expect(getPage('delete-me')).toBeUndefined()
    
    // Deleting again returns false
    expect(deletePageById('delete-me')).toBe(false)
  })
})
