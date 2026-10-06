import { Money } from '../../shared/domain/Money'
import type { CouponRepository } from '../application/CouponRepository'
import { Coupon } from '../domain/Coupon'

export interface CouponDTO {
  code: string
  percent: number
  minimum_subtotal_cents: number
}

export class InMemoryCouponRepository implements CouponRepository {
  constructor(private readonly seed: CouponDTO[]) {}

  async findByCode(code: string): Promise<Coupon | null> {
    const dto = this.seed.find((c) => c.code === code.trim().toUpperCase())
    return dto
      ? Coupon.create({ code: dto.code, percent: dto.percent, minimumSubtotal: Money.cents(dto.minimum_subtotal_cents) })
      : null
  }
}
