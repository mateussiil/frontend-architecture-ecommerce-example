import { beforeEach, describe, expect, it } from 'vitest'
import { aProduct } from '../../catalog/testing/fixtures'
import { Money } from '../../shared/domain/Money'
import { LocalStorageCartRepository } from './LocalStorageCartRepository'

describe('LocalStorageCartRepository', () => {
  beforeEach(() => localStorage.clear())

  it('começa com um carrinho vazio', async () => {
    expect((await new LocalStorageCartRepository(localStorage).get()).isEmpty()).toBe(true)
  })

  it('persiste e restaura o carrinho', async () => {
    const product = aProduct({ id: 'caneca', price: Money.cents(4500) })
    const cart = (await new LocalStorageCartRepository(localStorage).get()).addProduct(product, 2)
    await new LocalStorageCartRepository(localStorage).save(cart)

    const reloaded = await new LocalStorageCartRepository(localStorage).get()
    expect(reloaded.quantityOf('caneca')).toBe(2)
    expect(reloaded.total().inCents()).toBe(9000)
  })
})
