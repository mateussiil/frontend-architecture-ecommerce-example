import { useEffect, useState } from 'react'
import type { AddProductToCartUseCase } from '../../cart/application/AddProductToCartUseCase'
import type { Cart } from '../../cart/domain/Cart'
import type { GetProductUseCase } from '../application/GetProductUseCase'
import type { Product } from '../domain/Product'
import { ProductDetailsView } from './ProductDetailsView'

interface Props {
  productId: string
  getProduct: GetProductUseCase
  addProductToCart: AddProductToCartUseCase
  onCartChange: (cart: Cart) => void
}

export function ProductPage({ productId, getProduct, addProductToCart, onCartChange }: Props) {
  const [product, setProduct] = useState<Product | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getProduct
      .execute(productId)
      .then((p) => active && setProduct(p))
      .catch((e: Error) => active && setError(e.message))
    return () => {
      active = false
    }
  }, [productId, getProduct])

  async function handleAddToCart(quantity: number) {
    try {
      onCartChange(await addProductToCart.execute({ productId, quantity }))
      setMessage('Produto adicionado ao carrinho.')
      setError(null)
    } catch (e) {
      setMessage(null)
      setError((e as Error).message)
    }
  }

  if (!product) {
    return <p role={error ? 'alert' : 'status'}>{error ?? 'Carregando…'}</p>
  }

  return <ProductDetailsView product={product} message={message} error={error} onAddToCart={handleAddToCart} />
}
