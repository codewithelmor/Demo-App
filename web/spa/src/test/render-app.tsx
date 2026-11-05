import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { RouterProvider } from 'react-router'
import { CartProvider } from '@/hooks/cart-provider'
import { createQueryClient } from '@/app/query-client'
import { createTestRouter } from '@/app/router'
import { AppProviders } from '@/theme/app-providers'

// Renders the real route tree (shell, guards, lazy routes) at a URL with a fresh query cache.
export function renderApp(url: string) {
  const queryClient = createQueryClient()
  // Tests never wait for retries. Merge: setDefaultOptions replaces everything, which used to drop
  // the app's staleTime and made the loader and the page fetch the same data twice.
  const defaults = queryClient.getDefaultOptions()
  queryClient.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, retry: false } })
  const router = createTestRouter(queryClient, [url])
  render(
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AppProviders>
    </QueryClientProvider>,
  )
  return { router, queryClient }
}
