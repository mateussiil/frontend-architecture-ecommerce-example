import { describe, expect, it } from 'vitest'
import { InvalidOrderTransitionError } from '../domain/Order'
import { FakeOrderRepository } from '../testing/FakeOrderRepository'
import { anOrder } from '../testing/fixtures'
import { CancelOrderUseCase } from './CancelOrderUseCase'

describe('CancelOrderUseCase', () => {
  it('cancela e persiste o pedido', async () => {
    const orders = new FakeOrderRepository([anOrder().markPaid('tx').confirm()])

    const cancelled = await new CancelOrderUseCase(orders).execute('pedido-1')

    expect(cancelled.status()).toBe('cancelled')
    expect(orders.saved).toEqual([cancelled])
  })

  it('não persiste quando o domínio recusa a transição', async () => {
    const orders = new FakeOrderRepository([anOrder().cancel()])

    await expect(new CancelOrderUseCase(orders).execute('pedido-1')).rejects.toThrow(InvalidOrderTransitionError)
    expect(orders.saved).toHaveLength(0)
  })
})
