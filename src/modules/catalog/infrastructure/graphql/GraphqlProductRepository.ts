import { ProductNotFoundError, type ProductRepository } from '../../application/ProductRepository'
import type { Product } from '../../domain/Product'
import { GraphqlProductMapper, type GraphqlProduct } from './GraphqlProductMapper'
import { PRODUCT_QUERY, PRODUCTS_QUERY } from './queries'

interface GraphqlResponse<T> {
  data?: T | null
  errors?: { message: string }[]
}

// Mesmo contrato do HttpProductRepository, outro protocolo.
// GraphQL é só um POST com { query, variables }: não precisa de biblioteca para isso.
export class GraphqlProductRepository implements ProductRepository {
  constructor(
    private readonly endpoint: string,
    private readonly fetchFn: typeof fetch = (...args) => fetch(...args),
  ) {}

  async list(): Promise<Product[]> {
    const data = await this.request<{ products: GraphqlProduct[] }>(PRODUCTS_QUERY)
    return data.products.map(GraphqlProductMapper.toDomain)
  }

  async get(id: string): Promise<Product> {
    const data = await this.request<{ product: GraphqlProduct | null }>(PRODUCT_QUERY, { id })
    if (!data.product) {
      throw new ProductNotFoundError(id)
    }
    return GraphqlProductMapper.toDomain(data.product)
  }

  private async request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const response = await this.fetchFn(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
    if (!response.ok) {
      throw new Error(`Falha na consulta GraphQL (HTTP ${response.status}).`)
    }
    const { data, errors } = (await response.json()) as GraphqlResponse<T>
    if (errors?.length || !data) {
      throw new Error(`Falha na consulta GraphQL: ${errors?.map((e) => e.message).join('; ') ?? 'sem dados'}.`)
    }
    return data
  }
}
