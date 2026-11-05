import FormControlLabel from '@mui/material/FormControlLabel'
import { Checkbox } from '@/components/ui/checkbox'
/** FR-F051, FR-F054: the admin product list, with delete and restore. */
import { useToast } from '@/theme/toast'
import Alert from '@mui/material/Alert'
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams, type LoaderFunctionArgs } from 'react-router'
import { productKeys, type Product } from '@/api/products'
import { SearchBox } from '@/components/search-box'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button, LinkButton } from '@/components/ui/button'
import { FormField } from '@/components/form-field'
import { NativeSelect } from '@/components/ui/native-select'
import {
  adminProductsQuery,
  deleteProduct,
  restoreProduct,
} from '@/features/admin/admin-products-api'
import {
  ADMIN_SORT_LABELS,
  ADMIN_SORTS,
  parseAdminParams,
  toAdminSearchParams,
  type AdminProductParams,
  type AdminSort,
} from '@/features/admin/admin-products-params'
import { apiErrorMessage } from '@/lib/error-message'
import { formatMoney } from '@/lib/money'

/** Starts the list request before the page renders; the page shows loading and error states itself. */
export function adminProductsLoader(queryClient: QueryClient) {
  return ({ request }: LoaderFunctionArgs) => {
    const params = parseAdminParams(new URL(request.url).searchParams)
    queryClient.query(adminProductsQuery(params)).catch(() => undefined)
    return null
  }
}

/** Type guard: true when the text is one of the allowed sort orders. */
function isSort(value: string): value is AdminSort {
  return ADMIN_SORTS.some((sort) => sort === value)
}

