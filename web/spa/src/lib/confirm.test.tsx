import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

// setup.ts replaces the module for every other test; this file tests the real dialog.
vi.unmock('@/lib/confirm')

describe('confirmSubmit', () => {
  it('resolves true when the user confirms', async () => {
    const { confirmSubmit } = await import('@/lib/confirm')
    const answer = confirmSubmit({ title: 'Save it?', confirmLabel: 'Save' })
    expect(await screen.findByText('Save it?')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
    expect(await answer).toBe(true)
    // The closed dialog is removed after its exit animation; wait so the next test starts clean.
    await waitFor(() => {
      expect(screen.queryByText('Save it?')).not.toBeInTheDocument()
    })
  })

  it('resolves false when the user cancels', async () => {
    const { confirmSubmit } = await import('@/lib/confirm')
    const answer = confirmSubmit({ title: 'Send it?', confirmLabel: 'Send' })
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(await answer).toBe(false)
  })
})
