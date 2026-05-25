import React, { useState } from 'react'
import type { Page } from '../shared/types'
import './CompozyTasks.css'

interface PRDData {
  overview?: string
  goals?: string[]
  userStories?: string[]
  coreFeatures?: string[]
  successMetrics?: string[]
}

interface TechSpecData {
  overview?: string
  architecture?: string
  components?: string[]
  dataFlow?: string
}

interface ADRItem {
  id: string
  title: string
  status: string
  date?: string
  context?: string
  decision?: string
  consequences?: string
}

interface ChecklistItem {
  text: string
  checked: boolean
}

interface TaskItem {
  id: string
  title: string
  status: string
  complexity?: string
  dependencies?: string[]
  overview?: string
  subtasks?: ChecklistItem[]
  tests?: ChecklistItem[]
}

interface CompozyPayload {
  prd?: PRDData
  techSpec?: TechSpecData
  adrs?: ADRItem[]
  tasks?: TaskItem[]
}

interface CompozyTasksProps {
  page: Page
}

type TabId = 'overview' | 'prd' | 'techspec' | 'adrs' | 'tasks'

export default function CompozyTasks({ page }: CompozyTasksProps) {
  const payload = (page.payload || {}) as CompozyPayload
  const prd = payload.prd || {}
  const techSpec = payload.techSpec || {}
  const adrs = Array.isArray(payload.adrs) ? payload.adrs : []
  const tasks = Array.isArray(payload.tasks) ? payload.tasks : []

  const [activeTab, setActiveTab] = useState<TabId>('overview')

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status.toLowerCase() === 'completed' || t.status.toLowerCase() === 'done' || t.status.toLowerCase() === 'x').length
  const inProgressTasks = tasks.filter(t => t.status.toLowerCase() === 'in_progress' || t.status.toLowerCase() === 'in-progress' || t.status.toLowerCase() === '/').length
  const pendingTasks = totalTasks - completedTasks - inProgressTasks

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed' || s === 'done' || s === 'x' || s === 'accepted') return 'status-badge--success'
    if (s === 'in_progress' || s === 'in-progress' || s === '/') return 'status-badge--warning'
    if (s === 'failed' || s === 'rejected') return 'status-badge--danger'
    return 'status-badge--info'
  }

  const getComplexityClass = (complexity: string) => {
    const c = complexity.toLowerCase()
    if (c === 'high') return 'complexity-badge--high'
    if (c === 'medium') return 'complexity-badge--medium'
    return 'complexity-badge--low'
  }

  return (
    <div className="compozy-tasks animate-fade-in">
      <header className="compozy-tasks__header">
        <div className="compozy-tasks__title-area">
          <span className="compozy-tasks__initiative-tag">Compozy Initiative</span>
          <h1 className="compozy-tasks__title">{page.title || 'Initiative Dashboard'}</h1>
          <p className="compozy-tasks__meta-desc">
            Created by <strong className="text-inverse">{page.author || 'system'}</strong> on {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div className="compozy-tasks__progress-widget">
          <div className="compozy-tasks__progress-info">
            <span className="compozy-tasks__progress-label">Task Completion</span>
            <span className="compozy-tasks__progress-value">{completionRate}%</span>
          </div>
          <div className="compozy-tasks__progress-bar-container">
            <div 
              className="compozy-tasks__progress-bar-fill" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <div className="compozy-tasks__progress-stats">
            <span>{completedTasks} of {totalTasks} completed</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="compozy-tasks__nav">
        <button 
          className={`compozy-tasks__tab-btn ${activeTab === 'overview' ? 'compozy-tasks__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`compozy-tasks__tab-btn ${activeTab === 'prd' ? 'compozy-tasks__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('prd')}
        >
          📄 PRD
        </button>
        <button 
          className={`compozy-tasks__tab-btn ${activeTab === 'techspec' ? 'compozy-tasks__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('techspec')}
        >
          🛠️ Tech Spec
        </button>
        <button 
          className={`compozy-tasks__tab-btn ${activeTab === 'adrs' ? 'compozy-tasks__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('adrs')}
        >
          ⚖️ ADRs ({adrs.length})
        </button>
        <button 
          className={`compozy-tasks__tab-btn ${activeTab === 'tasks' ? 'compozy-tasks__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ✅ Tasks ({tasks.length})
        </button>
      </nav>

      {/* Tab Panel Content */}
      <main className="compozy-tasks__content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <section className="compozy-tasks__tab-panel animate-fade-in">
            <div className="compozy-tasks__grid-3">
              <div className="compozy-tasks__stat-card">
                <span className="compozy-tasks__stat-icon">✅</span>
                <div className="compozy-tasks__stat-val">{completedTasks}</div>
                <div className="compozy-tasks__stat-label">Tasks Completed</div>
              </div>
              <div className="compozy-tasks__stat-card compozy-tasks__stat-card--glow">
                <span className="compozy-tasks__stat-icon text-warning">⚡</span>
                <div className="compozy-tasks__stat-val">{inProgressTasks}</div>
                <div className="compozy-tasks__stat-label">Tasks In Progress</div>
              </div>
              <div className="compozy-tasks__stat-card">
                <span className="compozy-tasks__stat-icon text-muted">⏳</span>
                <div className="compozy-tasks__stat-val">{pendingTasks}</div>
                <div className="compozy-tasks__stat-label">Tasks Pending</div>
              </div>
            </div>

            <div className="compozy-tasks__overview-summary mt-8">
              <h2 className="section-title">Initiative Description</h2>
              <div className="panel-card leading-relaxed">
                {prd.overview || "This initiative coordinates workflow optimization guidelines for OpenClaw."}
              </div>
            </div>

            <div className="compozy-tasks__grid-2 mt-8">
              <div className="compozy-tasks__box">
                <h3 className="section-subtitle">🎯 Key Goals</h3>
                <ul className="styled-list">
                  {prd.goals?.slice(0, 4).map((g, i) => (
                    <li key={i}>{g}</li>
                  )) || <li>No goals specified</li>}
                </ul>
              </div>
              <div className="compozy-tasks__box">
                <h3 className="section-subtitle">⚖️ Architecture Decisions (ADRs)</h3>
                <div className="adr-summary-list">
                  {adrs.map((adr) => (
                    <div key={adr.id} className="adr-summary-item" onClick={() => setActiveTab('adrs')}>
                      <span className="adr-summary-id">{adr.id}</span>
                      <span className="adr-summary-title">{adr.title}</span>
                      <span className={`status-badge ${getStatusClass(adr.status)}`}>{adr.status}</span>
                    </div>
                  ))}
                  {adrs.length === 0 && <p className="text-muted text-center py-4">No ADRs documented</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PRD TAB */}
        {activeTab === 'prd' && (
          <section className="compozy-tasks__tab-panel animate-fade-in">
            <h2 className="section-title">Product Requirements Document (PRD)</h2>
            
            <div className="panel-card mb-8">
              <h3 className="field-title">Overview</h3>
              <p className="leading-relaxed">{prd.overview || "No overview available"}</p>
            </div>

            <div className="compozy-tasks__grid-2">
              <div className="panel-card">
                <h3 className="field-title text-primary">Goals</h3>
                <ul className="styled-list">
                  {prd.goals?.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  )) || <li className="text-muted">No goals listed</li>}
                </ul>
              </div>

              <div className="panel-card">
                <h3 className="field-title text-success">Core Features</h3>
                <ul className="styled-list">
                  {prd.coreFeatures?.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  )) || <li className="text-muted">No features listed</li>}
                </ul>
              </div>
            </div>

            <div className="panel-card mt-8">
              <h3 className="field-title text-warning">User Stories</h3>
              <ul className="styled-list">
                {prd.userStories?.map((story, idx) => (
                  <li key={idx}>{story}</li>
                )) || <li className="text-muted">No user stories defined</li>}
              </ul>
            </div>

            <div className="panel-card mt-8">
              <h3 className="field-title text-info">Success Metrics</h3>
              <ul className="styled-list">
                {prd.successMetrics?.map((m, idx) => (
                  <li key={idx}>{m}</li>
                )) || <li className="text-muted">No success metrics defined</li>}
              </ul>
            </div>
          </section>
        )}

        {/* TECH SPEC TAB */}
        {activeTab === 'techspec' && (
          <section className="compozy-tasks__tab-panel animate-fade-in">
            <h2 className="section-title">Technical Specification</h2>
            
            <div className="panel-card mb-8">
              <h3 className="field-title">High-Level Design</h3>
              <div style={{ whiteSpace: 'pre-wrap' }} className="leading-relaxed">
                {techSpec.overview || "No Technical Specification overview available."}
              </div>
            </div>

            {techSpec.architecture && (
              <div className="panel-card mb-8">
                <h3 className="field-title">Architecture Description</h3>
                <div style={{ whiteSpace: 'pre-wrap' }} className="leading-relaxed">
                  {techSpec.architecture}
                </div>
              </div>
            )}

            {techSpec.dataFlow && (
              <div className="panel-card mb-8">
                <h3 className="field-title">Data Flows</h3>
                <div style={{ whiteSpace: 'pre-wrap' }} className="leading-relaxed">
                  {techSpec.dataFlow}
                </div>
              </div>
            )}

            {techSpec.components && techSpec.components.length > 0 && (
              <div className="panel-card">
                <h3 className="field-title">Key Architectural Components</h3>
                <ul className="styled-list">
                  {techSpec.components.map((comp, idx) => (
                    <li key={idx}>{comp}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ADRS TAB */}
        {activeTab === 'adrs' && (
          <section className="compozy-tasks__tab-panel animate-fade-in">
            <h2 className="section-title">Architecture Decision Records</h2>
            
            <div className="adr-list">
              {adrs.map((adr) => (
                <div key={adr.id} className="adr-card mb-8">
                  <div className="adr-card__header">
                    <div>
                      <span className="adr-card__id">{adr.id}</span>
                      <h3 className="adr-card__title">{adr.title}</h3>
                    </div>
                    <span className={`status-badge ${getStatusClass(adr.status)}`}>
                      {adr.status}
                    </span>
                  </div>
                  
                  {adr.date && (
                    <div className="adr-card__meta">
                      <span>📅 Date: {adr.date}</span>
                    </div>
                  )}

                  <div className="adr-card__body mt-4">
                    {adr.context && (
                      <div className="adr-card__section">
                        <h4>Context</h4>
                        <p>{adr.context}</p>
                      </div>
                    )}
                    {adr.decision && (
                      <div className="adr-card__section">
                        <h4>Decision</h4>
                        <p>{adr.decision}</p>
                      </div>
                    )}
                    {adr.consequences && (
                      <div className="adr-card__section">
                        <h4>Consequences</h4>
                        <p>{adr.consequences}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {adrs.length === 0 && (
                <div className="panel-card text-center py-8 text-muted">
                  No Architecture Decision Records found.
                </div>
              )}
            </div>
          </section>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <section className="compozy-tasks__tab-panel animate-fade-in">
            <h2 className="section-title">Tasks Board</h2>

            <div className="tasks-board-layout">
              {tasks.map((task) => (
                <div key={task.id} className="task-card mb-6">
                  <div className="task-card__header">
                    <div className="task-card__title-row">
                      <span className="task-card__number">#{task.id}</span>
                      <h3 className="task-card__title">{task.title}</h3>
                    </div>
                    <div className="task-card__badges">
                      {task.complexity && (
                        <span className={`complexity-badge ${getComplexityClass(task.complexity)}`}>
                          {task.complexity} complexity
                        </span>
                      )}
                      <span className={`status-badge ${getStatusClass(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="task-card__dependencies">
                      <span className="text-muted">Dependencies: </span>
                      {task.dependencies.map(dep => (
                        <span key={dep} className="dependency-tag">{dep}</span>
                      ))}
                    </div>
                  )}

                  {task.overview && (
                    <p className="task-card__overview mt-3">{task.overview}</p>
                  )}

                  <div className="task-card__checklists mt-4">
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="task-card__checklist-sec">
                        <h4>📋 Subtasks</h4>
                        <ul className="checklist">
                          {task.subtasks.map((st, i) => (
                            <li key={i} className={st.checked ? 'checked' : ''}>
                              <span className="checkbox-indicator">{st.checked ? '✅' : '⬜'}</span>
                              <span>{st.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {task.tests && task.tests.length > 0 && (
                      <div className="task-card__checklist-sec">
                        <h4>🧪 Verification Tests</h4>
                        <ul className="checklist">
                          {task.tests.map((t, i) => (
                            <li key={i} className={t.checked ? 'checked' : ''}>
                              <span className="checkbox-indicator">{t.checked ? '✅' : '⬜'}</span>
                              <span>{t.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="panel-card text-center py-8 text-muted">
                  No tasks defined for this initiative.
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
