import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type ToastOptions = { message: string; action?: { label: string; onClick: () => void } }
type ActiveToast = ToastOptions & { id: number }

const ToastContext = createContext<(toast: ToastOptions) => void>(() => {})

const DURATION_MS = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((options: ToastOptions) => {
    window.clearTimeout(timer.current)
    setToast({ ...options, id: Date.now() })
    timer.current = window.setTimeout(() => setToast(null), DURATION_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className="toast">
            <span>{toast.message}</span>
            {toast.action && (
              <button
                className="toast-action"
                onClick={() => {
                  toast.action!.onClick()
                  setToast(null)
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
