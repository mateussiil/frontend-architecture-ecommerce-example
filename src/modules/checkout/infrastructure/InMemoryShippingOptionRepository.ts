import { Money } from '../../shared/domain/Money'
import type { ShippingOptionRepository } from '../application/ShippingOptionRepository'
import { ShippingOption } from '../domain/ShippingOption'

export interface ShippingOptionDTO {
  id: string
  label: string
  price_cents: number
  estimated_days: number
  free_from_cents?: number
}

export class InMemoryShippingOptionRepository implements ShippingOptionRepository {
  constructor(private readonly seed: ShippingOptionDTO[]) {}

  async list(): Promise<ShippingOption[]> {
    return this.seed.map((dto) =>
      ShippingOption.create({
        id: dto.id,
        label: dto.label,
        price: Money.cents(dto.price_cents),
        estimatedDays: dto.estimated_days,
        freeFrom: dto.free_from_cents === undefined ? undefined : Money.cents(dto.free_from_cents),
      }),
    )
  }
}
