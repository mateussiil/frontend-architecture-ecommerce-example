import type { Product } from '../domain/Product'
import type { ProductRepository } from './ProductRepository'

export class SearchProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(term = ''): Promise<Product[]> {
    const all = await this.products.list()
    return term.trim() ? all.filter((product) => product.matches(term)) : all
  }
}
