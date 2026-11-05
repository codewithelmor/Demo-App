import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import { useQuery, type QueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useLocation, useSearchParams, type LoaderFunctionArgs } from 'react-router'
import { SearchBox } from '@/components/search-box'
import { FormField } from '@/components/form-field'
import { NativeSelect } from '@/components/ui/native-select'
import { Button, LinkButton } from '@/components/ui/button'
import type { Product } from '@/api/products'
import { productsQuery } from '@/features/catalog/catalog-api'
import { apiErrorMessage } from '@/lib/error-message'
import { CatalogFilters } from '@/features/catalog/catalog-filters'
import {
  filterCount,
  hasFilters,
  parseParams,
  SORT_LABELS,
  SORTS,
  toSearchParams,
  type CatalogParams,
  type CatalogSort,
} from '@/features/catalog/catalog-params'
import { ProductCard } from '@/features/catalog/product-card'
import { addMessage, useCart } from '@/hooks/use-cart'

/**
 * Starts the request before the page renders. Errors are swallowed here, so the page itself
 * shows loading and error states with a retry (CU-1 states).
 * (A route loader: React Router runs it before the page shows, so the data is already loading when the page appears.)
 */
export function catalogLoader(queryClient: QueryClient) {
  return ({ request }: LoaderFunctionArgs) => {
    const params = parseParams(new URL(request.url).searchParams)
    // Not awaited: the page renders its loading state while the request runs.
    queryClient.query(productsQuery(params)).catch(() => undefined)
    return null
  }
}

/** Type guard: true when the text is one of the allowed sort orders. */
function isSort(value: string): value is CatalogSort {
  return SORTS.some((sort) => sort === value)
}

/** A short status message (for example "Added X to cart") shown in a live region so screen readers announce it. */
interface Notice {
  // Counts up with every notice, so the same text twice is a new element and is announced again.
  id: number
  kind: 'status' | 'alert'
  text: string
}

/**
 * CU-1. Search, filters, sort and page are in the URL and are sent to the API.
 * Page flow: read the URL -> ask the API (cached) -> show a grid of product cards, or a loading,
 * error or empty state, plus the filters, sort dropdown and paging buttons.
 */
export function CatalogRoute() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const params = parseParams(searchParams)
  const { data, error, isPending, isError, refetch, isFetching } = useQuery(productsQuery(params))
  const cart = useCart()
  const [notice, setNotice] = useState<Notice | undefined>()

  // Reads the current URL when it runs, so a debounced search never overwrites a newer change.
  function update(change: (current: CatalogParams) => CatalogParams, replace = false) {
    setSearchParams((previous) => toSearchParams(change(parseParams(previous))), { replace })
  }

  function clearFilters() {
    update((current) => ({
      ...current,
      search: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStock: false,
      page: 1,
    }))
  }

  function addToCart(product: Product) {
    const result = cart.add(product)
    const count = cart.lines.some((line) => line.productId === product.id)
      ? cart.count
      : cart.count + 1
    setNotice({
      id: (notice?.id ?? 0) + 1,
      kind: result === 'added' ? 'status' : 'alert',
      text: addMessage(result, product.name, count),
    })
  }

  const filtersActive = hasFilters(params)
  const totalPages = Math.max(data?.totalPages ?? 1, 1)
  const pageLink = (page: number) => {
    const query = toSearchParams({ ...params, page }).toString()
    return query === '' ? '/products' : `/products?${query}`
  }

  return (
    <section className="d-grid gap-3">
      <title>Products · Orders Shop</title>
      <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2">
        <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
          Products
        </h1>
        {/* Always in the page: a new count is announced when search, filters or paging change the list. */}
        <p role="status" className="min-h-5 small text-body-secondary">
          {data
            ? `${String(data.totalCount)} ${data.totalCount === 1 ? 'product' : 'products'}`
            : ''}
        </p>
      </div>

      <div className="d-flex flex-wrap align-items-start gap-3">
        <div className="min-w-56 flex-fill">
          <SearchBox
            value={params.search ?? ''}
            onSearch={(search) => {
              update((current) => ({ ...current, search, page: 1 }), true)
            }}
          />
        </div>
        <FormField
          className="w-48"
          label="Sort"
          render={(a11y) => (
            <NativeSelect
              {...a11y}
              value={params.sort}
              onChange={(event) => {
                const sort = event.target.value
                if (isSort(sort)) update((current) => ({ ...current, sort, page: 1 }))
              }}
            >
              {SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {SORT_LABELS[sort]}
                </option>
              ))}
            </NativeSelect>
          )}
        />
      </div>

      <CatalogFilters
        key={`filters-${String(params.minPrice)}-${String(params.maxPrice)}-${String(params.inStock)}`}
        params={params}
        canClear={filtersActive}
        onApply={(filters) => {
          update((current) => ({ ...current, ...filters, page: 1 }))
        }}
        onClear={clearFilters}
      />
      {filtersActive && (
        <p className="small text-body-secondary">
          {filterCount(params)} {filterCount(params) === 1 ? 'filter' : 'filters'} applied
        </p>
      )}

      {/* Always in the page, so cart changes are announced. */}
      <p role="status" className="min-h-5 small">
        {notice?.kind === 'status' ? <span key={notice.id}>{notice.text}</span> : null}
      </p>
      {notice?.kind === 'alert' && (
        <Alert severity="error" role="alert">
          {notice.text}
        </Alert>
      )}

      {isPending && (
        <>
          <p role="status" className="visually-hidden">
            Loading products…
          </p>
          <ul aria-hidden="true" className="card-grid list-unstyled mb-0 p-0">
            {Array.from({ length: 8 }, (_, index) => (
              <li key={index}>
                <Skeleton variant="rounded" height={160} />
              </li>
            ))}
          </ul>
        </>
      )}

      {isError && (
        <Alert severity="error" role="alert" className="gap-2">
          <p>{apiErrorMessage(error)}</p>
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() => {
              void refetch()
            }}
          >
            {isFetching ? 'Trying again…' : 'Try again'}
          </Button>
        </Alert>
      )}

      {data && data.items.length === 0 && (
        <div className="d-grid justify-items-start gap-2">
          {params.page > 1 ? (
            <>
              <p>No products on this page.</p>
              <LinkButton to={pageLink(1)} variant="outline">
                Go to page 1
              </LinkButton>
            </>
          ) : filtersActive ? (
            <>
              <p>No products match your search.</p>
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </>
          ) : (
            <p>No products yet. Check back later.</p>
          )}
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul aria-busy={isFetching} className="card-grid list-unstyled mb-0 p-0">
          {data.items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              inCart={cart.lines.find((line) => line.productId === product.id)?.quantity ?? 0}
              listSearch={location.search}
              onAdd={addToCart}
            />
          ))}
        </ul>
      )}

      {data && data.totalCount > 0 && (
        <nav aria-label="Pagination" className="d-flex align-items-center gap-2">
          {params.page > 1 ? (
            <LinkButton to={pageLink(params.page - 1)} variant="outline">
              Previous
            </LinkButton>
          ) : null}
          <span className="small">
            Page {params.page} of {totalPages}
          </span>
          {params.page < totalPages ? (
            <LinkButton to={pageLink(params.page + 1)} variant="outline">
              Next
            </LinkButton>
          ) : null}
        </nav>
      )}
    </section>
  )
}
