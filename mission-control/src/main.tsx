import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from './App'
import AgentStatus from './components/dashboards/AgentStatus'
import LinearTaskBoard from './components/dashboards/LinearTaskBoard'
import HomeLab from './components/dashboards/HomeLab'
import FamilyHub from './components/dashboards/FamilyHub'
import DynamicPage from './pages/DynamicPage'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboards/agents" replace />,
      },
      {
        path: 'dashboards/agents',
        element: <AgentStatus />,
      },
      {
        path: 'dashboards/linear',
        element: <LinearTaskBoard />,
      },
      {
        path: 'dashboards/homelab',
        element: <HomeLab />,
      },
      {
        path: 'dashboards/family',
        element: <FamilyHub />,
      },
      {
        path: 'portal/pages/:id',
        element: <DynamicPage />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboards/agents" replace />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
