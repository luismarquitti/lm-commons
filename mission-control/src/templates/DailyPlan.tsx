import React from 'react'
import type { Page } from '../shared/types'
import './DailyPlan.css'

interface DailyPlanSection {
  heading: string
  items: string[]
}

interface DailyPlanData {
  date?: string
  summary?: string
  sections?: DailyPlanSection[]
}

interface DailyPlanProps {
  page: Page
}

export default function DailyPlan({ page }: DailyPlanProps) {
  // Graceful fallback for payload/data mapping to avoid runtime errors on schema mismatch
  const data = (page.payload || {}) as DailyPlanData
  const dateStr = data.date || (page.createdAt ? page.createdAt.split('T')[0] : 'N/A')
  const summaryStr = data.summary
  const sectionsList = Array.isArray(data.sections) ? data.sections : []

  return (
    <div className="daily-plan animate-fade-in">
      <header className="daily-plan__header">
        <h1 className="daily-plan__title">{page.title || 'Plan of the Day'}</h1>
        <div className="daily-plan__meta">
          <div className="daily-plan__meta-item">
            <span>📅</span>
            <span>Date: {dateStr}</span>
          </div>
          <div className="daily-plan__meta-item">
            <span>✍️</span>
            <span>Author: {page.author || 'system'}</span>
          </div>
          <div className="daily-plan__meta-item">
            <span>🕒</span>
            <span>Created: {page.createdAt ? new Date(page.createdAt).toLocaleString() : 'N/A'}</span>
          </div>
        </div>
      </header>

      {summaryStr && (
        <section className="daily-plan__summary">
          <p>{summaryStr}</p>
        </section>
      )}

      <section className="daily-plan__sections">
        {sectionsList.map((section, idx) => {
          // Graceful fallback for missing items or heading in individual section elements
          const heading = section.heading || `Section ${idx + 1}`
          const items = Array.isArray(section.items) ? section.items : []

          return (
            <div key={idx} className="daily-plan__section">
              <h3 className="daily-plan__section-heading">{heading}</h3>
              <ul className="daily-plan__section-list">
                {items.map((item, itemIdx) => (
                  <li key={itemIdx} className="daily-plan__section-item">
                    <span className="daily-plan__section-bullet">▪</span>
                    <span>{item}</span>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="daily-plan__section-item text-muted">No items in this section.</li>
                )}
              </ul>
            </div>
          )
        })}
        {sectionsList.length === 0 && (
          <div className="daily-plan__section text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            No plans documented for today.
          </div>
        )}
      </section>
    </div>
  )
}
