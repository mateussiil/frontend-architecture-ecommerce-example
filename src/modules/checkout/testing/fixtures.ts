import { Money } from '../../shared/domain/Money'
import { Coupon } from '../domain/Coupon'
import { ShippingOption } from '../domain/ShippingOption'

export const standardShipping = () =>
  ShippingOption.create({
    id: 'padrao',
    label: 'Padrão',
    price: Money.cents(1990),
    estimatedDays: 7,
    freeFrom: Money.cents(20000),
  })

export const expressShipping = () =>
  ShippingOption.create({ id: 'expresso', label: 'Expresso', price: Money.cents(3990), estimatedDays: 2 })

export const welcomeCoupon = () => Coupon.create({ code: 'BEMVINDO10', percent: 10, minimumSubtotal: Money.zero() })

export const halfCoupon = () => Coupon.create({ code: 'METADE', percent: 50, minimumSubtotal: Money.cents(10000) })
