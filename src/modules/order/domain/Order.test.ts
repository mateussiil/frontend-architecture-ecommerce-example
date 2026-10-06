import { describe, expect, it } from 'vitest'
import { Money } from '../../shared/domain/Money'
import { anOrder } from '../testing/fixtures'
import { Address, InvalidAddressError } from './Address'
import { InvalidOrderError, InvalidOrderTransitionError } from './Order'

describe('Order', () => {
  it('nasce pendente e calcula o total', () => {
    const order = anOrder()

    expect(order.status()).toBe('pending')
    expect(order.total().inCents()).toBe(10500)
  })

  it('não pode ser criado sem itens', () => {
    expect(() => anOrder({ items: [] })).toThrow(InvalidOrderError)
  })

  it('não pode ter total zero', () => {
    expect(() => anOrder({ subtotal: Money.cents(1000), discount: Money.cents(1000), shipping: Money.zero() })).toThrow(
      InvalidOrderError,
    )
  })

  it('segue a sequência pendente → pago → confirmado', () => {
    const confirmed = anOrder().markPaid('tx-1').confirm()

    expect(confirmed.status()).toBe('confirmed')
    expect(confirmed.transactionId()).toBe('tx-1')
  })

  it('recusa transições fora da sequência', () => {
    expect(() => anOrder().confirm()).toThrow(InvalidOrderTransitionError)
    expect(() => anOrder().cancel().markPaid('tx')).toThrow(InvalidOrderTransitionError)
    expect(anOrder().cancel().canCancel()).toBe(false)
  })
})

describe('Address', () => {
  it('precisa de rua, número, cidade e CEP válido', () => {
    expect(() => Address.create({ street: '', number: '1', city: 'X', zipCode: '90000000' })).toThrow(InvalidAddressError)
    expect(() => Address.create({ street: 'Rua', number: '1', city: 'X', zipCode: '123' })).toThrow(InvalidAddressError)
    expect(Address.create({ street: 'Rua', number: '1', city: 'X', zipCode: '90000-000' }).toProps().zipCode).toBe(
      '90000000',
    )
  })
})
