import type { CouponDTO, ShippingOptionDTO } from './CheckoutMappers'

export const seedCoupons: CouponDTO[] = [
  { code: 'BEMVINDO10', percent: 10, minimum_subtotal_cents: 0 },
  { code: 'METADE', percent: 50, minimum_subtotal_cents: 10000 },
]

export const seedShippingOptions: ShippingOptionDTO[] = [
  { id: 'padrao', label: 'Padrão', price_cents: 1990, estimated_days: 7, free_from_cents: 20000 },
  { id: 'expresso', label: 'Expresso', price_cents: 3990, estimated_days: 2 },
]
