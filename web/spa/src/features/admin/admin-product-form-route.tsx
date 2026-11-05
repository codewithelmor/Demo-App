/** FR-F052, FR-F053: create a product, and replace one with If-Match. */
import { confirmSubmit } from '@/lib/confirm'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams, type LoaderFunctionArgs } from 'react-router'
import { productKeys } from '@/api/products'
import { FormAlert } from '@/components/form-alert'
import { FormField } from '@/components/form-field'
import { SubmitRow } from '@/components/submit-row'
import { buttonVariants, Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  adminProductQuery,
  createProduct,
  updateProduct,
  type AdminProductData,
} from '@/features/admin/admin-products-api'
import {
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
} from '@/features/admin/admin-product-schema'
import { useServerFailure } from '@/hooks/use-server-failure'
import { apiErrorMessage } from '@/lib/error-message'
import { ApiError } from '@/lib/problem-details'

/** Starts reading the product before the edit page renders. */
export function adminProductLoader(queryClient: QueryClient) {
  return ({ params }: LoaderFunctionArgs) => {
    if (params.productId)
      queryClient.query(adminProductQuery(params.productId)).catch(() => undefined)
    return null
  }
}

/** The form's field names. */
const fieldNames = ['name', 'sku', 'description', 'price', 'stockQuantity'] as const

/** Empty form for a new product. */
const emptyValues: ProductFormInput = {
  name: '',
  sku: '',
  description: '',
  price: '',
  stockQuantity: '0',
}

/** Page for `/admin/products/new`. */
export function AdminProductCreateRoute() {
  return (
    <section className="d-grid max-w-xl gap-3">
      <title>New product · Back office · Orders Shop</title>
      <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
        New product
      </h1>
      <ProductForm />
    </section>
  )
}

/** Page for `/admin/products/:productId`: reads the product with its ETag, then shows the form. */
export function AdminProductEditRoute() {
  const { productId = '' } = useParams()
  const { data, error, isPending, isError, refetch, isFetching } = useQuery(
    adminProductQuery(productId),
  )
  return (
    <section className="d-grid max-w-xl gap-3">
      <title>Edit product · Back office · Orders Shop</title>
      <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
        Edit product
      </h1>
      {isPending && <p role="status">Loading product…</p>}
      {isError && (
        <div role="alert" className="alert alert-danger d-grid justify-items-start gap-2 mb-0">
          <p>{apiErrorMessage(error)}</p>
          {!(error instanceof ApiError && error.status === 404) && (
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
        </div>
      )}
      {data && <ProductForm data={data} />}
    </section>
  )
}

/** Converts a saved product into form text values. */
function toInput(data: AdminProductData): ProductFormInput {
  const { product } = data
  return {
    name: product.name,
    sku: product.sku,
    description: product.description ?? '',
    price: product.price.toFixed(2),
    stockQuantity: String(product.stockQuantity),
  }
}

/**
 * Shared create/edit form. With `data` it edits: the save sends the ETag as If-Match. On a 412 (someone saved
 * first) the form is filled with the latest saved values and a notice says so, so the admin can re-apply
 * the change on top of the newest version.
 */
function ProductForm({ data }: { data?: AdminProductData }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const editing = data !== undefined
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    mode: 'onChange',
    resolver: zodResolver(productSchema),
    defaultValues: data ? toInput(data) : emptyValues,
  })
  const { failure, secondsLeft, locked, fail, clear } = useServerFailure(setError, fieldNames)
  const [etag, setEtag] = useState(data?.etag)
  // The saved values the form opened with (or reloaded after a conflict); an edit can only be saved once one differs.
  const [baseline, setBaseline] = useState(data ? toInput(data) : emptyValues)
  const typed = useWatch({ control })
  const hasChanges =
    !editing || fieldNames.some((field) => (typed[field] ?? baseline[field]) !== baseline[field])
  const [conflicts, setConflicts] = useState(0)
  const conflictRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (conflicts > 0) conflictRef.current?.focus()
  }, [conflicts])

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      data ? updateProduct(data.product.id, etag, values) : createProduct(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productKeys.all })
      await navigate('/admin/products')
    },
    onError: async (cause) => {
      if (data && cause instanceof ApiError && cause.status === 412) {
        try {
          const fresh = await queryClient.query({
            ...adminProductQuery(data.product.id),
            staleTime: 0,
          })
          const latest = toInput(fresh)
          for (const field of fieldNames) setValue(field, latest[field])
          setEtag(fresh.etag)
          setBaseline(latest)
          setConflicts((count) => count + 1)
        } catch (reloadError) {
          fail(reloadError)
        }
        return
      }
      fail(cause)
    },
  })

  return (
    <>
      {conflicts > 0 && (
        <div
          ref={conflictRef}
          role="alert"
          tabIndex={-1}
          className="alert alert-warning mb-0 small focus-target"
        >
          <p className="fw-medium">This product changed since you opened it.</p>
          <p>The form now shows the latest saved values. Apply your change again and save.</p>
        </div>
      )}
      <FormAlert failure={failure} />
      <form
        noValidate
        onSubmit={(event) => {
          clear()
          void handleSubmit(async (values) => {
            if (
              !(await confirmSubmit({ title: 'Save this product?', confirmLabel: 'Save product' }))
            )
              return
            mutation.mutate(values)
          })(event)
        }}
        className="d-grid gap-3"
      >
        <FormField
          label="Name"
          error={errors.name?.message}
          render={(a11y) => <Input {...a11y} {...register('name')} />}
        />
        <FormField
          label="SKU"
          hint="Letters, digits and hyphens. Stored in upper case."
          error={errors.sku?.message}
          render={(a11y) => <Input autoCapitalize="characters" {...a11y} {...register('sku')} />}
        />
        <FormField
          label="Description (optional)"
          error={errors.description?.message}
          render={(a11y) => <Textarea {...a11y} {...register('description')} />}
        />
        <FormField
          label="Price"
          error={errors.price?.message}
          render={(a11y) => <Input inputMode="decimal" {...a11y} {...register('price')} />}
        />
        <FormField
          label="Stock quantity"
          error={errors.stockQuantity?.message}
          render={(a11y) => <Input inputMode="numeric" {...a11y} {...register('stockQuantity')} />}
        />
        <div className="d-flex flex-wrap align-items-center gap-2">
          <SubmitRow
            label={editing ? 'Save changes' : 'Create product'}
            pendingLabel="Saving…"
            pending={mutation.isPending}
            secondsLeft={locked ? secondsLeft : 0}
            disabled={!hasChanges}
          />
          <Link to="/admin/products" className={buttonVariants({ variant: 'outline' })}>
            Cancel
          </Link>
        </div>
      </form>
    </>
  )
}
