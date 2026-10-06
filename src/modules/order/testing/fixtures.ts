import { Money } from '../../shared/domain/Money'
import { Address } from '../domain/Address'
import { Order, type PlaceOrderProps } from '../domain/Order'

export function anAddress(): Address {
  return Address.create({ street: 'Rua das Flores', number: '100', city: 'Porto Alegre', zipCode: '90000-000' })
}

export function anOrder(overrides: Partial<PlaceOrderProps> = {}): Order {
  return Order.place({
    id: 'pedido-1',
    items: [{ productId: 'camiseta', name: 'Camiseta Básica', unitPrice: Money.cents(5000), quantity: 2 }],
    address: anAddress(),
    subtotal: Money.cents(10000),
    discount: Money.cents(1000),
    shipping: Money.cents(1500),
    ...overrides,
  })
}
