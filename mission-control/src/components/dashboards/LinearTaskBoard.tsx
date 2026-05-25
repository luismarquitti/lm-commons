import React, { useEffect, useState } from 'react'
import './LinearTaskBoard.css'

interface LinearState {
  name: string
}

interface LinearAssignee {
  name: string
}

interface LinearIssue {
  id: string
  identifier: string
  title: string
  state: LinearState | null
  assignee: LinearAssignee | null
}

interface GraphQLResponse {
  data?: {
    issues?: {
      nodes?: LinearIssue[]
    }
  }
  errors?: Array<{ message: string }>
}

export default function LinearTaskBoard() {
  const apiKey = import.meta.env.VITE_LINEAR_API_KEY || import.meta.env.LINEAR_API_KEY
  const [issues, setIssues] = useState<LinearIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If API key is absent, skip fetch and show configuration warning
    if (!apiKey) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const query = `
      query {
        issues(first: 50) {
          nodes {
            id
            identifier
            title
            state {
              name
            }
            assignee {
              name
            }
          }
        }
      }
    `

    fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey
      },
      body: JSON.stringify({ query })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json() as Promise<GraphQLResponse>
      })
      .then((resJson) => {
        if (resJson.errors && resJson.errors.length > 0) {
          throw new Error(resJson.errors[0].message)
        }
        const fetchedIssues = resJson.data?.issues?.nodes || []
        setIssues(fetchedIssues)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading Linear issues:', err)
        setError(err.message || 'An unexpected error occurred')
        setLoading(false)
      })
  }, [apiKey])

  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  // Case 1: Missing API Key Configuration
  if (!apiKey) {
    return (
      <div className="linear-task-board">
        <h1 className="linear-task-board__title">Linear Tasks</h1>
        <div className="linear-task-board__config">
          <div className="linear-task-board__config-icon">🔑</div>
          <h2 className="linear-task-board__config-title">Linear Key Not Configured</h2>
          <p className="linear-task-board__config-text">
            Add <strong>VITE_LINEAR_API_KEY</strong> or <strong>LINEAR_API_KEY</strong> to your <code>.env</code> file in the <code>mission-control</code> project directory to view task boards.
          </p>
        </div>
      </div>
    )
  }

  // Case 2: Loading State
  if (loading) {
    return (
      <div className="linear-task-board">
        <h1 className="linear-task-board__title">Linear Tasks</h1>
        <div className="linear-task-board__loading">
          <div className="linear-task-board__spinner"></div>
          <p className="text-secondary">Connecting to Linear...</p>
        </div>
      </div>
    )
  }

  // Case 3: Error State
  if (error) {
    return (
      <div className="linear-task-board">
        <h1 className="linear-task-board__title">Linear Tasks</h1>
        <div className="linear-task-board__error">
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <p className="text-danger">Failed to retrieve items from Linear.</p>
          <p className="text-muted" style={{ fontSize: '13px' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="linear-task-board animate-fade-in">
      <h1 className="linear-task-board__title">Linear Tasks</h1>
      <p className="linear-task-board__description">View active work items synced directly from Linear.</p>
      
      <div className="linear-task-board__table-container">
        <table className="linear-task-board__table">
          <thead>
            <tr>
              <th className="linear-task-board__th">ID</th>
              <th className="linear-task-board__th">Title</th>
              <th className="linear-task-board__th">Status</th>
              <th className="linear-task-board__th">Assignee</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} className="linear-task-board__tr">
                <td className="linear-task-board__td">
                  <span className="linear-task-board__issue-id">{issue.identifier}</span>
                </td>
                <td className="linear-task-board__td">
                  <span className="linear-task-board__issue-title">{issue.title}</span>
                </td>
                <td className="linear-task-board__td">
                  <span className="linear-task-board__issue-state">
                    {issue.state?.name || 'Backlog'}
                  </span>
                </td>
                <td className="linear-task-board__td">
                  <div className="linear-task-board__issue-assignee">
                    {issue.assignee ? (
                      <>
                        <div className="linear-task-board__avatar" title={issue.assignee.name}>
                          {getInitials(issue.assignee.name)}
                        </div>
                        <span>{issue.assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-muted">Unassigned</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr>
                <td colSpan={4} className="linear-task-board__td" style={{ textAlign: 'center', padding: '32px' }}>
                  No active issues found on Linear.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
