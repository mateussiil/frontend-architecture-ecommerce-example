import { describe, expect, it, vi } from 'vitest'
import { HttpCouponRepository } from './HttpCouponRepository'

describe('HttpCouponRepository', () => {
  it('busca o cupom normalizado e devolve null quando não existe', async () => {
    const fetchFn = vi.fn(async (url: string) =>
      url.endsWith('/BEMVINDO10')
        ? Response.json({ code: 'BEMVINDO10', percent: 10, minimum_subtotal_cents: 0 })
        : new Response(null, { status: 404 }),
    )
    const repository = new HttpCouponRepository('https://api', fetchFn as unknown as typeof fetch)

    expect((await repository.findByCode(' bemvindo10 '))?.percent()).toBe(10)
    expect(await repository.findByCode('NADA')).toBeNull()
  })
})
