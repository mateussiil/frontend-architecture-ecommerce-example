import type { Product } from '../domain/Product'
import type { ProductRepository } from './ProductRepository'

export class GetProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  execute(productId: string): Promise<Product> {
    return this.products.get(productId)
  }
}
