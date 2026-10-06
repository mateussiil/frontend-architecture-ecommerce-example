import { Money } from '../../shared/domain/Money'
import { Address, type AddressProps } from '../domain/Address'
import { Order, type OrderStatus } from '../domain/Order'

export interface OrderDTO {
  id: string
  status: OrderStatus
  transactionId?: string
  address: AddressProps
  items: { productId: string; name: string; unitPriceCents: number; quantity: number }[]
  subtotalCents: number
  discountCents: number
  shippingCents: number
}

export const OrderMapper = {
  toDomain(dto: OrderDTO): Order {
    return Order.restore({
      id: dto.id,
      status: dto.status,
      transactionId: dto.transactionId,
      address: Address.create(dto.address),
      items: dto.items.map((i) => ({ ...i, unitPrice: Money.cents(i.unitPriceCents) })),
      subtotal: Money.cents(dto.subtotalCents),
      discount: Money.cents(dto.discountCents),
      shipping: Money.cents(dto.shippingCents),
    })
  },

  toDTO(order: Order): OrderDTO {
    return {
      id: order.id(),
      status: order.status(),
      transactionId: order.transactionId(),
      address: order.address().toProps(),
      items: order.items().map((i) => ({
        productId: i.productId,
        name: i.name,
        unitPriceCents: i.unitPrice.inCents(),
        quantity: i.quantity,
      })),
      subtotalCents: order.subtotal().inCents(),
      discountCents: order.discount().inCents(),
      shippingCents: order.shipping().inCents(),
    }
  },
}
