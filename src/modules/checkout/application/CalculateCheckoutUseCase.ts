import type { CartRepository } from '../../cart/application/CartRepository'
import { Checkout } from '../domain/Checkout'
import { InvalidCouponError } from '../domain/Coupon'
import type { CouponRepository } from './CouponRepository'
import type { ShippingOptionRepository } from './ShippingOptionRepository'

export interface CalculateCheckoutInput {
  couponCode?: string
  shippingOptionId?: string
}

// Monta o checkout sempre a partir da fonte de verdade (carrinho, cupons, fretes).
// A tela guarda só as escolhas do usuário; os valores são sempre recalculados aqui.
export class CalculateCheckoutUseCase {
  constructor(
    private readonly carts: CartRepository,
    private readonly coupons: CouponRepository,
    private readonly shippingOptions: ShippingOptionRepository,
  ) {}

  async execute({ couponCode, shippingOptionId }: CalculateCheckoutInput = {}): Promise<Checkout> {
    const [cart, options] = await Promise.all([this.carts.get(), this.shippingOptions.list()])
    let checkout = Checkout.start(cart, options)

    if (couponCode?.trim()) {
      const coupon = await this.coupons.findByCode(couponCode)
      if (!coupon) {
        throw new InvalidCouponError(`Cupom "${couponCode.trim().toUpperCase()}" não existe.`)
      }
      checkout = checkout.applyCoupon(coupon)
    }
    if (shippingOptionId) {
      checkout = checkout.chooseShipping(shippingOptionId)
    }
    return checkout
  }
}
