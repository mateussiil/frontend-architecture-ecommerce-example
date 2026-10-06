import { ProductNotFoundError, type ProductRepository } from '../application/ProductRepository'
import type { Product } from '../domain/Product'
import { ProductMapper, type ProductDTO } from './ProductMapper'

export class HttpProductRepository implements ProductRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: typeof fetch = (...args) => fetch(...args),
  ) {}

  async list(): Promise<Product[]> {
    const response = await this.fetchFn(this.url('/products'))
    if (!response.ok) {
      throw new Error(`Falha ao buscar produtos (HTTP ${response.status}).`)
    }
    return ((await response.json()) as ProductDTO[]).map(ProductMapper.toDomain)
  }

  async get(id: string): Promise<Product> {
    const response = await this.fetchFn(this.url(`/products/${encodeURIComponent(id)}`))
    if (response.status === 404) {
      throw new ProductNotFoundError(id)
    }
    if (!response.ok) {
      throw new Error(`Falha ao buscar produto (HTTP ${response.status}).`)
    }
    return ProductMapper.toDomain((await response.json()) as ProductDTO)
  }

  private url(path: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}${path}`
  }
}
