import type { ShippingOptionRepository } from '../application/ShippingOptionRepository'
import type { ShippingOption } from '../domain/ShippingOption'

export class FakeShippingOptionRepository implements ShippingOptionRepository {
  constructor(private readonly options: ShippingOption[] = []) {}

  async list(): Promise<ShippingOption[]> {
    return [...this.options]
  }
}
