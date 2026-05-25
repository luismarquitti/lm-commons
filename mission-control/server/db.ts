import Database from 'better-sqlite3'
import type { Page } from '../src/shared/types.js'

let db: Database.Database | null = null

export function getDbPath(): string {
  if (process.env.NODE_ENV === 'test') {
    return ':memory:'
  }
  return process.env.DB_PATH || '/var/lib/mission-control/data.db'
}

export function initDb(): Database.Database {
  const dbPath = getDbPath()
  db = new Database(dbPath)
  
  // Enable WAL mode
  db.pragma('journal_mode = WAL')
  
  // Create tables & indexes idempotently
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      template    TEXT NOT NULL,
      author      TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      expires_at  TEXT,
      tags        TEXT NOT NULL DEFAULT '[]',
      payload     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_pages_template   ON pages(template);
  `)
  
  return db
}

export function getDatabaseInstance(): Database.Database {
  if (!db) {
    return initDb()
  }
  return db
}

function mapRowToPage(row: any): Page {
  return {
    id: row.id,
    title: row.title,
    template: row.template,
    author: row.author,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    tags: JSON.parse(row.tags),
    payload: JSON.parse(row.payload)
  }
}

export function insertPage(page: Page): Page {
  const database = getDatabaseInstance()
  const stmt = database.prepare(`
    INSERT INTO pages (id, title, template, author, created_at, expires_at, tags, payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  stmt.run(
    page.id,
    page.title,
    page.template,
    page.author,
    page.createdAt,
    page.expiresAt,
    JSON.stringify(page.tags),
    JSON.stringify(page.payload)
  )
  
  return page
}

export function getPage(id: string): Page | undefined {
  const database = getDatabaseInstance()
  // Pages that are expired should not be retrieved?
  // Let's check requirements: "getPage() with an unknown ID returns undefined."
  // Wait, does getPage exclude expired pages? "TTL expiry — pages with expires_at < datetime('now') MUST be excluded from listPages() results."
  // It doesn't explicitly say getPage must exclude, but typically it is good if it matches listPages or if it just gets it. Let's retrieve it and we can check if it is expired if needed, or exclude it directly. Let's do a direct retrieve first.
  const stmt = database.prepare('SELECT * FROM pages WHERE id = ?')
  const row = stmt.get(id) as any
  if (!row) {
    return undefined
  }
  
  // If we want to check expiration:
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return undefined
  }

  return mapRowToPage(row)
}

export interface ListPagesFilters {
  template?: string
  tag?: string
  limit?: number
}

export function listPages(filters: ListPagesFilters = {}): Page[] {
  const database = getDatabaseInstance()
  const nowStr = new Date().toISOString()
  
  let query = `
    SELECT * FROM pages 
    WHERE (expires_at IS NULL OR expires_at >= ?)
  `
  const params: any[] = [nowStr]
  
  if (filters.template) {
    query += ' AND template = ?'
    params.push(filters.template)
  }
  
  if (filters.tag) {
    query = `
      SELECT DISTINCT pages.* FROM pages, json_each(pages.tags)
      WHERE (expires_at IS NULL OR expires_at >= ?)
      AND json_each.value = ?
    `
    params.length = 0
    params.push(nowStr, filters.tag)
    
    if (filters.template) {
      query += ' AND template = ?'
      params.push(filters.template)
    }
  }
  
  query += ' ORDER BY created_at DESC'
  
  if (filters.limit !== undefined && filters.limit !== null) {
    query += ' LIMIT ?'
    params.push(filters.limit)
  }
  
  const stmt = database.prepare(query)
  const rows = stmt.all(...params) as any[]
  
  return rows.map(mapRowToPage)
}

export function deletePageById(id: string): boolean {
  const database = getDatabaseInstance()
  const stmt = database.prepare('DELETE FROM pages WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
