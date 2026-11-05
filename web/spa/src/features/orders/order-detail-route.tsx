import Alert from '@mui/material/Alert'
import { useQueries, useQuery, type QueryClient, type UseQueryResult } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams, type LoaderFunctionArgs } from 'react-router'
import { myOrderQuery, type MyOrder, type OrderStatus } from '@/api/orders'
import { productQuery, type Product } from '@/api/products'
import { Button, LinkButton } from '@/components/ui/button'
import { CancelOrderDialog } from '@/features/orders/cancel-order-dialog'
import { shortId, StatusBadge } from '@/features/orders/status-badge'
import { formatDateTime, parseDate } from '@/lib/dates'
import { apiErrorMessage } from '@/lib/error-message'
import { formatMoneyIn } from '@/lib/money'
import { ApiError } from '@/lib/problem-details'

/** A route loader: React Router runs it before the page shows, so the data is already loading when the page appears. Starts loading one order. */
export function orderDetailLoader(queryClient: QueryClient) {
  return ({ params }: LoaderFunctionArgs) => {
    if (params.orderId) queryClient.query(myOrderQuery(params.orderId)).catch(() => undefined)
    return null
  }
}

/** True when the page was opened right after placing the order (the cart passes it in the history state). */
function cameFromCheckout(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'placed' in state && state.placed === true
}

/**
 * CU-5
 * The order detail page: status, lines with product names, totals and (for Pending orders) a cancel button.
 */
export function OrderDetailRoute() {
  const { orderId = '' } = useParams()
  const location = useLocation()
  const { data, error, isPending, isError, refetch, isFetching } = useQuery(myOrderQuery(orderId))

  if (isPending) {
    return (
      <section className="d-grid gap-3">
        <title>Order · Orders Shop</title>
        <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
          Order
        </h1>
        <p role="status">Loading order…</p>
      </section>
    )
  }

  if (isError) {
    // Another customer's order is a 404 too, so it looks the same as one that does not exist.
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <section className="d-grid max-w-prose justify-items-start gap-3">
        <title>{notFound ? 'Order not found' : 'Order'} · Orders Shop</title>
        <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
          {notFound ? 'Order not found' : 'We could not load this order'}
        </h1>
        {notFound ? (
          <p>Order not found.</p>
        ) : (
          <Alert severity="error" role="alert">
            <p>{apiErrorMessage(error)}</p>
          </Alert>
        )}
        <div className="d-flex gap-2">
          {!notFound && (
            <Button
              variant="outline"
              disabled={isFetching}
              onClick={() => {
                void refetch()
              }}
            >
              {isFetching ? 'Trying again…' : 'Try again'}
            </Button>
          )}
          <LinkButton to="/orders" variant={notFound ? 'default' : 'outline'}>
            Go to My orders
          </LinkButton>
        </div>
      </section>
    )
  }

  return <OrderDetail order={data} placed={cameFromCheckout(location.state)} />
}

/** Plain-language sentence for an order status. */
function statusText(status: OrderStatus): string {
  return status === 'Cancelled' ? 'Order cancelled.' : `Order status is now ${status}.`
}

/** What the page shows for a line's product name (EP-23, one call per distinct product, kept for the session). */
function productCell(query: UseQueryResult<Product> | undefined, productId: string) {
  if (!query || query.isPending) {
    return (
      <span aria-busy="true" className="text-body-secondary">
        Loading name…
      </span>
    )
  }
  if (query.isError) {
    return query.error instanceof ApiError && query.error.status === 404 ? (
      <span>Product no longer available</span>
    ) : (
      <span className="text-body-secondary">Name not available</span>
    )
  }
  return (
    <Link to={`/products/${productId}`} className="text-decoration-underline">
      {query.data.name}
    </Link>
  )
}

