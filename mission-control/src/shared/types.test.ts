import { describe, it, expect } from 'vitest'
import type { TemplateId, Page, CreatePageRequest, CreatePageResponse } from './types'

describe('shared types', () => {
  it('accepts valid TemplateId values', () => {
    const ids: TemplateId[] = ['DailyPlan', 'LinearTaskBoard', 'AgentStatus', 'CompozyTasks']
    expect(ids).toHaveLength(4)
  })

  it('CreatePageRequest accepts all required fields', () => {
    const req: CreatePageRequest = {
      template: 'DailyPlan',
      title: 'Test Plan',
      author: 'agent-test',
      data: { date: '2026-05-22' },
    }
    expect(req.template).toBe('DailyPlan')
  })

  it('CreatePageRequest accepts optional fields', () => {
    const req: CreatePageRequest = {
      template: 'DailyPlan',
      title: 'Test Plan',
      author: 'agent-test',
      ttlHours: 48,
      tags: ['test'],
      data: {},
    }
    expect(req.ttlHours).toBe(48)
    expect(req.tags).toEqual(['test'])
  })

  it('Page type has all required fields', () => {
    const page: Page = {
      id: 'abc123',
      title: 'Test Page',
      template: 'DailyPlan',
      author: 'system',
      createdAt: new Date().toISOString(),
      expiresAt: null,
      tags: [],
      payload: {},
    }
    expect(page.id).toBe('abc123')
    expect(page.expiresAt).toBeNull()
  })

  it('CreatePageResponse has id and url', () => {
    const res: CreatePageResponse = {
      id: 'abc123',
      url: 'http://lm-claw:3001/portal/pages/abc123',
    }
    expect(res.url).toContain('/portal/pages/')
  })
})
