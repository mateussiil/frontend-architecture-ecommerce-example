import { describe, expect, it, vi } from 'vitest'
import { ProductNotFoundError } from '../../application/ProductRepository'
import { GraphqlProductRepository } from './GraphqlProductRepository'

const tenis = {
  id: 'tenis',
  name: 'Tênis de Corrida',
  description: 'Leve',
  priceCents: 39990,
  discountPercent: 20,
  stock: 3,
  variants: null,
}

function graphqlServer(resolve: (body: { query: string; variables: Record<string, unknown> }) => unknown) {
  return vi.fn(async (_url: string, init?: RequestInit) => Response.json(resolve(JSON.parse(init!.body as string))))
}

describe('GraphqlProductRepository', () => {
  it('envia a query com variáveis e traduz o resultado para o domínio', async () => {
    const fetchFn = graphqlServer(({ variables }) => ({ data: { product: variables.id === 'tenis' ? tenis : null } }))
    const repository = new GraphqlProductRepository('https://api/graphql', fetchFn as unknown as typeof fetch)

    const product = await repository.get('tenis')

    expect(product.finalPrice().inCents()).toBe(31992)
    expect(fetchFn).toHaveBeenCalledWith('https://api/graphql', expect.objectContaining({ method: 'POST' }))
  })

  it('traduz `product: null` para o erro da aplicação', async () => {
    const repository = new GraphqlProductRepository(
      'https://api/graphql',
      graphqlServer(() => ({ data: { product: null } })) as unknown as typeof fetch,
    )

    await expect(repository.get('x')).rejects.toThrow(ProductNotFoundError)
  })

  it('lista produtos e falha quando a API devolve `errors`', async () => {
    const ok = new GraphqlProductRepository(
      'https://api/graphql',
      graphqlServer(() => ({ data: { products: [tenis] } })) as unknown as typeof fetch,
    )
    const broken = new GraphqlProductRepository(
      'https://api/graphql',
      graphqlServer(() => ({ data: null, errors: [{ message: 'Cannot query field "x"' }] })) as unknown as typeof fetch,
    )

    expect((await ok.list()).map((p) => p.id())).toEqual(['tenis'])
    await expect(broken.list()).rejects.toThrow('Cannot query field "x"')
  })
})
