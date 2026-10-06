import { describe, expect, it } from 'vitest'
import { aProduct } from '../../catalog/testing/fixtures'
import { Money } from '../../shared/domain/Money'
import { Cart, CartItemNotFoundError, InsufficientStockError, InvalidQuantityError, ProductUnavailableError } from './Cart'

const camiseta = aProduct({ id: 'camiseta', price: Money.cents(5000), stock: 5 })
const caneca = aProduct({ id: 'caneca', name: 'Caneca', price: Money.cents(2000), discountPercent: 10, stock: 10 })

describe('Cart', () => {
  it('adiciona produtos sem alterar o carrinho original', () => {
    const empty = Cart.empty()
    const cart = empty.addProduct(camiseta, 2)

    expect(cart.quantityOf('camiseta')).toBe(2)
    expect(empty.isEmpty()).toBe(true)
  })

  it('soma a quantidade quando o produto já está no carrinho', () => {
    const cart = Cart.empty().addProduct(camiseta).addProduct(camiseta, 2)

    expect(cart.quantityOf('camiseta')).toBe(3)
    expect(cart.items()).toHaveLength(1)
  })

  it('não deixa adicionar mais do que existe em estoque', () => {
    expect(() => Cart.empty().addProduct(camiseta, 20)).toThrow(InsufficientStockError)
    expect(() => Cart.empty().addProduct(camiseta, 4).addProduct(camiseta, 2)).toThrow(InsufficientStockError)
  })

  it('não deixa adicionar um produto indisponível', () => {
    expect(() => Cart.empty().addProduct(aProduct({ stock: 0 }))).toThrow(ProductUnavailableError)
  })

  it('altera a quantidade respeitando o estoque', () => {
    const cart = Cart.empty().addProduct(camiseta)

    expect(cart.changeQuantity(camiseta, 5).quantityOf('camiseta')).toBe(5)
    expect(() => cart.changeQuantity(camiseta, 6)).toThrow(InsufficientStockError)
    expect(() => cart.changeQuantity(camiseta, 0)).toThrow(InvalidQuantityError)
  })

  it('remove produtos', () => {
    const cart = Cart.empty().addProduct(camiseta).addProduct(caneca)

    expect(cart.removeProduct('camiseta').items().map((i) => i.productId)).toEqual(['caneca'])
    expect(() => Cart.empty().removeProduct('camiseta')).toThrow(CartItemNotFoundError)
  })

  it('calcula o total com o preço final de cada produto', () => {
    const cart = Cart.empty().addProduct(camiseta, 2).addProduct(caneca, 3)

    // 2 × 50,00 + 3 × 18,00
    expect(cart.total().inCents()).toBe(15400)
    expect(cart.itemCount()).toBe(5)
  })
})
