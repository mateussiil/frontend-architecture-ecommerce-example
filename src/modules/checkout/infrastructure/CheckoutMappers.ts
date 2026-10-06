import { Money } from '../../shared/domain/Money'
import { Coupon } from '../domain/Coupon'
import { ShippingOption } from '../domain/ShippingOption'

// Formatos que vêm da API. O domínio não conhece estes formatos.
export interface CouponDTO {
  code: string
  percent: number
  minimum_subtotal_cents: number
}

export interface ShippingOptionDTO {
  id: string
  label: string
  price_cents: number
  estimated_days: number
  free_from_cents?: number
}

export const CouponMapper = {
  toDomain(dto: CouponDTO): Coupon {
    return Coupon.create({
      code: dto.code,
      percent: dto.percent,
      minimumSubtotal: Money.cents(dto.minimum_subtotal_cents),
    })
  },
}

export const ShippingOptionMapper = {
  toDomain(dto: ShippingOptionDTO): ShippingOption {
    return ShippingOption.create({
      id: dto.id,
      label: dto.label,
      price: Money.cents(dto.price_cents),
      estimatedDays: dto.estimated_days,
      freeFrom: dto.free_from_cents === undefined ? undefined : Money.cents(dto.free_from_cents),
    })
  },
}
