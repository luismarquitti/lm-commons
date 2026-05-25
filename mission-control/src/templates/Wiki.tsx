import React, { useState } from 'react'
import type { Page } from '../shared/types'
import './Wiki.css'

interface WikiSection {
  id: string
  title: string
  content: string
}

interface WikiPayload {
  sections?: WikiSection[]
  description?: string
}

interface WikiProps {
  page: Page
}

export default function Wiki({ page }: WikiProps) {
  const payload = (page.payload || {}) as WikiPayload
  const sections = Array.isArray(payload.sections) ? payload.sections : []
  const description = payload.description || ""

  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections.length > 0 ? sections[0].id : ''
  )

  const scrollToSection = (id: string) => {
    setActiveSectionId(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // A very lightweight markdown parser for basic formatting in Wiki articles
  const renderContent = (text: string) => {
    if (!text) return null
    
    const lines = text.split('\n')
    let inList = false
    const elements: React.ReactNode[] = []
    let listItems: React.ReactNode[] = []

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="wiki__content-ul">
            {listItems}
          </ul>
        )
        listItems = []
        inList = false
      }
    }

    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      
      // Handle list formatting
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true
        const listText = trimmed.substring(2)
        listItems.push(
          <li key={`li-${idx}`} className="wiki__content-li">
            {parseInlineStyles(listText)}
          </li>
        )
        return
      } else {
        flushList(idx)
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={idx} className="wiki__content-h4">
            {trimmed.substring(4)}
          </h4>
        )
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={idx} className="wiki__content-h3">
            {trimmed.substring(3)}
          </h3>
        )
      } else if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={idx} className="wiki__content-h2">
            {trimmed.substring(2)}
          </h2>
        )
      } 
      // Blockquote
      else if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote key={idx} className="wiki__content-blockquote">
            {parseInlineStyles(trimmed.substring(2))}
          </blockquote>
        )
      }
      // Horizontal rules
      else if (trimmed === '---' || trimmed === '***') {
        elements.push(<hr key={idx} className="wiki__content-hr" />)
      }
      // Fenced code blocks
      else if (trimmed.startsWith('```')) {
        // Simple code block display - find the next ``` if exists
        // (Just a simple block wrapper for now)
        elements.push(
          <pre key={idx} className="wiki__content-pre">
            <code>{trimmed.substring(3)}</code>
          </pre>
        )
      }
      // Paragraph
      else if (trimmed !== '') {
        elements.push(
          <p key={idx} className="wiki__content-p">
            {parseInlineStyles(line)}
          </p>
        )
      } else {
        // Empty lines can add minor spacing or reset lists
        elements.push(<div key={idx} className="wiki__content-spacing"></div>)
      }
    })

    // Flush any remaining list
    flushList(lines.length)

    return elements
  }

  // Parse bold **text** and inline `code`
  const parseInlineStyles = (text: string): React.ReactNode => {
    // Regex for bold and code
    const regex = /(\*\*.*?\*\*|`.*?`)/g
    const parts = text.split(regex)
    
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="wiki__content-inline-code">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  return (
    <div className="wiki animate-fade-in">
      <header className="wiki__header">
        <div className="wiki__title-area">
          <span className="wiki__portal-tag">Homelab System Wiki</span>
          <h1 className="wiki__title">{page.title || 'System Documentation'}</h1>
          <p className="wiki__meta-desc">
            Documented by <strong className="wiki__meta-author">{page.author || 'system'}</strong> on {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </header>

      <div className="wiki__container">
        {/* Sidebar navigation */}
        <aside className="wiki__sidebar">
          <h3 className="wiki__sidebar-title">Articles & Guides</h3>
          <nav className="wiki__sidebar-nav">
            {sections.map((sec) => (
              <button
                key={sec.id}
                className={`wiki__sidebar-link ${activeSectionId === sec.id ? 'wiki__sidebar-link--active' : ''}`}
                onClick={() => scrollToSection(sec.id)}
              >
                <span className="wiki__sidebar-icon">📄</span>
                <span className="wiki__sidebar-text">{sec.title}</span>
              </button>
            ))}
            {sections.length === 0 && (
              <p className="wiki__sidebar-empty">No articles registered.</p>
            )}
          </nav>
        </aside>

        {/* Content body */}
        <main className="wiki__body">
          {description && (
            <div className="wiki__description">
              <p>{description}</p>
            </div>
          )}

          <div className="wiki__articles">
            {sections.map((sec) => (
              <article key={sec.id} id={sec.id} className="wiki__article">
                <header className="wiki__article-header">
                  <h2 className="wiki__article-title">{sec.title}</h2>
                  <span className="wiki__article-id">ID: #{sec.id}</span>
                </header>
                <div className="wiki__article-content">
                  {renderContent(sec.content)}
                </div>
              </article>
            ))}

            {sections.length === 0 && (
              <div className="wiki__empty-state">
                <h3>Empty Documentation Wiki</h3>
                <p>Post content to this page using the Mission Control API with the Wiki template.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
