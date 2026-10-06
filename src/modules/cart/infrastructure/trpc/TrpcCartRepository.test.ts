import { initTRPC } from '@trpc/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { describe, expect, it } from 'vitest'
import { aProduct } from '../../../catalog/testing/fixtures'
import { Money } from '../../../shared/domain/Money'
import { Cart } from '../../domain/Cart'
import type { CartDTO } from '../CartMapper'
import { createTrpcClient } from './createTrpcClient'
import { TrpcCartRepository } from './TrpcCartRepository'

// Um servidor tRPC de verdade, rodando em memória: valida que o repositório chama
// as procedures certas com o formato certo, passando pelo cliente e pelo protocolo reais.
function inMemoryCartServer() {
  let stored: CartDTO = { items: [] }
  const t = initTRPC.create()
  const router = t.router({
    cart: t.router({
      get: t.procedure.query(() => stored),
      save: t.procedure.input((value) => value as CartDTO).mutation(({ input }) => {
        stored = input
      }),
    }),
  })
  const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) =>
    fetchRequestHandler({ endpoint: '/trpc', req: new Request(input, init), router })) as typeof fetch
  return { fetchFn, stored: () => stored }
}

describe('TrpcCartRepository', () => {
  it('salva e restaura o carrinho através das procedures cart.save e cart.get', async () => {
    const server = inMemoryCartServer()
    const repository = new TrpcCartRepository(createTrpcClient('http://localhost/trpc', server.fetchFn))

    expect((await repository.get()).isEmpty()).toBe(true)

    await repository.save(Cart.empty().addProduct(aProduct({ id: 'caneca', price: Money.cents(4500) }), 2))

    expect(server.stored().items[0]).toMatchObject({ productId: 'caneca', quantity: 2, unitPriceCents: 4500 })
    expect((await repository.get()).total().inCents()).toBe(9000)
  })
})
