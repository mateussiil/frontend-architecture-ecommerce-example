import { describe, expect, it } from 'vitest'
import { InvalidMoneyError, Money } from './Money'

describe('Money', () => {
  it('só aceita centavos inteiros e não negativos', () => {
    expect(() => Money.cents(10.5)).toThrow(InvalidMoneyError)
    expect(() => Money.cents(-1)).toThrow(InvalidMoneyError)
  })

  it('soma, multiplica e calcula porcentagens sem erro de ponto flutuante', () => {
    const price = Money.cents(1999)

    expect(price.times(3).inCents()).toBe(5997)
    expect(price.add(Money.cents(1)).inCents()).toBe(2000)
    expect(price.percentage(10).inCents()).toBe(200)
  })

  it('nunca fica negativo ao subtrair', () => {
    expect(Money.cents(100).subtract(Money.cents(300)).isZero()).toBe(true)
  })
})
