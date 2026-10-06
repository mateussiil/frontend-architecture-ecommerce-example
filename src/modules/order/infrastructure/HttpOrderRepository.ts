import { OrderNotFoundError, type OrderRepository } from '../application/OrderRepository'
import type { Order } from '../domain/Order'
import { OrderMapper, type OrderDTO } from './OrderMapper'

export class HttpOrderRepository implements OrderRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: typeof fetch = (...args) => fetch(...args),
    private readonly generateId: () => string = () => crypto.randomUUID(),
  ) {}

  // O id é gerado no cliente para que o PUT seja idempotente: reenviar o mesmo pedido não duplica.
  async nextId(): Promise<string> {
    return this.generateId()
  }

  async get(id: string): Promise<Order> {
    const response = await this.fetchFn(this.url(id))
    if (response.status === 404) {
      throw new OrderNotFoundError(id)
    }
    if (!response.ok) {
      throw new Error(`Falha ao buscar pedido (HTTP ${response.status}).`)
    }
    return OrderMapper.toDomain((await response.json()) as OrderDTO)
  }

  async save(order: Order): Promise<void> {
    const response = await this.fetchFn(this.url(order.id()), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(OrderMapper.toDTO(order)),
    })
    if (!response.ok) {
      throw new Error(`Falha ao salvar pedido (HTTP ${response.status}).`)
    }
  }

  private url(id: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}/orders/${encodeURIComponent(id)}`
  }
}
