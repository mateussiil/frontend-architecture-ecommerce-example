import { beforeEach, describe, expect, it } from 'vitest'
import { OrderNotFoundError } from '../application/OrderRepository'
import { anOrder } from '../testing/fixtures'
import { LocalStorageOrderRepository } from './LocalStorageOrderRepository'

describe('LocalStorageOrderRepository', () => {
  beforeEach(() => localStorage.clear())

  it('persiste e restaura o pedido com status e valores', async () => {
    const repository = new LocalStorageOrderRepository(localStorage)
    await repository.save(anOrder().markPaid('tx-9'))

    const reloaded = await new LocalStorageOrderRepository(localStorage).get('pedido-1')
    expect(reloaded.status()).toBe('paid')
    expect(reloaded.transactionId()).toBe('tx-9')
    expect(reloaded.total().inCents()).toBe(10500)
  })

  it('falha quando o pedido não existe', async () => {
    await expect(new LocalStorageOrderRepository(localStorage).get('x')).rejects.toThrow(OrderNotFoundError)
  })
})
