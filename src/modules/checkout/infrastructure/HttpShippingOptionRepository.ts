import type { ShippingOptionRepository } from '../application/ShippingOptionRepository'
import type { ShippingOption } from '../domain/ShippingOption'
import { ShippingOptionMapper, type ShippingOptionDTO } from './CheckoutMappers'

export class HttpShippingOptionRepository implements ShippingOptionRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: typeof fetch = (...args) => fetch(...args),
  ) {}

  async list(): Promise<ShippingOption[]> {
    const response = await this.fetchFn(`${this.baseUrl.replace(/\/$/, '')}/shipping-options`)
    if (!response.ok) {
      throw new Error(`Falha ao buscar formas de entrega (HTTP ${response.status}).`)
    }
    return ((await response.json()) as ShippingOptionDTO[]).map(ShippingOptionMapper.toDomain)
  }
}
