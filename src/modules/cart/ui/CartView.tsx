import { Price } from '../../shared/ui/Price'
import type { Cart } from '../domain/Cart'

interface Props {
  cart: Cart
  error?: string | null
  onChangeQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartView({ cart, error, onChangeQuantity, onRemove }: Props) {
  if (cart.isEmpty()) {
    return (
      <section>
        <h1>Carrinho</h1>
        <p>
          Seu carrinho está vazio. <a href="#/">Ver produtos</a>
        </p>
      </section>
    )
  }

  return (
    <section>
      <h1>Carrinho</h1>
      {error && <p role="alert">{error}</p>}
      <ul className="list">
        {cart.items().map((item) => (
          <li key={item.productId} aria-label={item.name}>
            <span className="grow">{item.name}</span>
            <button aria-label="Diminuir" disabled={item.quantity <= 1} onClick={() => onChangeQuantity(item.productId, item.quantity - 1)}>
              −
            </button>
            <span aria-label="Quantidade">{item.quantity}</span>
            <button aria-label="Aumentar" onClick={() => onChangeQuantity(item.productId, item.quantity + 1)}>
              +
            </button>
            <Price value={cart.subtotalOf(item.productId)} />
            <button onClick={() => onRemove(item.productId)}>Remover</button>
          </li>
        ))}
      </ul>
      <p className="total">
        Total: <Price value={cart.total()} />
      </p>
      <a className="button" href="#/checkout">
        Finalizar compra
      </a>
    </section>
  )
}
