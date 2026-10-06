import { describe, expect, it, vi } from 'vitest'
import { OrderNotFoundError } from '../application/OrderRepository'
import { anOrder } from '../testing/fixtures'
import { HttpOrderRepository } from './HttpOrderRepository'
import { OrderMapper } from './OrderMapper'

describe('HttpOrderRepository', () => {
  it('envia o pedido com PUT no formato da API', async () => {
    const fetchFn = vi.fn(async () => new Response(null, { status: 204 }))
    await new HttpOrderRepository('https://api/', fetchFn).save(anOrder())

    expect(fetchFn).toHaveBeenCalledWith('https://api/orders/pedido-1', expect.objectContaining({ method: 'PUT' }))
    const body = JSON.parse((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(body.subtotalCents).toBe(10000)
  })

  it('traduz a resposta para o domínio e o 404 para o erro da aplicação', async () => {
    const dto = OrderMapper.toDTO(anOrder().markPaid('tx-1'))
    const ok = new HttpOrderRepository('https://api', async () => Response.json(dto))
    const missing = new HttpOrderRepository('https://api', async () => new Response(null, { status: 404 }))

    expect((await ok.get('pedido-1')).status()).toBe('paid')
    await expect(missing.get('x')).rejects.toThrow(OrderNotFoundError)
  })
})
