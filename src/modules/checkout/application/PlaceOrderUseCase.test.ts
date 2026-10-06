import { describe, expect, it } from 'vitest'
import { Cart } from '../../cart/domain/Cart'
import { FakeCartRepository } from '../../cart/testing/FakeCartRepository'
import { aProduct } from '../../catalog/testing/fixtures'
import { InvalidAddressError } from '../../order/domain/Address'
import { FakeOrderRepository } from '../../order/testing/FakeOrderRepository'
import { FakePaymentGateway } from '../../payment/infrastructure/FakePaymentGateway'
import { Money } from '../../shared/domain/Money'
import { EmptyCartError, ShippingNotChosenError } from '../domain/Checkout'
import { InvalidCouponError } from '../domain/Coupon'
import { FakeCouponRepository } from '../testing/FakeCouponRepository'
import { FakeShippingOptionRepository } from '../testing/FakeShippingOptionRepository'
import { expressShipping, welcomeCoupon } from '../testing/fixtures'
import { CalculateCheckoutUseCase } from './CalculateCheckoutUseCase'
import { PaymentDeclinedError, PlaceOrderUseCase } from './PlaceOrderUseCase'

const address = { street: 'Rua das Flores', number: '100', city: 'Porto Alegre', zipCode: '90000000' }

function setup(cart = Cart.empty().addProduct(aProduct({ price: Money.cents(5000), stock: 5 }), 2)) {
  const carts = new FakeCartRepository(cart)
  const orders = new FakeOrderRepository()
  const payments = new FakePaymentGateway()
  const calculateCheckout = new CalculateCheckoutUseCase(
    carts,
    new FakeCouponRepository([welcomeCoupon()]),
    new FakeShippingOptionRepository([expressShipping()]),
  )
  const placeOrder = new PlaceOrderUseCase(calculateCheckout, orders, payments, carts)
  return { carts, orders, payments, calculateCheckout, placeOrder }
}

describe('CalculateCheckoutUseCase', () => {
  it('aplica cupom e frete escolhidos', async () => {
    const checkout = await setup().calculateCheckout.execute({ couponCode: 'bemvindo10', shippingOptionId: 'expresso' })

    expect(checkout.total().inCents()).toBe(10000 - 1000 + 3990)
  })

  it('recusa um cupom que não existe', async () => {
    await expect(setup().calculateCheckout.execute({ couponCode: 'NADA' })).rejects.toThrow(InvalidCouponError)
  })
})

describe('PlaceOrderUseCase', () => {
  it('cria o pedido, cobra, confirma e esvazia o carrinho', async () => {
    const { placeOrder, orders, payments, carts } = setup()

    const order = await placeOrder.execute({
      couponCode: 'BEMVINDO10',
      shippingOptionId: 'expresso',
      address,
      cardToken: '4242 4242 4242 4242',
    })

    expect(order.status()).toBe('confirmed')
    expect(order.total().inCents()).toBe(12990)
    expect(payments.payments[0].amount.inCents()).toBe(12990)
    expect(orders.saved.map((o) => o.status())).toEqual(['pending', 'confirmed'])
    expect((await carts.get()).isEmpty()).toBe(true)
  })

  it('cancela o pedido e mantém o carrinho quando o pagamento é recusado', async () => {
    const { placeOrder, orders, carts } = setup()

    await expect(
      placeOrder.execute({ shippingOptionId: 'expresso', address, cardToken: '4000 0000 0000 0002' }),
    ).rejects.toThrow(PaymentDeclinedError)

    expect(orders.saved.map((o) => o.status())).toEqual(['pending', 'cancelled'])
    expect((await carts.get()).isEmpty()).toBe(false)
  })

  it('não cria pedido sem frete, sem endereço válido ou com carrinho vazio', async () => {
    const { placeOrder, orders, payments } = setup()

    await expect(placeOrder.execute({ address, cardToken: '4242' })).rejects.toThrow(ShippingNotChosenError)
    await expect(
      placeOrder.execute({ shippingOptionId: 'expresso', address: { ...address, zipCode: '1' }, cardToken: '4242' }),
    ).rejects.toThrow(InvalidAddressError)
    await expect(
      setup(Cart.empty()).placeOrder.execute({ shippingOptionId: 'expresso', address, cardToken: '4242' }),
    ).rejects.toThrow(EmptyCartError)
    expect(orders.saved).toHaveLength(0)
    expect(payments.payments).toHaveLength(0)
  })
})