/** Confirmation dialog for the soft delete (EP-26). */
function DeleteProductButton({
  product,
  onDone,
  onError,
}: {
  product: Product
  onDone: () => void
  onError: (cause: unknown) => void
}) {
  const [open, setOpen] = useState(false)
  const toast = useToast()
  const mutation = useMutation({
    mutationFn: () => deleteProduct(product.id),
    onSuccess: () => {
      toast.success('Product archived.')
      setOpen(false)
      onDone()
    },
    onError: (cause) => {
      setOpen(false)
      onError(cause)
    },
  })
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" aria-label={`Delete ${product.name}`}>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
        <AlertDialogDescription>
          Customers will no longer see it. Existing orders keep their lines, and you can restore the
          product later.
        </AlertDialogDescription>
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline" disabled={mutation.isPending}>
              Keep product
            </Button>
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            aria-busy={mutation.isPending}
            onClick={() => {
              mutation.mutate()
            }}
          >
            {mutation.isPending ? 'Deleting…' : 'Delete product'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** One row's restore button (EP-27). */
function RestoreProductButton({
  product,
  onDone,
  onError,
}: {
  product: Product
  onDone: () => void
  onError: (cause: unknown) => void
}) {
  const toast = useToast()
  const mutation = useMutation({
    mutationFn: () => restoreProduct(product.id),
    onSuccess: () => {
      toast.success('Product restored.')
      onDone()
    },
    onError,
  })
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={mutation.isPending}
      aria-busy={mutation.isPending}
      aria-label={`Restore ${product.name}`}
      onClick={() => {
        mutation.mutate()
      }}
    >
      {mutation.isPending ? 'Restoring…' : 'Restore'}
    </Button>
  )
}

/**
 * The admin product list. Search, sort, "include deleted" and the page are in the URL and sent to the API.
 * Deleted rows are marked "Deleted" and offer Restore instead of Edit and Delete.
 */
export function AdminProductsRoute() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const params = parseAdminParams(searchParams)
  const { data, error, isPending, isError, refetch, isFetching } = useQuery(
    adminProductsQuery(params),
  )
  const [actionError, setActionError] = useState<unknown>()
  const [status, setStatus] = useState('')

  function update(change: (current: AdminProductParams) => AdminProductParams, replace = false) {
    setSearchParams((previous) => toAdminSearchParams(change(parseAdminParams(previous))), {
      replace,
    })
  }

  function changed(message: string) {
    setActionError(undefined)
    setStatus(message)
    void queryClient.invalidateQueries({ queryKey: productKeys.all })
  }

  function failed(cause: unknown) {
    setStatus('')
    setActionError(cause)
  }

  const totalPages = Math.max(data?.totalPages ?? 1, 1)
  const pageLink = (page: number) => {
    const query = toAdminSearchParams({ ...params, page }).toString()
    return query === '' ? '/admin/products' : `/admin/products?${query}`
  }

  return (
    <section className="d-grid gap-3">
      <title>Products · Back office · Orders Shop</title>
      <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2">
        <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
          Products
        </h1>
        <LinkButton to="/admin/products/new">New product</LinkButton>
      </div>

      <div className="d-flex flex-wrap align-items-end gap-3">
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
              {ADMIN_SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {ADMIN_SORT_LABELS[sort]}
                </option>
              ))}
            </NativeSelect>
          )}
        />
        <FormControlLabel
          sx={{ m: 0, pb: 1, fontSize: '0.875em' }}
          label="Include deleted"
          control={
            <Checkbox
              checked={params.includeDeleted}
              onChange={(event) => {
                const includeDeleted = event.target.checked
                update((current) => ({ ...current, includeDeleted, page: 1 }))
              }}
            />
          }
        />
      </div>

      {/* Always in the page, so counts and results of delete and restore are announced. */}
      <p role="status" className="min-h-5 small text-body-secondary">
        {status !== ''
          ? status
          : data
            ? `${String(data.totalCount)} ${data.totalCount === 1 ? 'product' : 'products'}`
            : ''}
      </p>
      {actionError !== undefined && (
        <Alert severity="error" role="alert">
          {apiErrorMessage(actionError)}
        </Alert>
      )}

      {isPending && <p role="status">Loading products…</p>}
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
        <p>{params.page > 1 ? 'No products on this page.' : 'No products found.'}</p>
      )}

      {data && data.items.length > 0 && (
        <div className="table-responsive">
          <table aria-busy={isFetching} className="table table-hover align-middle small">
            <caption className="visually-hidden">Products</caption>
            <thead>
              <tr>
                <th scope="col" className="p-2">
                  Name
                </th>
                <th scope="col" className="p-2">
                  SKU
                </th>
                <th scope="col" className="p-2 text-end">
                  Price
                </th>
                <th scope="col" className="p-2 text-end">
                  Stock
                </th>
                <th scope="col" className="p-2">
                  Status
                </th>
                <th scope="col" className="p-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((product) => (
                <tr key={product.id}>
                  <th scope="row" className="p-2 fw-medium">
                    {product.name}
                  </th>
                  <td className="p-2">{product.sku}</td>
                  <td className="p-2 text-end">{formatMoney(product.price)}</td>
                  <td className="p-2 text-end">{product.stockQuantity}</td>
                  <td className="p-2">
                    {product.isDeleted === true ? (
                      <Badge variant="muted">Deleted</Badge>
                    ) : (
                      <Badge>Active</Badge>
                    )}
                  </td>
                  <td className="p-2">
                    <div className="d-flex gap-2">
                      {product.isDeleted === true ? (
                        <RestoreProductButton
                          product={product}
                          onDone={() => {
                            changed(`Restored ${product.name}.`)
                          }}
                          onError={failed}
                        />
                      ) : (
                        <>
                          <LinkButton
                            to={`/admin/products/${product.id}`}
                            aria-label={`Edit ${product.name}`}
                            variant="warning"
                            size="sm"
                          >
                            Edit
                          </LinkButton>
                          <DeleteProductButton
                            product={product}
                            onDone={() => {
                              changed(`Deleted ${product.name}.`)
                            }}
                            onError={failed}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
