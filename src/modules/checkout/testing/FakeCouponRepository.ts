import type { CouponRepository } from '../application/CouponRepository'
import type { Coupon } from '../domain/Coupon'

export class FakeCouponRepository implements CouponRepository {
  constructor(private readonly coupons: Coupon[] = []) {}

  async findByCode(code: string): Promise<Coupon | null> {
    return this.coupons.find((c) => c.code() === code.trim().toUpperCase()) ?? null
  }
}
