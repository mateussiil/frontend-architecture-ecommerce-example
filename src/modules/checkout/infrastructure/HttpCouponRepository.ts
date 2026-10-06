import type { CouponRepository } from '../application/CouponRepository'
import type { Coupon } from '../domain/Coupon'
import { CouponMapper, type CouponDTO } from './CheckoutMappers'

export class HttpCouponRepository implements CouponRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: typeof fetch = (...args) => fetch(...args),
  ) {}

  async findByCode(code: string): Promise<Coupon | null> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/coupons/${encodeURIComponent(code.trim().toUpperCase())}`
    const response = await this.fetchFn(url)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error(`Falha ao buscar cupom (HTTP ${response.status}).`)
    }
    return CouponMapper.toDomain((await response.json()) as CouponDTO)
  }
}
