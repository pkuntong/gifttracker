// Ensure React is loaded first
import React from 'react'
import ReactDOM from 'react-dom/client'

// Import the app after React is loaded
import App from './App.tsx'
import './index.css'
import './i18n/index.ts' // Initialize i18n

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    console.error('Root element not found')
    return
  }

  try {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error('Failed to render app:', error)
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">Loading...</div>'
  }
})
