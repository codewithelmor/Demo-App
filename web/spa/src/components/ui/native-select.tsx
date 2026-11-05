import { styled } from '@mui/material/styles'
import type { ComponentProps } from 'react'
import { field } from '@/components/ui/input'

const StyledSelect = styled('select')(field)

/** A dropdown using the browser's built-in `<select>`, styled like the text box. */
function NativeSelect(props: ComponentProps<'select'>) {
  return <StyledSelect data-slot="native-select" {...props} />
}

export { NativeSelect }
