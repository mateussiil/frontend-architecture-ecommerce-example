import { useState } from 'react'
import type { ChangeCartQuantityUseCase } from '../application/ChangeCartQuantityUseCase'
import type { RemoveProductFromCartUseCase } from '../application/RemoveProductFromCartUseCase'
import type { Cart } from '../domain/Cart'
import { CartView } from './CartView'

interface Props {
  cart: Cart
  changeCartQuantity: ChangeCartQuantityUseCase
  removeProductFromCart: RemoveProductFromCartUseCase
  onCartChange: (cart: Cart) => void
}

export function CartPage({ cart, changeCartQuantity, removeProductFromCart, onCartChange }: Props) {
  const [error, setError] = useState<string | null>(null)

  async function run(operation: () => Promise<Cart>) {
    try {
      onCartChange(await operation())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <CartView
      cart={cart}
      error={error}
      onChangeQuantity={(productId, quantity) => run(() => changeCartQuantity.execute({ productId, quantity }))}
      onRemove={(productId) => run(() => removeProductFromCart.execute(productId))}
    />
  )
}
