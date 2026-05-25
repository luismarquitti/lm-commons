import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import LinearTaskBoard from './LinearTaskBoard'

describe('LinearTaskBoard Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Stub VITE_LINEAR_API_KEY and LINEAR_API_KEY to be empty by default for tests
    vi.stubEnv('VITE_LINEAR_API_KEY', '')
    vi.stubEnv('LINEAR_API_KEY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('renders configuration notice if API keys are missing', () => {
    render(<LinearTaskBoard />)

    expect(screen.getByText('Linear Key Not Configured')).toBeInTheDocument()
    expect(screen.getByText('VITE_LINEAR_API_KEY')).toBeInTheDocument()
    expect(screen.getByText('LINEAR_API_KEY')).toBeInTheDocument()
  })

  it('renders loading state initially when VITE_LINEAR_API_KEY is present', () => {
    vi.stubEnv('VITE_LINEAR_API_KEY', 'mock-api-key')
    const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {}))
    vi.stubGlobal('fetch', mockFetch)

    render(<LinearTaskBoard />)

    expect(screen.getByText('Connecting to Linear...')).toBeInTheDocument()
  })

  it('renders loading state initially when LINEAR_API_KEY is present', () => {
    vi.stubEnv('LINEAR_API_KEY', 'mock-api-key')
    const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {}))
    vi.stubGlobal('fetch', mockFetch)

    render(<LinearTaskBoard />)

    expect(screen.getByText('Connecting to Linear...')).toBeInTheDocument()
  })

  it('renders issues table on happy path response', async () => {
    vi.stubEnv('VITE_LINEAR_API_KEY', 'mock-api-key')

    const mockResponse = {
      data: {
        issues: {
          nodes: [
            {
              id: 'issue-1',
              identifier: 'ENG-123',
              title: 'Integrate Linear API',
              state: { name: 'In Progress' },
              assignee: { name: 'Luis Marquitti' }
            },
            {
              id: 'issue-2',
              identifier: 'ENG-456',
              title: 'Clean CSS layout',
              state: { name: 'Backlog' },
              assignee: null
            }
          ]
        }
      }
    }

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    render(<LinearTaskBoard />)

    await waitFor(() => {
      // First issue assertions
      expect(screen.getByText('ENG-123')).toBeInTheDocument()
      expect(screen.getByText('Integrate Linear API')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Luis Marquitti')).toBeInTheDocument()
      expect(screen.getByText('LM')).toBeInTheDocument() // Initials avatar

      // Second issue assertions
      expect(screen.getByText('ENG-456')).toBeInTheDocument()
      expect(screen.getByText('Clean CSS layout')).toBeInTheDocument()
      expect(screen.getByText('Backlog')).toBeInTheDocument()
      expect(screen.getByText('Unassigned')).toBeInTheDocument()
    })
  })

  it('renders error panel on api fetch failure', async () => {
    vi.stubEnv('VITE_LINEAR_API_KEY', 'mock-api-key')

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 401,
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    render(<LinearTaskBoard />)

    await waitFor(() => {
      expect(screen.getByText('Failed to retrieve items from Linear.')).toBeInTheDocument()
      expect(screen.getByText('HTTP error! status: 401')).toBeInTheDocument()
    })
  })

  it('renders error panel on graphql semantic error response', async () => {
    vi.stubEnv('VITE_LINEAR_API_KEY', 'mock-api-key')

    const mockResponse = {
      errors: [{ message: 'Invalid API key credentials' }]
    }

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    render(<LinearTaskBoard />)

    await waitFor(() => {
      expect(screen.getByText('Failed to retrieve items from Linear.')).toBeInTheDocument()
      expect(screen.getByText('Invalid API key credentials')).toBeInTheDocument()
    })
  })
})
