import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { Page } from '../shared/types'

interface ListPagesResponse {
  pages: Omit<Page, 'payload'>[]
  total: number
}

export default function Sidebar() {
  const [dynamicPages, setDynamicPages] = useState<Omit<Page, 'payload'>[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const fetchPages = () => {
    fetch('/api/pages')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch pages')
        }
        return res.json() as Promise<ListPagesResponse>
      })
      .then((data) => {
        setDynamicPages(data.pages)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching pages in Sidebar:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPages()
    
    // Optional: poll every 10 seconds to keep dynamic pages updated
    const interval = setInterval(fetchPages, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <button 
        className="sidebar__mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        {isOpen ? '✕' : '☰'}
      </button>
      
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo-icon"></div>
          <h1 className="sidebar__logo-text">Mission Control</h1>
        </div>
        
        <nav className="sidebar__nav">
          <div className="sidebar__section">
            <h2 className="sidebar__section-title">Dashboards</h2>
            <ul className="sidebar__list">
              <li className="sidebar__item">
                <NavLink 
                  to="/dashboards/agents" 
                  className={({ isActive }) => 
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sidebar__icon">🤖</span>
                  <span className="sidebar__text">Agent Status</span>
                </NavLink>
              </li>
              <li className="sidebar__item">
                <NavLink 
                  to="/dashboards/linear" 
                  className={({ isActive }) => 
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sidebar__icon">⚡</span>
                  <span className="sidebar__text">Linear Board</span>
                </NavLink>
              </li>
              <li className="sidebar__item">
                <NavLink 
                  to="/dashboards/homelab" 
                  className={({ isActive }) => 
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sidebar__icon">🏠</span>
                  <span className="sidebar__text">Home Lab</span>
                </NavLink>
              </li>
              <li className="sidebar__item">
                <NavLink 
                  to="/dashboards/family" 
                  className={({ isActive }) => 
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sidebar__icon">👨‍👩‍👧</span>
                  <span className="sidebar__text">Family Hub</span>
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="sidebar__section">
            <div className="sidebar__section-header">
              <h2 className="sidebar__section-title">Dynamic Pages</h2>
              <button 
                className="sidebar__refresh-btn" 
                onClick={fetchPages}
                title="Refresh pages"
              >
                🔄
              </button>
            </div>
            {loading ? (
              <div className="sidebar__status">Loading...</div>
            ) : dynamicPages.length === 0 ? (
              <div className="sidebar__status sidebar__status--empty">No active pages</div>
            ) : (
              <ul className="sidebar__list">
                {dynamicPages.map((page) => (
                  <li key={page.id} className="sidebar__item">
                    <NavLink
                      to={`/portal/pages/${page.id}`}
                      className={({ isActive }) => 
                        `sidebar__link sidebar__link--dynamic ${isActive ? 'sidebar__link--active' : ''}`
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="sidebar__icon-dot"></span>
                      <span className="sidebar__text" title={page.title}>{page.title}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
        
        <div className="sidebar__footer">
          <span className="sidebar__env">lm-claw</span>
          <span className="sidebar__status-indicator">● Online</span>
        </div>
      </aside>
    </>
  )
}
