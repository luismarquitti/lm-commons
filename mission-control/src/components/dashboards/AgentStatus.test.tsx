import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AgentStatus from './AgentStatus'

describe('AgentStatus Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders loading spinner initially', async () => {
    // Return a promise that does not resolve immediately to keep loading = true
    const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {}))
    vi.stubGlobal('fetch', mockFetch)

    render(<AgentStatus />)

    expect(screen.getByText('Retrieving agent statuses...')).toBeInTheDocument()
  })

  it('renders error panel on fetch failure', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    render(<AgentStatus />)

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to agent service.')).toBeInTheDocument()
    })
  })

  it('renders agent cards when fetch succeeds', async () => {
    const mockResponse = {
      agents: [
        {
          name: 'Chief',
          status: 'active',
          lastSeen: '2026-05-22T10:00:00Z',
          currentTask: 'Supervising'
        },
        {
          name: 'Bandit',
          status: 'idle',
          lastSeen: '2026-05-22T09:59:00Z',
          currentTask: null
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

    render(<AgentStatus />)

    await waitFor(() => {
      // Chief details
      expect(screen.getByText('Chief')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
      expect(screen.getByText('Supervising')).toBeInTheDocument()

      // Bandit details
      expect(screen.getByText('Bandit')).toBeInTheDocument()
      expect(screen.getByText('idle')).toBeInTheDocument()
      expect(screen.getByText('Idle (awaiting instructions)')).toBeInTheDocument()
    })
  })
})
