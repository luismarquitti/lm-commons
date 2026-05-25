import React from 'react'
import type { Page } from '../shared/types'

export type TemplateComponent = React.ComponentType<{ page: Page }>

export const templateRegistry: Record<string, React.ComponentType<any>> = {
  DailyPlan: React.lazy(() => import('./DailyPlan')),
  CompozyTasks: React.lazy(() => import('./CompozyTasks')),
  Wiki: React.lazy(() => import('./Wiki')),
}

export function resolveTemplate(id: string): TemplateComponent | null {
  const component = templateRegistry[id]
  return (component as TemplateComponent) || null
}
