import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

function showMissingApiMessage(): void {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = `
    <div style="padding: 2rem; font-family: system-ui, sans-serif; max-width: 32rem; color: #e5e7eb; background: #0f1419; min-height: 100vh;">
      <h1 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Planit must run in Electron</h1>
      <p style="color: #9ca3af; line-height: 1.5;">
        The desktop API is not available. Start the app with
        <code style="background:#1a2332;padding:0.1rem 0.35rem;border-radius:4px;">npm run dev</code>
        and use the Electron window — not the Vite URL in a regular browser.
      </p>
    </div>
  `
}

if (!window.api) {
  showMissingApiMessage()
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>
  )
}
