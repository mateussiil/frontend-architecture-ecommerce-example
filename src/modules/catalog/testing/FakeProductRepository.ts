import { ProductNotFoundError, type ProductRepository } from '../application/ProductRepository'
import type { Product } from '../domain/Product'

export class FakeProductRepository implements ProductRepository {
  constructor(private readonly products: Product[] = []) {}

  async list(): Promise<Product[]> {
    return [...this.products]
  }

  async get(id: string): Promise<Product> {
    const product = this.products.find((p) => p.id() === id)
    if (!product) {
      throw new ProductNotFoundError(id)
    }
    return product
  }
}
