import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { readCspNonce } from '@/app/csp-nonce'
import { theme } from '@/theme/theme'
import { ToastProvider } from '@/theme/toast'

/** One emotion cache whose `<style>` tags carry the CSP nonce, so the BFF's `style-src` allows them. */
const nonce = readCspNonce()
const cache = createCache({ key: 'mui', ...(nonce ? { nonce } : {}) })

/** Material UI theme, baseline styles and the toast host for everything inside. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}
