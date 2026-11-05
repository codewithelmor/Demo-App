/**
 * Asks the user to confirm before a form is sent, with SweetAlert2 (React flavour).
 *
 * CSP note: the default `sweetalert2` bundle injects an un-nonced `<style>` tag, which the BFF's
 * `style-src` blocks. `vite.config.ts` therefore aliases `sweetalert2` to the build without that
 * injection, and `main.tsx` loads `sweetalert2/dist/sweetalert2.min.css` as a normal stylesheet.
 * Buttons use Bootstrap classes (`buttonsStyling: false`), so the dialog matches the Lumen theme.
 */
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const ReactSwal = withReactContent(Swal)

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
export async function confirmSubmit({
  title,
  text,
  confirmLabel,
}: ConfirmOptions): Promise<boolean> {
  const result = await ReactSwal.fire({
    title,
    ...(text === undefined ? {} : { text }),
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmLabel,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: false,
    buttonsStyling: false,
    customClass: {
      confirmButton: 'btn btn-primary ms-2',
      cancelButton: 'btn btn-outline-secondary',
    },
  })
  return result.isConfirmed
}
