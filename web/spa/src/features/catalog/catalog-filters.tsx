import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { z } from '@/lib/zod'
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PRICE_PATTERN, type CatalogParams } from '@/features/catalog/catalog-params'

/** A price typed in the box: empty (no limit) or a valid price like `12` or `12.50`. */
const priceText = z
  .string()
  .trim()
  .refine((value) => value === '' || PRICE_PATTERN.test(value), {
    error: 'Enter a price like 12 or 12.50.',
  })

/** The whole filter form. Min above max is caught here, so no request is made (US-F026 AC3). */
const filtersSchema = z
  .object({ minPrice: priceText, maxPrice: priceText, inStock: z.boolean() })
  .refine(
    (values) =>
      values.minPrice === '' ||
      values.maxPrice === '' ||
      Number(values.minPrice) <= Number(values.maxPrice),
    { path: ['minPrice'], error: 'Min price must be less than or equal to max price.' },
  )

/** What the filter form holds while the user types (prices are text until applied). */
type FiltersValues = z.infer<typeof filtersSchema>

/** Props for {@link CatalogFilters}. */
interface CatalogFiltersProps {
  /** The filters currently in the URL, used as the starting values. */
  params: CatalogParams
  /** Called with the new filters when the user presses "Apply filters" and the input is valid. */
  onApply: (filters: Pick<CatalogParams, 'minPrice' | 'maxPrice' | 'inStock'>) => void
  /** Called when the user presses "Clear filters". */
  onClear: () => void
  /** Whether to show the "Clear filters" button (only when a filter is active). */
  canClear: boolean
}

/**
 * Price range and "in stock only" (wireframe CU-1). Applied with a button, so a half-typed range
// never reaches the API. The parent remounts this form (key) when the URL changes the values.
 */
export function CatalogFilters({ params, onApply, onClear, canClear }: CatalogFiltersProps) {
  const checkboxId = useId()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FiltersValues>({
    mode: 'onChange',
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      minPrice: params.minPrice === undefined ? '' : String(params.minPrice),
      maxPrice: params.maxPrice === undefined ? '' : String(params.maxPrice),
      inStock: params.inStock,
    },
  })

  const onSubmit = (values: FiltersValues) => {
    onApply({
      minPrice: values.minPrice === '' ? undefined : Number(values.minPrice),
      maxPrice: values.maxPrice === '' ? undefined : Number(values.maxPrice),
      inStock: values.inStock,
    })
  }

  return (
    <form
      noValidate
      aria-label="Filters"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event)
      }}
      className="d-flex flex-wrap align-items-start gap-3"
    >
      <div className="w-32">
        <FormField
          label="Min price"
          error={errors.minPrice?.message}
          render={(a11y) => (
            <Input inputMode="decimal" autoComplete="off" {...a11y} {...register('minPrice')} />
          )}
        />
      </div>
      <div className="w-32">
        <FormField
          label="Max price"
          error={errors.maxPrice?.message}
          render={(a11y) => (
            <Input inputMode="decimal" autoComplete="off" {...a11y} {...register('maxPrice')} />
          )}
        />
      </div>
      <div className="form-check min-h-10 d-flex align-items-center gap-2 align-self-end mb-0 ps-0">
        <input
          id={checkboxId}
          type="checkbox"
          className="form-check-input mt-0 ms-0"
          {...register('inStock')}
        />
        <label htmlFor={checkboxId} className="form-check-label">
          In stock only
        </label>
      </div>
      <div className="d-flex gap-2 align-self-end">
        <Button type="submit">Apply filters</Button>
        {canClear && (
          <Button type="button" variant="ghost" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
    </form>
  )
}
