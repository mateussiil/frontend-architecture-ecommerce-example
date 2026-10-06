import { Price } from '../../shared/ui/Price'
import type { Product } from '../domain/Product'

interface Props {
  product: Product
  onAddToCart: (productId: string) => void
}

// Recebe o produto e uma intenção. Não sabe de onde o produto veio nem como o carrinho é salvo.
export function ProductCard({ product, onAddToCart }: Props) {
  return (
    <article className="card" aria-label={product.name()}>
      <header>
        <h2>
          <a href={`#/products/${product.id()}`}>{product.name()}</a>
        </h2>
        {product.hasDiscount() && <span className="tag">-{product.discountPercent()}%</span>}
      </header>
      <p className="muted">{product.description()}</p>
      <Price value={product.finalPrice()} original={product.listPrice()} />
      <button disabled={!product.isAvailable()} onClick={() => onAddToCart(product.id())}>
        {product.isAvailable() ? 'Adicionar ao carrinho' : 'Esgotado'}
      </button>
    </article>
  )
}
