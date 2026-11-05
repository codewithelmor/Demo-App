/**
 * Asks the user to confirm before a form is sent, with a Material UI Dialog.
 *
 * The dialog is rendered into its own React root appended to `<body>`, so any code can `await` it
 * without a component in the tree. It is wrapped in the same theme and nonce-carrying emotion cache
 * as the app (`AppProviders`), so the CSP allows its styles.
 */
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/theme/app-providers'

/** Texts of one confirmation. */
interface ConfirmOptions {
  /** Question shown as the heading, for example "Create your account?". */
  title: string
  /** Optional extra sentence under the heading. */
  text?: string
  /** Label of the confirm button, for example "Create account". */
  confirmLabel: string
}

/**
 * Shows the dialog and resolves `true` when the user confirms, `false` when they cancel,
 * press Escape or click outside it. Focus returns to where it was when the dialog closes.
 */
export function confirmSubmit({ title, text, confirmLabel }: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)

    const view = (open: boolean, answer: (value: boolean) => void) => (
      <AppProviders>
        <Dialog
          open={open}
          onClose={() => {
            answer(false)
          }}
          aria-labelledby="confirm-title"
        >
          <DialogTitle id="confirm-title">{title}</DialogTitle>
          {text !== undefined && (
            <DialogContent>
              <DialogContentText>{text}</DialogContentText>
            </DialogContent>
          )}
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => {
                answer(false)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                answer(true)
              }}
            >
              {confirmLabel}
            </Button>
          </DialogActions>
        </Dialog>
      </AppProviders>
    )

    const answer = (value: boolean) => {
      resolve(value)
      root.render(view(false, () => undefined))
      // Let the closing animation run, then remove the extra root.
      setTimeout(() => {
        root.unmount()
        host.remove()
      }, 400)
    }
    root.render(view(true, answer))
  })
}
