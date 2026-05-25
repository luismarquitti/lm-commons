import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../index'

// Mock child_process properly with importOriginal
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('child_process')>()
  return {
    ...actual,
    exec: vi.fn((cmd: string, cb: any) => {
      // Mock 192.168.3.5 and 192.168.3.7 as offline, and others as online
      if (cmd.includes('192.168.3.5') || cmd.includes('192.168.3.7')) {
        cb(new Error('Host unreachable'), '', '')
      } else {
        cb(null, '64 bytes from 192.168.3.1: icmp_seq=1 ttl=64 time=1.23 ms', '')
      }
    })
  }
})

describe('Home Lab API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET /api/homelab/status returns statuses of all home lab devices', async () => {
    const res = await request(app)
      .get('/api/homelab/status')
      .expect(200)

    expect(res.body).toHaveProperty('statuses')
    expect(res.body).toHaveProperty('lastUpdated')
    expect(res.body).toHaveProperty('cached')

    const statuses = res.body.statuses
    expect(statuses['192.168.3.1']).toBe('online')
    expect(statuses['192.168.3.5']).toBe('offline')
    expect(statuses['192.168.3.6']).toBe('online')
    expect(statuses['192.168.3.7']).toBe('offline')
    expect(statuses['192.168.3.10']).toBe('online')
    expect(statuses['192.168.3.20']).toBe('online')
    expect(statuses['192.168.3.22']).toBe('online')
    expect(statuses['192.168.3.50']).toBe('online')
    expect(statuses['192.168.3.250']).toBe('online')
  })
})
