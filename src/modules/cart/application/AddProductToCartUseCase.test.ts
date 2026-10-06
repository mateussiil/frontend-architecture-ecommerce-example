import { describe, expect, it } from 'vitest'
import { ProductNotFoundError } from '../../catalog/application/ProductRepository'
import { FakeProductRepository } from '../../catalog/testing/FakeProductRepository'
import { aProduct } from '../../catalog/testing/fixtures'
import { InsufficientStockError } from '../domain/Cart'
import { FakeCartRepository } from '../testing/FakeCartRepository'
import { AddProductToCartUseCase } from './AddProductToCartUseCase'

describe('AddProductToCartUseCase', () => {
  const products = new FakeProductRepository([aProduct({ id: 'camiseta', stock: 5 })])

  it('adiciona o produto e persiste o carrinho', async () => {
    const carts = new FakeCartRepository()
    const addProductToCart = new AddProductToCartUseCase(products, carts)

    const cart = await addProductToCart.execute({ productId: 'camiseta', quantity: 2 })

    expect(cart.quantityOf('camiseta')).toBe(2)
    expect(carts.saved).toEqual([cart])
  })

  it('não persiste nada quando o domínio recusa a operação', async () => {
    const carts = new FakeCartRepository()
    const addProductToCart = new AddProductToCartUseCase(products, carts)

    await expect(addProductToCart.execute({ productId: 'camiseta', quantity: 20 })).rejects.toThrow(
      InsufficientStockError,
    )
    expect(carts.saved).toHaveLength(0)
  })

  it('propaga quando o produto não existe', async () => {
    const addProductToCart = new AddProductToCartUseCase(products, new FakeCartRepository())

    await expect(addProductToCart.execute({ productId: 'x' })).rejects.toThrow(ProductNotFoundError)
  })
})
