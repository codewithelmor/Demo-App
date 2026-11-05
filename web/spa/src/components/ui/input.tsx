import { styled, type Theme } from '@mui/material/styles'
import type { ComponentProps } from 'react'

/** Shared look of a text box, drawn with the Material UI theme (outlined, primary focus ring, red when invalid). */
const field = ({ theme }: { theme: Theme }) => ({
  width: '100%',
  boxSizing: 'border-box' as const,
  font: 'inherit',
  color: theme.palette.text.primary,
  background: theme.palette.background.paper,
  padding: '8.5px 14px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '&:hover': { borderColor: theme.palette.text.primary },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -1,
    borderColor: theme.palette.primary.main,
  },
  '&[aria-invalid="true"]': {
    borderColor: theme.palette.error.main,
    '&:focus': { outlineColor: theme.palette.error.main },
  },
  '&:disabled': { opacity: 0.6 },
})

const StyledInput = styled('input')(field)

/** A single-line text box (Material UI styled). Turns red when marked `aria-invalid`. */
function Input({ type = 'text', ...props }: ComponentProps<'input'>) {
  return <StyledInput type={type} data-slot="input" {...props} />
}

export { Input, field }
