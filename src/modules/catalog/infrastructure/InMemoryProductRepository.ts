import { ProductNotFoundError, type ProductRepository } from '../application/ProductRepository'
import type { Product } from '../domain/Product'
import { ProductMapper, type ProductDTO } from './ProductMapper'

// Catálogo "de mentira" para o exemplo rodar sem backend.
export class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly seed: ProductDTO[]) {}

  async list(): Promise<Product[]> {
    return this.seed.map(ProductMapper.toDomain)
  }

  async get(id: string): Promise<Product> {
    const dto = this.seed.find((p) => p.id === id)
    if (!dto) {
      throw new ProductNotFoundError(id)
    }
    return ProductMapper.toDomain(dto)
  }
}
