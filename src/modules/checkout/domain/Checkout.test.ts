import { describe, expect, it } from 'vitest'
import { Cart } from '../../cart/domain/Cart'
import { aProduct } from '../../catalog/testing/fixtures'
import { Money } from '../../shared/domain/Money'
import { expressShipping, halfCoupon, standardShipping, welcomeCoupon } from '../testing/fixtures'
import { Checkout, EmptyCartError, ShippingNotChosenError } from './Checkout'
import { InvalidCouponError } from './Coupon'

const cartOf = (cents: number, quantity = 1) =>
  Cart.empty().addProduct(aProduct({ price: Money.cents(cents), stock: 10 }), quantity)

const start = (cart: Cart) => Checkout.start(cart, [standardShipping(), expressShipping()])

describe('Checkout', () => {
  it('não começa com o carrinho vazio', () => {
    expect(() => start(Cart.empty())).toThrow(EmptyCartError)
  })

  it('só permite fechar o pedido depois de escolher a entrega', () => {
    const checkout = start(cartOf(5000))

    expect(checkout.canPlaceOrder()).toBe(false)
    expect(checkout.chooseShipping('expresso').canPlaceOrder()).toBe(true)
    expect(() => checkout.chooseShipping('drone')).toThrow(ShippingNotChosenError)
  })

  it('soma o frete ao total', () => {
    const checkout = start(cartOf(5000)).chooseShipping('expresso')

    expect(checkout.shippingCost().inCents()).toBe(3990)
    expect(checkout.total().inCents()).toBe(8990)
  })

  it('o frete padrão é grátis a partir de R$ 200', () => {
    expect(start(cartOf(19999)).chooseShipping('padrao').shippingCost().inCents()).toBe(1990)
    expect(start(cartOf(20000)).chooseShipping('padrao').shippingCost().isZero()).toBe(true)
  })

  it('aplica o desconto do cupom sobre o subtotal', () => {
    const checkout = start(cartOf(5000, 2)).applyCoupon(welcomeCoupon()).chooseShipping('expresso')

    expect(checkout.discount().inCents()).toBe(1000)
    expect(checkout.total().inCents()).toBe(10000 - 1000 + 3990)
  })

  it('o desconto não pode ultrapassar 30% do subtotal', () => {
    const checkout = start(cartOf(10000)).applyCoupon(halfCoupon())

    expect(checkout.discount().inCents()).toBe(3000)
    expect(checkout.isDiscountCapped()).toBe(true)
  })

  it('recusa um cupom quando o subtotal mínimo não foi atingido', () => {
    expect(() => start(cartOf(5000)).applyCoupon(halfCoupon())).toThrow(InvalidCouponError)
  })
})
