import { Money } from '../../shared/domain/Money'
import { Product, type ProductProps } from '../domain/Product'

export function aProduct(overrides: Partial<ProductProps> = {}): Product {
  return Product.create({
    id: 'camiseta',
    name: 'Camiseta Básica',
    description: 'Algodão orgânico',
    price: Money.cents(7990),
    discountPercent: 0,
    stock: 5,
    variants: [],
    ...overrides,
  })
}
