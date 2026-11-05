import { styled } from '@mui/material/styles'
import type { ComponentProps } from 'react'
import { field } from '@/components/ui/input'

const StyledTextarea = styled('textarea')((args) => ({
  ...field(args),
  minHeight: '7rem',
  resize: 'vertical',
}))

/** A multi-line text box (Material UI styled); see {@link Input}. */
function Textarea(props: ComponentProps<'textarea'>) {
  return <StyledTextarea data-slot="textarea" {...props} />
}

export { Textarea }
