import { describe, expect, it } from 'vitest'
import { FakeProductRepository } from '../testing/FakeProductRepository'
import { aProduct } from '../testing/fixtures'
import { SearchProductsUseCase } from './SearchProductsUseCase'

describe('SearchProductsUseCase', () => {
  const repository = new FakeProductRepository([
    aProduct({ id: 'camiseta', name: 'Camiseta Básica' }),
    aProduct({ id: 'caneca', name: 'Caneca', description: 'Cerâmica' }),
  ])

  it('devolve todos os produtos quando não há termo', async () => {
    expect(await new SearchProductsUseCase(repository).execute()).toHaveLength(2)
  })

  it('filtra pelo termo usando a regra do produto', async () => {
    const result = await new SearchProductsUseCase(repository).execute('ceramica')

    expect(result.map((p) => p.id())).toEqual(['caneca'])
  })
})
