import { describe, expect, it } from 'vitest'
import { parseRoute } from './routes'

describe('parseRoute', () => {
  it('traduz o hash para uma rota', () => {
    expect(parseRoute('')).toEqual({ name: 'catalog' })
    expect(parseRoute('#/products/caneca')).toEqual({ name: 'product', productId: 'caneca' })
    expect(parseRoute('#/cart')).toEqual({ name: 'cart' })
    expect(parseRoute('#/checkout')).toEqual({ name: 'checkout' })
    expect(parseRoute('#/orders/abc')).toEqual({ name: 'order', orderId: 'abc' })
    expect(parseRoute('#/qualquer')).toEqual({ name: 'catalog' })
  })
})
