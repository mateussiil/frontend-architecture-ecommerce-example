import type { Order } from '../domain/Order'
import type { OrderRepository } from './OrderRepository'

export class CancelOrderUseCase {
  constructor(private readonly orders: OrderRepository) {}

  async execute(orderId: string): Promise<Order> {
    const cancelled = (await this.orders.get(orderId)).cancel()
    await this.orders.save(cancelled)
    return cancelled
  }
}
