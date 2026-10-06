import type { Product } from '../domain/Product'
import { ProductCard } from './ProductCard'

interface Props {
  products: Product[]
  term: string
  message?: string | null
  error?: string | null
  onTermChange: (term: string) => void
  onAddToCart: (productId: string) => void
}

export function CatalogView({ products, term, message, error, onTermChange, onAddToCart }: Props) {
  return (
    <section>
      <header className="page-header">
        <h1>Produtos</h1>
        <input
          type="search"
          aria-label="Buscar produtos"
          placeholder="Buscar…"
          value={term}
          onChange={(e) => onTermChange(e.target.value)}
        />
      </header>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
      {products.length === 0 ? (
        <p className="muted">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.id()} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  )
}
