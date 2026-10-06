import type { Cart, CartItem } from '../../cart/domain/Cart'
import { Money } from '../../shared/domain/Money'
import { InvalidCouponError, type Coupon } from './Coupon'
import type { ShippingOption } from './ShippingOption'

// Nenhum cupom, por maior que seja, pode tirar mais do que 30% do subtotal.
export const MAX_DISCOUNT_PERCENT = 30

export class EmptyCartError extends Error {
  constructor() {
    super('Não é possível fazer checkout com o carrinho vazio.')
    this.name = 'EmptyCartError'
  }
}

export class ShippingNotChosenError extends Error {
  constructor(message = 'Escolha uma forma de entrega.') {
    super(message)
    this.name = 'ShippingNotChosenError'
  }
}

interface CheckoutProps {
  cart: Cart
  shippingOptions: ShippingOption[]
  shipping: ShippingOption | null
  coupon: Coupon | null
}

export class Checkout {
  private constructor(private readonly props: CheckoutProps) {}

  static start(cart: Cart, shippingOptions: ShippingOption[]): Checkout {
    if (cart.isEmpty()) {
      throw new EmptyCartError()
    }
    return new Checkout({ cart, shippingOptions: [...shippingOptions], shipping: null, coupon: null })
  }

  items(): CartItem[] {
    return this.props.cart.items()
  }

  shippingOptions(): ShippingOption[] {
    return [...this.props.shippingOptions]
  }

  shipping(): ShippingOption | null {
    return this.props.shipping
  }

  coupon(): Coupon | null {
    return this.props.coupon
  }

  applyCoupon(coupon: Coupon): Checkout {
    if (!coupon.isApplicableTo(this.subtotal())) {
      throw new InvalidCouponError(`O cupom "${coupon.code()}" exige um subtotal mínimo maior.`)
    }
    return new Checkout({ ...this.props, coupon })
  }

  chooseShipping(optionId: string): Checkout {
    const shipping = this.props.shippingOptions.find((o) => o.id() === optionId)
    if (!shipping) {
      throw new ShippingNotChosenError(`Forma de entrega "${optionId}" não está disponível.`)
    }
    return new Checkout({ ...this.props, shipping })
  }

  subtotal(): Money {
    return this.props.cart.total()
  }

  discount(): Money {
    const { coupon } = this.props
    if (!coupon) {
      return Money.zero()
    }
    return this.subtotal().percentage(coupon.percent()).min(this.maxDiscount())
  }

  isDiscountCapped(): boolean {
    const { coupon } = this.props
    return !!coupon && this.maxDiscount().isLessThan(this.subtotal().percentage(coupon.percent()))
  }

  shippingCost(): Money {
    return this.props.shipping?.costFor(this.subtotal()) ?? Money.zero()
  }

  total(): Money {
    return this.subtotal().subtract(this.discount()).add(this.shippingCost())
  }

  canPlaceOrder(): boolean {
    return this.props.shipping !== null
  }

  private maxDiscount(): Money {
    return this.subtotal().percentage(MAX_DISCOUNT_PERCENT)
  }
}
