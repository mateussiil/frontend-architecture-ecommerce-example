import { Money } from '../../shared/domain/Money'

export interface ShippingOptionProps {
  id: string
  label: string
  price: Money
  estimatedDays: number
  freeFrom?: Money
}

export class ShippingOption {
  private constructor(private readonly props: ShippingOptionProps) {}

  static create(props: ShippingOptionProps): ShippingOption {
    return new ShippingOption({ ...props })
  }

  id(): string {
    return this.props.id
  }

  label(): string {
    return this.props.label
  }

  estimatedDays(): number {
    return this.props.estimatedDays
  }

  freeFrom(): Money | undefined {
    return this.props.freeFrom
  }

  costFor(subtotal: Money): Money {
    const { freeFrom, price } = this.props
    return freeFrom && !subtotal.isLessThan(freeFrom) ? Money.zero() : price
  }
}
