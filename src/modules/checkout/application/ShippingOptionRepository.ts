import type { ShippingOption } from '../domain/ShippingOption'

export interface ShippingOptionRepository {
  list(): Promise<ShippingOption[]>
}
