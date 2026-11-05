import { useQuery, type QueryClient } from '@tanstack/react-query'
import { Link, useSearchParams, type LoaderFunctionArgs } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { FormField } from '@/components/form-field'
import { NativeSelect } from '@/components/ui/native-select'
import { apiErrorMessage } from '@/lib/error-message'
import { myOrdersQuery } from '@/features/orders/orders-api'
import { OrdersFilters } from '@/features/orders/orders-filters'
import {
  hasOrderFilters,
  ORDER_SORT_LABELS,
  ORDER_SORTS,
  parseOrdersParams,
  toOrdersSearchParams,
  type OrderSort,
  type OrdersParams,
} from '@/features/orders/orders-params'
import { shortId, StatusBadge } from '@/features/orders/status-badge'
import { formatDateTime } from '@/lib/dates'
import { formatMoneyIn } from '@/lib/money'

/** A route loader: React Router runs it before the page shows, so the data is already loading when the page appears. Starts loading the order list for the URL's filters. */
export function ordersLoader(queryClient: QueryClient) {
  return ({ request }: LoaderFunctionArgs) => {
    const params = parseOrdersParams(new URL(request.url).searchParams)
    // Not awaited: the page renders its loading state while the request runs.
    queryClient.query(myOrdersQuery(params)).catch(() => undefined)
    return null
  }
}

/** Type guard: true when the text is one of the allowed sort orders. */
function isSort(value: string): value is OrderSort {
  return ORDER_SORTS.some((sort) => sort === value)
}

/**
 * CU-4. Status, dates, sort and page are in the URL and are sent to the API.
 * A table/list of the customer's orders with filters, sort and paging.
 */
export function OrdersRoute() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = parseOrdersParams(searchParams)
  const { data, error, isPending, isError, refetch, isFetching } = useQuery(myOrdersQuery(params))

  function update(change: (current: OrdersParams) => OrdersParams) {
    setSearchParams((previous) => toOrdersSearchParams(change(parseOrdersParams(previous))))
  }

  function clearFilters() {
    update((current) => ({
      ...current,
      statuses: [],
      from: undefined,
      to: undefined,
      page: 1,
    }))
  }

  const filtersActive = hasOrderFilters(params)
  const totalPages = Math.max(data?.totalPages ?? 1, 1)
  const pageLink = (page: number) => {
    const query = toOrdersSearchParams({ ...params, page }).toString()
    return query === '' ? '/orders' : `/orders?${query}`
  }

  return (
    <section className="d-grid gap-3">
      <title>My orders · Orders Shop</title>
      <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2">
        <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
          My orders
        </h1>
        {/* Always in the page: a new count is announced when filters, sort or paging change the list. */}
        <p role="status" className="min-h-5 small text-body-secondary">
          {data && data.totalCount > 0
            ? `${String(data.totalCount)} ${data.totalCount === 1 ? 'order' : 'orders'}`
            : ''}
        </p>
      </div>

      <OrdersFilters
        key={`${params.statuses.join(',')}|${params.from ?? ''}|${params.to ?? ''}`}
        params={params}
        canClear={filtersActive}
        onApply={(filters) => {
          update((current) => ({ ...current, ...filters, page: 1 }))
        }}
        onClear={clearFilters}
      />

      <FormField
        className="w-52"
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
            {ORDER_SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {ORDER_SORT_LABELS[sort]}
              </option>
            ))}
          </NativeSelect>
        )}
      />

      {isPending && (
        <>
          <p role="status" className="visually-hidden">
            Loading orders…
          </p>
          <div aria-hidden="true" className="d-grid gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="placeholder-glow">
                <span className="placeholder w-100 h-10 rounded" />
              </div>
            ))}
          </div>
        </>
      )}

      {isError && (
        <div role="alert" className="alert alert-danger d-grid justify-items-start gap-2 mb-0">
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
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="d-grid justify-items-start gap-2">
          {params.page > 1 ? (
            <>
              <p>No orders on this page.</p>
              <Link to={pageLink(1)} className={buttonVariants({ variant: 'outline' })}>
                Go to page 1
              </Link>
            </>
          ) : filtersActive ? (
            <>
              <p>No orders match these filters.</p>
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <p>You have not placed any orders yet.</p>
              <Link to="/products" className={buttonVariants()}>
                Browse products
              </Link>
            </>
          )}
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="table-responsive" aria-busy={isFetching}>
          <table className="table table-hover align-middle small">
            <caption className="visually-hidden">Your orders</caption>
            <thead>
              <tr>
                <th scope="col" className="py-2 pe-3 fw-medium">
                  Order
                </th>
                <th scope="col" className="py-2 pe-3 fw-medium">
                  Date
                </th>
                <th scope="col" className="py-2 pe-3 fw-medium">
                  Status
                </th>
                <th scope="col" className="py-2 text-end fw-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((order) => (
                <tr key={order.id}>
                  <th scope="row" className="py-3 pe-3 fw-normal">
                    <Link
                      to={`/orders/${order.id}`}
                      className="font-monospace text-decoration-underline"
                      aria-label={`Order ${shortId(order.id)}`}
                    >
                      #{shortId(order.id)}
                    </Link>
                  </th>
                  <td className="py-3 pe-3">{formatDateTime(order.createdAt)}</td>
                  <td className="py-3 pe-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-end">{formatMoneyIn(order.total, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalCount > 0 && (
        <nav aria-label="Pagination" className="d-flex align-items-center gap-2">
          {params.page > 1 ? (
            <Link to={pageLink(params.page - 1)} className={buttonVariants({ variant: 'outline' })}>
              Previous
            </Link>
          ) : null}
          <span className="small">
            Page {params.page} of {totalPages}
          </span>
          {params.page < totalPages ? (
            <Link to={pageLink(params.page + 1)} className={buttonVariants({ variant: 'outline' })}>
              Next
            </Link>
          ) : null}
        </nav>
      )}
    </section>
  )
}
