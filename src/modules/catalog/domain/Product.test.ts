import { describe, expect, it } from 'vitest'
import { Money } from '../../shared/domain/Money'
import { aProduct } from '../testing/fixtures'
import { InvalidProductError, Product } from './Product'

describe('Product', () => {
  it('calcula o preço final aplicando o desconto', () => {
    const product = aProduct({ price: Money.cents(10000), discountPercent: 15 })

    expect(product.hasDiscount()).toBe(true)
    expect(product.finalPrice().inCents()).toBe(8500)
  })

  it('sem desconto, o preço final é o preço de tabela', () => {
    const product = aProduct({ price: Money.cents(4990), discountPercent: 0 })

    expect(product.hasDiscount()).toBe(false)
    expect(product.finalPrice().equals(product.listPrice())).toBe(true)
  })

  it('sabe se está disponível e se consegue atender uma quantidade', () => {
    expect(aProduct({ stock: 0 }).isAvailable()).toBe(false)
    expect(aProduct({ stock: 5 }).canSupply(5)).toBe(true)
    expect(aProduct({ stock: 5 }).canSupply(6)).toBe(false)
    expect(aProduct({ stock: 5 }).canSupply(0)).toBe(false)
  })

  it('sabe quais variantes possui', () => {
    const product = aProduct({ variants: ['P', 'M'] })

    expect(product.hasVariant('M')).toBe(true)
    expect(product.hasVariant('G')).toBe(false)
  })

  it('encontra o produto por nome ou descrição ignorando acentos', () => {
    const product = aProduct({ name: 'Camiseta Básica', description: 'Algodão orgânico' })

    expect(product.matches('basica')).toBe(true)
    expect(product.matches('ALGODAO')).toBe(true)
    expect(product.matches('caneca')).toBe(false)
  })

  it('não pode ser criado com estoque negativo', () => {
    expect(() =>
      Product.create({
        id: 'x',
        name: 'X',
        description: '',
        price: Money.cents(100),
        discountPercent: 0,
        stock: -1,
        variants: [],
      }),
    ).toThrow(InvalidProductError)
  })
})
