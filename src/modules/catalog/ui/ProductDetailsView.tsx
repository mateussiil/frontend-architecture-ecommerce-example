import { useState } from 'react'
import { Price } from '../../shared/ui/Price'
import type { Product } from '../domain/Product'

interface Props {
  product: Product
  message?: string | null
  error?: string | null
  onAddToCart: (quantity: number) => void
}

// O mesmo Product do catálogo, apresentado de outro jeito. O domínio não mudou, só a apresentação.
export function ProductDetailsView({ product, message, error, onAddToCart }: Props) {
  // Estado da interface: quantidade e variante escolhidas não interessam a mais ninguém.
  const [quantity, setQuantity] = useState(1)
  const [variant, setVariant] = useState(product.variants()[0] ?? null)

  return (
    <article className="details" aria-label={product.name()}>
      <a href="#/">← Voltar</a>
      <h1>{product.name()}</h1>
      <p>{product.description()}</p>
      <Price value={product.finalPrice()} original={product.listPrice()} />
      <p className="muted">{product.isAvailable() ? `${product.stock()} em estoque` : 'Esgotado'}</p>

      {product.variants().length > 0 && (
        <fieldset>
          <legend>Tamanho</legend>
          {product.variants().map((v) => (
            <label key={v}>
              <input type="radio" name="variant" checked={variant === v} onChange={() => setVariant(v)} /> {v}
            </label>
          ))}
        </fieldset>
      )}

      <div className="row">
        <label>
          Quantidade{' '}
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={!product.isAvailable()}
          />
        </label>
        <button disabled={!product.isAvailable()} onClick={() => onAddToCart(quantity)}>
          Adicionar ao carrinho
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </article>
  )
}