/** The loaded order, drawn. `placed` is true right after checkout, to show a "thank you" message. */
function OrderDetail({ order, placed }: { order: MyOrder; placed: boolean }) {
  // Status changes are announced: after a cancel, or when the order moved on while the page was open.
  const [seenStatus, setSeenStatus] = useState(order.status)
  const [announcement, setAnnouncement] = useState('')
  if (order.status !== seenStatus) {
    setSeenStatus(order.status)
    setAnnouncement(statusText(order.status))
  }
  const [conflict, setConflict] = useState<string | undefined>()

  // Focus must not be lost (WCAG 2.4.3): when the loading page is replaced by the order, and when a
  // status change removes the button that had focus (Cancel order), it moves to the page heading.
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const active = document.activeElement
    if (!active || active === document.body) headingRef.current?.focus()
  }, [])
  useEffect(() => {
    if (announcement !== '') headingRef.current?.focus()
  }, [announcement])

  // Names: one call per distinct product, at most 50 (an order has at most 50 lines). A name does
  // not change, so it is kept for the whole session.
  const productIds = [...new Set(order.items.map((item) => item.productId))]
  const names = useQueries({
    queries: productIds.map((id) => ({ ...productQuery(id), staleTime: Infinity })),
  })
  const nameFor = (id: string) => names[productIds.indexOf(id)]

  const history = [...order.history].sort(
    (a, b) => (parseDate(b.at)?.getTime() ?? 0) - (parseDate(a.at)?.getTime() ?? 0),
  )
  const placedAt = formatDateTime(order.createdAt)
  const updatedAt = formatDateTime(order.lastModifiedAt)

  return (
    <section className="d-grid gap-3">
      <title>{`Order #${shortId(order.id)} · Orders Shop`}</title>
      <Link to="/orders" className="small text-decoration-underline">
        My orders
      </Link>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <h1 ref={headingRef} tabIndex={-1} className="font-monospace fs-3 fw-semibold focus-target">
          Order #{shortId(order.id)}
        </h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="small text-body-secondary">
        Placed {placedAt}
        {updatedAt && updatedAt !== placedAt ? `. Last updated ${updatedAt}` : ''}
      </p>

      {/* Always in the page, so status changes are announced. */}
      <p role="status" className="min-h-5 small">
        {announcement}
      </p>
      {/* A region that is always in the page, so the text is announced; empty (and hidden) unless the order was just placed. */}
      {placed ? (
        <Alert severity="success" role="status">
          Order placed. We will confirm it soon.
        </Alert>
      ) : (
        <p role="status" className="visually-hidden" />
      )}
      {conflict && (
        <Alert severity="error" role="alert">
          {conflict}
        </Alert>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle small">
          <caption className="visually-hidden">Items in this order</caption>
          <thead>
            <tr>
              <th scope="col" className="py-2 pe-3 fw-medium">
                Product
              </th>
              <th scope="col" className="py-2 pe-3 text-end fw-medium">
                Unit price
              </th>
              <th scope="col" className="py-2 pe-3 text-end fw-medium">
                Qty
              </th>
              <th scope="col" className="py-2 text-end fw-medium">
                Line total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId}>
                <th scope="row" className="py-3 pe-3 fw-normal">
                  {productCell(nameFor(item.productId), item.productId)}
                </th>
                <td className="py-3 pe-3 text-end">
                  {formatMoneyIn(item.unitPrice, order.currency)}
                </td>
                <td className="py-3 pe-3 text-end">{item.quantity}</td>
                <td className="py-3 text-end">{formatMoneyIn(item.lineTotal, order.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fs-5 fw-semibold">
        Total {formatMoneyIn(order.total, order.currency)} ({order.currency})
      </p>

      <div className="d-grid gap-2">
        <h2 className="fs-5 fw-medium">Status history</h2>
        <ol aria-label="Status history" className="d-grid gap-1 small">
          {history.map((entry) => (
            <li key={`${String(entry.at)}-${entry.to}`}>
              {entry.from ? `${entry.from} to ${entry.to}` : `Placed as ${entry.to}`}
              {', '}
              {formatDateTime(entry.at)}
              {entry.reason ? `. Reason: ${entry.reason}` : ''}
            </li>
          ))}
        </ol>
      </div>

      {order.status === 'Pending' ? (
        <div>
          <CancelOrderDialog orderId={order.id} onConflict={setConflict} />
        </div>
      ) : (
        <p className="small text-body-secondary">Only pending orders can be cancelled.</p>
      )}
    </section>
  )
}
