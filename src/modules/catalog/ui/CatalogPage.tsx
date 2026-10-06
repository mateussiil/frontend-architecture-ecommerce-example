import { useEffect, useState } from 'react'
import type { AddProductToCartUseCase } from '../../cart/application/AddProductToCartUseCase'
import type { Cart } from '../../cart/domain/Cart'
import type { SearchProductsUseCase } from '../application/SearchProductsUseCase'
import type { Product } from '../domain/Product'
import { CatalogView } from './CatalogView'

interface Props {
  searchProducts: SearchProductsUseCase
  addProductToCart: AddProductToCartUseCase
  onCartChange: (cart: Cart) => void
}

// Ponto de entrada da tela: chama os casos de uso e entrega à apresentação o que ela precisa.
export function CatalogPage({ searchProducts, addProductToCart, onCartChange }: Props) {
  // Estado da interface: o termo digitado vive aqui, perto de quem usa.
  const [term, setTerm] = useState('')
  const [products, setProducts] = useState<Product[] | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    searchProducts
      .execute(term)
      .then((result) => active && setProducts(result))
      .catch((e: Error) => active && setError(e.message))
    return () => {
      active = false
    }
  }, [term, searchProducts])

  async function handleAddToCart(productId: string) {
    try {
      const cart = await addProductToCart.execute({ productId })
      onCartChange(cart)
      setMessage('Produto adicionado ao carrinho.')
      setError(null)
    } catch (e) {
      setMessage(null)
      setError((e as Error).message)
    }
  }

  if (!products) {
    return <p role={error ? 'alert' : 'status'}>{error ?? 'Carregando…'}</p>
  }

  return (
    <CatalogView
      products={products}
      term={term}
      message={message}
      error={error}
      onTermChange={setTerm}
      onAddToCart={handleAddToCart}
    />
  )
}
