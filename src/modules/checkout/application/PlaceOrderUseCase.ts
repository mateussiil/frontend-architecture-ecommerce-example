import type { CartRepository } from '../../cart/application/CartRepository'
import { Cart } from '../../cart/domain/Cart'
import type { OrderRepository } from '../../order/application/OrderRepository'
import { Address, type AddressProps } from '../../order/domain/Address'
import { Order } from '../../order/domain/Order'
import type { PaymentGateway } from '../../payment/application/PaymentGateway'
import { createPayment } from '../../payment/domain/Payment'
import { ShippingNotChosenError } from '../domain/Checkout'
import type { CalculateCheckoutUseCase } from './CalculateCheckoutUseCase'

export class PaymentDeclinedError extends Error {
  constructor(
    reason: string,
    readonly orderId: string,
  ) {
    super(`Pagamento recusado: ${reason}`)
    this.name = 'PaymentDeclinedError'
  }
}

export interface PlaceOrderInput {
  couponCode?: string
  shippingOptionId?: string
  address: AddressProps
  cardToken: string
}

// O fluxo completo do checkout:
// validar carrinho → calcular frete → aplicar desconto → criar pedido → pagar → confirmar.
// Cada regra pertence a um domínio; este caso de uso só conhece a ordem dos passos.
export class PlaceOrderUseCase {
  constructor(
    private readonly calculateCheckout: CalculateCheckoutUseCase,
    private readonly orders: OrderRepository,
    private readonly payments: PaymentGateway,
    private readonly carts: CartRepository,
  ) {}

  async execute({ couponCode, shippingOptionId, address, cardToken }: PlaceOrderInput): Promise<Order> {
    const checkout = await this.calculateCheckout.execute({ couponCode, shippingOptionId })
    if (!checkout.canPlaceOrder()) {
      throw new ShippingNotChosenError()
    }

    const order = Order.place({
      id: await this.orders.nextId(),
      items: checkout.items(),
      address: Address.create(address),
      subtotal: checkout.subtotal(),
      discount: checkout.discount(),
      shipping: checkout.shippingCost(),
    })
    const payment = createPayment({ orderId: order.id(), amount: order.total(), cardToken })
    await this.orders.save(order)

    const result = await this.payments.pay(payment)
    if (result.status === 'declined') {
      await this.orders.save(order.cancel())
      throw new PaymentDeclinedError(result.reason, order.id())
    }

    const confirmed = order.markPaid(result.transactionId).confirm()
    await this.orders.save(confirmed)
    await this.carts.save(Cart.empty())
    return confirmed
  }
}
