import type { Coupon } from '../domain/Coupon'

export interface CouponRepository {
  findByCode(code: string): Promise<Coupon | null>
}
