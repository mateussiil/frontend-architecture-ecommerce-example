import { OrderNotFoundError, type OrderRepository } from '../application/OrderRepository'
import type { Order } from '../domain/Order'
import { OrderMapper, type OrderDTO } from './OrderMapper'

const KEY_PREFIX = 'order:'

export class LocalStorageOrderRepository implements OrderRepository {
  constructor(
    private readonly storage: Storage,
    private readonly generateId: () => string = () => crypto.randomUUID().slice(0, 8),
  ) {}

  async nextId(): Promise<string> {
    return this.generateId()
  }

  async get(id: string): Promise<Order> {
    const stored = this.storage.getItem(KEY_PREFIX + id)
    if (!stored) {
      throw new OrderNotFoundError(id)
    }
    return OrderMapper.toDomain(JSON.parse(stored) as OrderDTO)
  }

  async save(order: Order): Promise<void> {
    this.storage.setItem(KEY_PREFIX + order.id(), JSON.stringify(OrderMapper.toDTO(order)))
  }
}
