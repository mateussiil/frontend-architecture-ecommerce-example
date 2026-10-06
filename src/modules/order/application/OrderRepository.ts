import type { Order } from '../domain/Order'

export interface OrderRepository {
  nextId(): Promise<string>
  get(id: string): Promise<Order>
  save(order: Order): Promise<void>
}

export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Pedido "${id}" não encontrado.`)
    this.name = 'OrderNotFoundError'
  }
}
