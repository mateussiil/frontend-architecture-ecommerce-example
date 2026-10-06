import type { ShippingOptionRepository } from '../application/ShippingOptionRepository'
import type { ShippingOption } from '../domain/ShippingOption'
import { ShippingOptionMapper, type ShippingOptionDTO } from './CheckoutMappers'

export class InMemoryShippingOptionRepository implements ShippingOptionRepository {
  constructor(private readonly seed: ShippingOptionDTO[]) {}

  async list(): Promise<ShippingOption[]> {
    return this.seed.map(ShippingOptionMapper.toDomain)
  }
}
