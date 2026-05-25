import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../index'

describe('Agents API Routes', () => {
  it('GET /api/agents returns list of agents with name, status, lastSeen, currentTask', async () => {
    const res = await request(app)
      .get('/api/agents')
      .expect(200)

    expect(res.body).toHaveProperty('agents')
    expect(Array.isArray(res.body.agents)).toBe(true)
    expect(res.body.agents.length).toBe(3)

    const names = res.body.agents.map((a: any) => a.name)
    expect(names).toContain('Chief')
    expect(names).toContain('Bandit')
    expect(names).toContain('Nest')

    res.body.agents.forEach((agent: any) => {
      expect(agent).toHaveProperty('name')
      expect(agent).toHaveProperty('status')
      expect(agent).toHaveProperty('lastSeen')
      expect(agent).toHaveProperty('currentTask')
      expect(['active', 'idle', 'error']).toContain(agent.status)
    })
  })
})
