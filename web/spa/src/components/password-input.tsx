import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * A password field (use inside {@link FormField}, so the floating label follows) with a show/hide toggle instead of a "confirm password" field (wireframes 0.1).
 * Paste and password managers are never blocked (WCAG 3.3.8, the accessibility rule on accessible authentication).
 * Accepts every prop of {@link Input} except `type`, which this component controls.
 */
export function PasswordInput(props: Omit<ComponentProps<typeof Input>, 'type'>) {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Input {...props} className="pe-5" type={visible ? 'text' : 'password'} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="pw-toggle"
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => {
          setVisible((current) => !current)
        }}
      >
        {visible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
      </Button>
    </>
  )
}
