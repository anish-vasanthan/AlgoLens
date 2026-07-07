import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ── Keep-alive ping ───────────────────────────────────────────────────────────
// Render free tier spins down after 15 min of inactivity → 30s cold start.
// Ping the health endpoint every 14 minutes to keep the server warm.
// Only runs in production (not during local dev).
function keepAlive() {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl || apiUrl.includes('localhost')) return // skip in dev

  const ping = () => {
    fetch(`${apiUrl}/health`, { method: 'GET', cache: 'no-store' })
      .catch(() => { /* silent — don't surface ping errors to users */ })
  }

  // Immediate ping on page load (wakes server if it was sleeping)
  ping()
  // Then every 14 minutes
  setInterval(ping, 14 * 60 * 1000)
}

keepAlive()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
