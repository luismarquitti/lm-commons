import React from 'react'
import { usePolling } from '../../hooks/usePolling'
import './AgentStatus.css'

interface Agent {
  name: string
  status: 'active' | 'idle' | 'error'
  lastSeen: string
  currentTask: string | null
}

interface AgentStatusResponse {
  agents: Agent[]
}

export default function AgentStatus() {
  const { data, error, loading } = usePolling<AgentStatusResponse>('/api/agents', 30000)

  if (loading) {
    return (
      <div className="agent-status">
        <h1 className="agent-status__title">Agent Status Dashboard</h1>
        <div className="agent-status__loading">
          <div className="agent-status__spinner"></div>
          <p className="text-secondary">Retrieving agent statuses...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="agent-status">
        <h1 className="agent-status__title">Agent Status Dashboard</h1>
        <div className="agent-status__error">
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <p className="text-danger">Failed to connect to agent service.</p>
          <p className="text-muted" style={{ fontSize: '13px' }}>{error?.message || 'Server error'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="agent-status animate-fade-in">
      <h1 className="agent-status__title">Agent Status Dashboard</h1>
      <p className="agent-status__description">Real-time status monitoring of home lab agents (polling every 30s).</p>
      
      <div className="agent-status__grid">
        {data.agents.map((agent) => (
          <div key={agent.name} className="agent-status__card">
            <div className="agent-status__card-header">
              <span className="agent-status__name">{agent.name}</span>
              <span className={`agent-status__badge agent-status__badge--${agent.status}`}>
                {agent.status}
              </span>
            </div>
            
            <div className="agent-status__task-info">
              <span className="agent-status__task-label">Current Task</span>
              {agent.currentTask ? (
                <span className="agent-status__task-content">{agent.currentTask}</span>
              ) : (
                <span className="agent-status__task-content agent-status__task-content--empty">
                  Idle (awaiting instructions)
                </span>
              )}
            </div>
            
            <div className="agent-status__last-seen">
              <span>🕒</span>
              <span>Last active: {new Date(agent.lastSeen).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
