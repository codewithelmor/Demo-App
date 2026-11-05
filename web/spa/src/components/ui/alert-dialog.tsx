// Behaviour comes from Radix AlertDialog (focus trap, Escape, focus return); the look comes from the
// Material UI theme (surface colour, shadow, typography).
import { styled } from '@mui/material/styles'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

/** The dialog's root: owns the open/closed state. */
const AlertDialog = AlertDialogPrimitive.Root
/** The element (usually a button) that opens the dialog. */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const Overlay = styled(AlertDialogPrimitive.Overlay)(({ theme }) => ({
  position: 'fixed',
  inset: 0,
  zIndex: theme.zIndex.modal,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
}))

const Content = styled(AlertDialogPrimitive.Content)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: theme.zIndex.modal + 1,
  width: 'min(32rem, calc(100vw - 2rem))',
  maxHeight: '90vh',
  overflow: 'auto',
  display: 'grid',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: 12,
  boxShadow: theme.shadows[24],
}))

const Title = styled(AlertDialogPrimitive.Title)(({ theme }) => ({
  ...theme.typography.h6,
  margin: 0,
}))

const Description = styled(AlertDialogPrimitive.Description)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
  margin: 0,
}))

/** The dialog box itself, centered over a dark overlay, outside the normal page flow (a "portal"). */
function AlertDialogContent(props: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <Overlay />
      <Content data-slot="alert-dialog-content" {...props} />
    </AlertDialogPrimitive.Portal>
  )
}

/** The dialog's heading. Screen readers announce it first. */
function AlertDialogTitle(props: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <Title {...props} />
}

/** Explains the decision. Screen readers announce it after the title. */
function AlertDialogDescription(props: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <Description {...props} />
}

/** A button that closes the dialog without doing anything. */
const AlertDialogCancel = AlertDialogPrimitive.Cancel

export {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
}
