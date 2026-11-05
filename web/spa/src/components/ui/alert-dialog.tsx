// Built on Radix AlertDialog (from the radix-ui package already installed): focus is trapped,
// Escape closes it, and focus returns to the button that opened it. Radix handles behaviour; the
// Bootstrap `modal-backdrop` and theme variables only draw it, so no Bootstrap JavaScript is needed.
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// An alert dialog interrupts the user for a decision (for example "Cancel this order?"). Parts:
// Root holds the open/closed state, Trigger is the button that opens it, Content is the dialog box,
// Title/Description are read out by screen readers, Cancel closes it without acting.
/** The dialog's root: owns the open/closed state. */
const AlertDialog = AlertDialogPrimitive.Root
/** The element (usually a button) that opens the dialog. */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

/** The dialog box itself, drawn centered over a dark overlay, outside the normal page flow (a "portal"). */
function AlertDialogContent({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="modal-backdrop show" />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn('dialog-box d-grid gap-3 p-4 shadow-lg', className)}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  )
}

/** The dialog's heading. Screen readers announce it first. */
function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title className={cn('modal-title fs-5', className)} {...props} />
}

/** Explains the decision. Screen readers announce it after the title. */
function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn('small text-body-secondary mb-0', className)}
      {...props}
    />
  )
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
