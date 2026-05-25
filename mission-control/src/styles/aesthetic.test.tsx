import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Sidebar from '../components/Sidebar'
import AgentStatus from '../components/dashboards/AgentStatus'
import DailyPlan from '../templates/DailyPlan'
import type { Page } from '../shared/types'

describe('Mission Control BEM CSS Classes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders Sidebar with sidebar BEM block class', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ pages: [], total: 0 }),
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    expect(container.querySelector('.sidebar')).toBeInTheDocument()
    expect(container.querySelector('.sidebar__brand')).toBeInTheDocument()
    expect(container.querySelector('.sidebar__nav')).toBeInTheDocument()
  })

  it('renders AgentStatus with agent-status BEM block class and status badges modifiers', async () => {
    const mockResponse = {
      agents: [
        {
          name: 'Chief',
          status: 'active',
          lastSeen: '2026-05-22T10:00:00Z',
          currentTask: 'Supervising'
        },
        {
          name: 'FailingAgent',
          status: 'error',
          lastSeen: '2026-05-22T09:59:00Z',
          currentTask: 'Crashing'
        }
      ]
    }

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { container } = render(<AgentStatus />)

    await waitFor(() => {
      expect(container.querySelector('.agent-status')).toBeInTheDocument()
      
      const activeBadge = screen.getByText('active')
      expect(activeBadge).toHaveClass('agent-status__badge--active')

      const errorBadge = screen.getByText('error')
      expect(errorBadge).toHaveClass('agent-status__badge--error')
    })
  })

  it('renders DailyPlan with daily-plan__section class for each section', () => {
    const mockPage: Page = {
      id: 'test-id',
      title: 'Daily Plan',
      template: 'DailyPlan',
      author: 'claw-agent',
      createdAt: '2026-05-22T10:00:00Z',
      expiresAt: null,
      tags: [],
      payload: {
        date: '2026-05-22',
        summary: 'Testing sections layout',
        sections: [
          { heading: 'Sec A', items: ['A1'] },
          { heading: 'Sec B', items: ['B1'] }
        ]
      }
    }

    const { container } = render(<DailyPlan page={mockPage} />)

    expect(container.querySelector('.daily-plan')).toBeInTheDocument()
    const sections = container.querySelectorAll('.daily-plan__section')
    expect(sections).toHaveLength(2)
  })
})
