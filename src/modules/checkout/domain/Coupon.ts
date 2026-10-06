import type { Money } from '../../shared/domain/Money'

export class InvalidCouponError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidCouponError'
  }
}

export interface CouponProps {
  code: string
  percent: number
  minimumSubtotal: Money
}

export class Coupon {
  private constructor(private readonly props: CouponProps) {}

  static create(props: CouponProps): Coupon {
    if (props.percent <= 0 || props.percent > 100) {
      throw new InvalidCouponError(`Percentual inválido para o cupom "${props.code}".`)
    }
    return new Coupon({ ...props, code: props.code.trim().toUpperCase() })
  }

  code(): string {
    return this.props.code
  }

  percent(): number {
    return this.props.percent
  }

  minimumSubtotal(): Money {
    return this.props.minimumSubtotal
  }

  isApplicableTo(subtotal: Money): boolean {
    return !subtotal.isLessThan(this.props.minimumSubtotal)
  }
}
