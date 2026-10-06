import { OrderNotFoundError, type OrderRepository } from '../application/OrderRepository'
import type { Order } from '../domain/Order'

export class FakeOrderRepository implements OrderRepository {
  readonly saved: Order[] = []
  private readonly orders = new Map<string, Order>()
  private sequence = 0

  constructor(initial: Order[] = []) {
    initial.forEach((o) => this.orders.set(o.id(), o))
  }

  async nextId(): Promise<string> {
    this.sequence += 1
    return `pedido-${this.sequence}`
  }

  async get(id: string): Promise<Order> {
    const order = this.orders.get(id)
    if (!order) {
      throw new OrderNotFoundError(id)
    }
    return order
  }

  async save(order: Order): Promise<void> {
    this.saved.push(order)
    this.orders.set(order.id(), order)
  }
}
