import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../index'

describe('Family Hub API Routes', () => {
  it('GET /api/family/tasks returns list of tasks', async () => {
    const res = await request(app)
      .get('/api/family/tasks')
      .expect(200)

    expect(res.body).toHaveProperty('tasks')
    expect(Array.isArray(res.body.tasks)).toBe(true)
    if (res.body.tasks.length > 0) {
      expect(res.body.tasks[0]).toHaveProperty('title')
      expect(res.body.tasks[0]).toHaveProperty('done')
      expect(res.body.tasks[0]).toHaveProperty('priority')
    }
  })

  it('GET /api/family/shopping returns list of shopping items', async () => {
    const res = await request(app)
      .get('/api/family/shopping')
      .expect(200)

    expect(res.body).toHaveProperty('items')
    expect(Array.isArray(res.body.items)).toBe(true)
    if (res.body.items.length > 0) {
      expect(res.body.items[0]).toHaveProperty('name')
      expect(res.body.items[0]).toHaveProperty('checked')
      expect(res.body.items[0]).toHaveProperty('department')
    }
  })

  it('GET /api/family/meals returns meal plan list', async () => {
    const res = await request(app)
      .get('/api/family/meals')
      .expect(200)

    expect(res.body).toHaveProperty('meals')
    expect(Array.isArray(res.body.meals)).toBe(true)
    if (res.body.meals.length > 0) {
      expect(res.body.meals[0]).toHaveProperty('day')
      expect(res.body.meals[0]).toHaveProperty('breakfast')
      expect(res.body.meals[0]).toHaveProperty('lunch')
      expect(res.body.meals[0]).toHaveProperty('dinner')
    }
  })

  it('GET /api/family/finance returns accounts and summary', async () => {
    const res = await request(app)
      .get('/api/family/finance')
      .expect(200)

    expect(res.body).toHaveProperty('accounts')
    expect(res.body).toHaveProperty('transactions')
    expect(res.body).toHaveProperty('summary')
    
    expect(res.body.summary).toHaveProperty('balance')
    expect(res.body.summary).toHaveProperty('income')
    expect(res.body.summary).toHaveProperty('expense')
    expect(res.body.summary).toHaveProperty('byCategory')
  })
})
