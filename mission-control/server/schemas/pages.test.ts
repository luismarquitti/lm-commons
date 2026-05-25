import { describe, it, expect } from 'vitest'
import { CreatePageSchema } from './pages'

describe('Zod Schemas', () => {
  it('accepts valid CreatePageRequest payload', () => {
    const payload = {
      template: 'DailyPlan',
      title: 'Plan for Today',
      author: 'agent-1',
      ttlHours: 24,
      tags: ['daily'],
      data: { tasks: [] }
    }
    const result = CreatePageSchema.safeParse(payload)
    expect(result.success).toBe(true)
  })

  it('rejects payload missing template', () => {
    const payload = {
      title: 'Plan for Today',
      author: 'agent-1',
      data: { tasks: [] }
    }
    const result = CreatePageSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it('rejects invalid template value', () => {
    const payload = {
      template: 'InvalidTemplate',
      title: 'Plan for Today',
      author: 'agent-1',
      data: { tasks: [] }
    }
    const result = CreatePageSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })
})
