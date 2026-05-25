import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { resolveTemplate } from './registry'
import DailyPlan from './DailyPlan'
import type { Page } from '../shared/types'

describe('DailyPlan Template and Registry', () => {
  it('resolves DailyPlan template from registry', () => {
    const component = resolveTemplate('DailyPlan')
    expect(component).not.toBeNull()
    expect(component).toBeDefined()
  })

  it('returns null for unknown template names', () => {
    const component = resolveTemplate('UnknownTemplate')
    expect(component).toBeNull()
  })

  const fullFixturePage: Page = {
    id: 'test-id',
    title: 'Daily Plan — May 22',
    template: 'DailyPlan',
    author: 'agent-1',
    createdAt: '2026-05-22T10:00:00Z',
    expiresAt: null,
    tags: ['daily'],
    payload: {
      date: '2026-05-22',
      summary: 'Today we scaffold the main React components.',
      sections: [
        {
          heading: 'Tasks Completed',
          items: ['Setup CSS layout', 'Implement dynamic sidebar']
        },
        {
          heading: 'Blockers',
          items: ['None']
        }
      ]
    }
  }

  it('renders title, date, author, and summary from payload', () => {
    render(<DailyPlan page={fullFixturePage} />)

    expect(screen.getByText('Daily Plan — May 22')).toBeInTheDocument()
    expect(screen.getByText('Date: 2026-05-22')).toBeInTheDocument()
    expect(screen.getByText('Author: agent-1')).toBeInTheDocument()
    expect(screen.getByText('Today we scaffold the main React components.')).toBeInTheDocument()
  })

  it('renders section headings and section items', () => {
    render(<DailyPlan page={fullFixturePage} />)

    expect(screen.getByText('Tasks Completed')).toBeInTheDocument()
    expect(screen.getByText('Setup CSS layout')).toBeInTheDocument()
    expect(screen.getByText('Implement dynamic sidebar')).toBeInTheDocument()
    
    expect(screen.getByText('Blockers')).toBeInTheDocument()
    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('renders without throwing when sections is empty', () => {
    const pageWithEmptySections: Page = {
      ...fullFixturePage,
      payload: {
        date: '2026-05-22',
        summary: 'Empty sections test',
        sections: []
      }
    }

    expect(() => {
      render(<DailyPlan page={pageWithEmptySections} />)
    }).not.toThrow()

    expect(screen.getByText('No plans documented for today.')).toBeInTheDocument()
  })

  it('renders without throwing when summary is missing', () => {
    const pageWithNoSummary: Page = {
      ...fullFixturePage,
      payload: {
        date: '2026-05-22',
        sections: [
          { heading: 'General', items: ['Testing summary fallback'] }
        ]
      }
    }

    expect(() => {
      render(<DailyPlan page={pageWithNoSummary} />)
    }).not.toThrow()

    expect(screen.getByText('Testing summary fallback')).toBeInTheDocument()
    // No summary container element should be present
    const summaryText = screen.queryByText('Today we scaffold the main React components.')
    expect(summaryText).toBeNull()
  })
})
