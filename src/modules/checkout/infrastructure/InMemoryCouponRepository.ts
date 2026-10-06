import type { CouponRepository } from '../application/CouponRepository'
import type { Coupon } from '../domain/Coupon'
import { CouponMapper, type CouponDTO } from './CheckoutMappers'

export class InMemoryCouponRepository implements CouponRepository {
  constructor(private readonly seed: CouponDTO[]) {}

  async findByCode(code: string): Promise<Coupon | null> {
    const dto = this.seed.find((c) => c.code === code.trim().toUpperCase())
    return dto ? CouponMapper.toDomain(dto) : null
  }
}
