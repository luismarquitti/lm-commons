import React, { useEffect, useState, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { resolveTemplate } from '../templates/registry'
import type { Page } from '../shared/types'
import './DynamicPage.css'

export default function DynamicPage() {
  const { id } = useParams<{ id: string }>()
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(null)
    setPage(null)

    fetch(`/api/pages/${id}`)
      .then((res) => {
        if (res.status === 404) {
          throw new Error('Page not found')
        }
        if (!res.ok) {
          throw new Error('Failed to retrieve page')
        }
        return res.json() as Promise<Page>
      })
      .then((data) => {
        setPage(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching page details:', err)
        setError(err.message || 'An unexpected error occurred')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="dynamic-page">
        <div className="dynamic-page__loading">
          <div className="dynamic-page__spinner"></div>
          <p>Retrieving page details...</p>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="dynamic-page">
        <div className="dynamic-page__error">
          <div className="dynamic-page__error-icon">⚠️</div>
          <h2 className="dynamic-page__error-title">
            {error === 'Page not found' ? 'Page Not Found' : 'Error Loading Page'}
          </h2>
          <p className="dynamic-page__error-message">
            {error === 'Page not found'
              ? 'The requested bulletin page does not exist or has expired.'
              : error || 'Could not fetch page details from server.'}
          </p>
          <Link to="/" className="dynamic-page__back-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Resolve template component from registry
  const TemplateComponent = resolveTemplate(page.template)

  if (!TemplateComponent) {
    return (
      <div className="dynamic-page">
        <div className="dynamic-page__error">
          <div className="dynamic-page__error-icon">🛠️</div>
          <h2 className="dynamic-page__error-title">Unregistered Template</h2>
          <p className="dynamic-page__error-message">
            Template type <strong>"{page.template}"</strong> is not registered in this portal client.
          </p>
          <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto', marginBottom: '24px' }}>
            <pre>{JSON.stringify(page.payload, null, 2)}</pre>
          </div>
          <Link to="/" className="dynamic-page__back-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Suspense 
      fallback={
        <div className="dynamic-page">
          <div className="dynamic-page__loading">
            <div className="dynamic-page__spinner"></div>
            <p>Loading template component...</p>
          </div>
        </div>
      }
    >
      <TemplateComponent page={page} />
    </Suspense>
  )
}
