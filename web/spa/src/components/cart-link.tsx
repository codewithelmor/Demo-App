import { ShoppingCart } from 'lucide-react'
import { NavLink } from 'react-router'
import { useCart } from '@/hooks/use-cart'
import { cn } from '@/lib/utils'

/**
 * The header cart link with a count of distinct products. Only customers have a cart, so for anyone
 * else (an Admin) it renders nothing. The visible text is hidden from screen readers (`aria-hidden`) and
 * replaced by one clear `aria-label` such as "Cart, 2 products".
 */
export function CartLink() {
  const { count, enabled } = useCart()
  if (!enabled) return null
  return (
    <NavLink
      to="/cart"
      aria-label={`Cart, ${String(count)} ${count === 1 ? 'product' : 'products'}`}
      className={({ isActive }) =>
        cn('nav-link d-inline-flex align-items-center gap-2', isActive && 'active')
      }
    >
      <ShoppingCart aria-hidden="true" size={16} />
      <span aria-hidden="true">Cart</span>
      <span aria-hidden="true" className="badge rounded-pill text-bg-light">
        {count}
      </span>
    </NavLink>
  )
}
