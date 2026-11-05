import Alert, { type AlertColor } from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'

/** One message waiting to be shown. */
interface Toast {
  id: number
  severity: AlertColor
  message: string
}

/** What `useToast()` returns. Each method shows a short, self-closing message (a "toast"). */
interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const noop = () => undefined
const ToastContext = createContext<ToastApi>({
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
})

/**
 * Shows toasts bottom-left, one at a time (the next waits for the current to close). The Snackbar is a
 * polite live region, so screen readers announce the message without stealing focus.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Toast[]>([])
  const [open, setOpen] = useState(true)
  const current = queue[0]

  const push = useCallback((severity: AlertColor, message: string) => {
    setQueue((q) => [...q, { id: Date.now() + q.length, severity, message }])
    setOpen(true)
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => {
        push('success', m)
      },
      error: (m) => {
        push('error', m)
      },
      info: (m) => {
        push('info', m)
      },
      warning: (m) => {
        push('warning', m)
      },
    }),
    [push],
  )

  const close = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') return
    setOpen(false)
  }

  return (
    <ToastContext value={api}>
      {children}
      <Snackbar
        key={current?.id}
        open={current !== undefined && open}
        autoHideDuration={5000}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          transition: {
            onExited: () => {
              setQueue((q) => q.slice(1))
              setOpen(true)
            },
          },
        }}
      >
        <Alert
          severity={current?.severity ?? 'info'}
          variant="filled"
          onClose={close}
          sx={{ width: '100%' }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </ToastContext>
  )
}

/** Returns the toast functions: `const toast = useToast(); toast.success('Saved')`. */
export function useToast(): ToastApi {
  return use(ToastContext)
}
