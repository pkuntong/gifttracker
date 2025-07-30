import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/index.ts' // Initialize i18n

// Ensure React is properly loaded before rendering
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Create root with error boundary
try {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error)
  // Fallback rendering
  rootElement.innerHTML = '<div style="padding: 20px; text-align: center;">Loading...</div>'
}
