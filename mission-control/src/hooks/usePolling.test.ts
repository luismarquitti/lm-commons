import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePolling } from './usePolling'

describe('usePolling Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('performs initial fetch immediately on mount', async () => {
    const mockData = { test: 'value' }
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { result } = renderHook(() => usePolling('/api/test', 5000))

    expect(result.current.loading).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Flush microtasks to resolve promises
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('polls at specified intervals', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ count: 1 }),
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    renderHook(() => usePolling('/api/test', 5000))

    // Wait for initial mount fetch
    await act(async () => {
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Fast-forward time by 5s
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(mockFetch).toHaveBeenCalledTimes(2)

    // Fast-forward another 5s
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('clears interval on unmount', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ count: 1 }),
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { unmount } = renderHook(() => usePolling('/api/test', 5000))
    
    await act(async () => {
      await Promise.resolve()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)

    unmount()

    // Fast-forward time
    await act(async () => {
      vi.advanceTimersByTime(10000)
    })
    
    // Should still be 1 (polling stopped)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('handles fetch errors gracefully', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      } as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { result } = renderHook(() => usePolling('/api/test', 5000))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeDefined()
    expect(result.current.error?.message).toContain('status 500')
  })
})
