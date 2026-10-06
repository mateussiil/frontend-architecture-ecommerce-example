import type { Product } from '../domain/Product'

// A aplicação depende desta abstração, nunca de fetch ou de um SDK.
export interface ProductRepository {
  list(): Promise<Product[]>
  get(id: string): Promise<Product>
}

export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Produto "${id}" não encontrado.`)
    this.name = 'ProductNotFoundError'
  }
}
