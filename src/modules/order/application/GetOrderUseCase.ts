import type { Order } from '../domain/Order'
import type { OrderRepository } from './OrderRepository'

export class GetOrderUseCase {
  constructor(private readonly orders: OrderRepository) {}

  execute(orderId: string): Promise<Order> {
    return this.orders.get(orderId)
  }
}
