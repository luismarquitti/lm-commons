import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

describe('App Layout and Sidebar Navigation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders sidebar brand and static links', async () => {
    // Mock successful but empty dynamic page response
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ pages: [], total: 0 }),
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    // Check brand
    expect(screen.getByText('Mission Control')).toBeInTheDocument()

    // Check static links
    expect(screen.getByText('Agent Status')).toBeInTheDocument()
    expect(screen.getByText('Linear Board')).toBeInTheDocument()
    expect(screen.getByText('Home Lab')).toBeInTheDocument()

    // Check loading indicator or empty status
    await waitFor(() => {
      expect(screen.getByText('No active pages')).toBeInTheDocument()
    })
  })

  it('renders dynamic pages loaded from API in sidebar', async () => {
    const mockPages = [
      { id: 'page-1', title: 'Daily Plan 2026-05-22', template: 'DailyPlan', author: 'claw-agent', createdAt: '2026-05-22T00:00:00Z', expiresAt: null, tags: [] },
      { id: 'page-2', title: 'Incident Report', template: 'DailyPlan', author: 'claw-agent', createdAt: '2026-05-22T01:00:00Z', expiresAt: null, tags: [] }
    ]

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ pages: mockPages, total: 2 }),
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    // Wait for the dynamic pages to be loaded and rendered
    await waitFor(() => {
      expect(screen.getByText('Daily Plan 2026-05-22')).toBeInTheDocument()
      expect(screen.getByText('Incident Report')).toBeInTheDocument()
    })

    // Verify links have correct hrefs
    const link1 = screen.getByText('Daily Plan 2026-05-22').closest('a')
    expect(link1).toHaveAttribute('href', '/portal/pages/page-1')

    const link2 = screen.getByText('Incident Report').closest('a')
    expect(link2).toHaveAttribute('href', '/portal/pages/page-2')
  })
})
