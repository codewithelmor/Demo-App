import Paper from '@mui/material/Paper'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/api/products'
import { formatMoney } from '@/lib/money'

/** Props for {@link ProductCard}. */
interface ProductCardProps {
  /** The product to show. */
  product: Product
  /** How many of this product are in the cart (0 = none). */
  inCart: number
  /** The list's query string, so the detail page can link back to the same list. */
  listSearch: string
  /** Called when the user presses "Add to cart". */
  onAdd: (product: Product) => void
}

/** One product in the catalog grid: name, price, stock state, a link to the detail page and an add button. */
export function ProductCard({ product, inCart, listSearch, onAdd }: ProductCardProps) {
  const inStock = product.stockQuantity > 0
  const label = inCart > 0 ? 'Add one more' : 'Add to cart'
  return (
    <Paper
      component="li"
      variant="outlined"
      className="d-grid align-content-start gap-2"
      sx={{ p: 2 }}
    >
      <h2 className="fs-5 fw-medium">
        <Link to={`/products/${product.id}`} state={{ list: listSearch }}>
          {product.name}
        </Link>
      </h2>
      <p className="small text-body-secondary">SKU {product.sku}</p>
      <p className="fw-semibold">{formatMoney(product.price)}</p>
      <div>
        <Badge variant={inStock ? 'default' : 'muted'}>
          {inStock ? 'In stock' : 'Out of stock'}
        </Badge>
      </div>
      {inCart > 0 && <p className="small">{inCart} in cart</p>}
      <div>
        {inStock ? (
          <Button
            type="button"
            variant="success"
            aria-label={`${label}: ${product.name}`}
            onClick={() => {
              onAdd(product)
            }}
          >
            {label}
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled>
            Out of stock
          </Button>
        )}
      </div>
    </Paper>
  )
}
