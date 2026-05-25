import { useEffect, useState, useRef } from 'react'

export function usePolling<T>(url: string, intervalMs: number) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  // Use a ref to keep track of the current request to avoid setting state
  // after unmount or when another fetch starts
  const latestFetchId = useRef(0)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    const fetchData = () => {
      const fetchId = ++latestFetchId.current
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Polling failed with status ${res.status}`)
          }
          return res.json() as Promise<T>
        })
        .then((jsonData) => {
          if (isMounted && fetchId === latestFetchId.current) {
            setData(jsonData)
            setError(null)
            setLoading(false)
          }
        })
        .catch((err) => {
          if (isMounted && fetchId === latestFetchId.current) {
            setError(err instanceof Error ? err : new Error(String(err)))
            setLoading(false)
          }
        })
    }

    // Execute immediately on mount
    fetchData()

    const interval = setInterval(fetchData, intervalMs)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [url, intervalMs])

  return { data, error, loading }
}
