import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { MenuIcon } from './components/Icons'
import Logo from './components/Logo'
import Sidebar from './components/Sidebar'
import ThemeToggle from './components/ThemeToggle'
import { ToastProvider } from './components/Toast'
import JournalPage from './pages/JournalPage'
import TodoPage from './pages/TodoPage'

export default function App() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMenuOpen(false), [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const section = location.pathname.startsWith('/todo') ? 'todo' : 'journal'

  return (
    <ToastProvider>
      <div className="shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="main">
          <header className="mobile-bar">
            <button className="icon-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </button>
            <span className="mobile-bar-title">
              <Logo size={22} />
              {section === 'todo' ? 'Todo' : 'Journal'}
            </span>
            <ThemeToggle compact />
          </header>
          {/* Keyed by section so switching sections fades in. */}
          <div key={section} className="view">
            <Routes>
              <Route path="/journal/:entryId?" element={<JournalPage />} />
              <Route path="/todo" element={<TodoPage />} />
              <Route path="*" element={<Navigate to="/journal" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
