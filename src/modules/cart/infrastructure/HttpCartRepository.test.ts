import { describe, expect, it } from 'vitest'
import { HttpCartRepository } from './HttpCartRepository'

describe('HttpCartRepository', () => {
  it('traduz a resposta da API para o domínio', async () => {
    const dto = { items: [{ productId: 'caneca', name: 'Caneca', unitPriceCents: 4050, quantity: 2 }] }
    const cart = await new HttpCartRepository('https://api', async () => Response.json(dto)).get()

    expect(cart.total().inCents()).toBe(8100)
  })

  it('começa vazio quando a API ainda não tem carrinho', async () => {
    const repository = new HttpCartRepository('https://api', async () => new Response(null, { status: 404 }))

    expect((await repository.get()).isEmpty()).toBe(true)
  })
})
