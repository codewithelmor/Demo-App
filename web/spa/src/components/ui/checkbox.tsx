import MuiCheckbox, { type CheckboxProps } from '@mui/material/Checkbox'
import type { ComponentProps, Ref } from 'react'

/**
 * A Material UI checkbox that accepts the props react-hook-form's `register()` returns. The `ref` goes
 * to the real `<input>` (MUI's `inputRef`), so focus-on-error and reading the value keep working.
 */
function Checkbox({
  ref,
  ...props
}: Omit<ComponentProps<'input'>, 'ref' | 'color' | 'size'> & { ref?: Ref<HTMLInputElement> }) {
  return <MuiCheckbox {...({ ...props, ...(ref ? { inputRef: ref } : {}) } as CheckboxProps)} />
}

export { Checkbox }
