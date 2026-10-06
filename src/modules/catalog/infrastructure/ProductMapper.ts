import { Money } from '../../shared/domain/Money'
import { Product } from '../domain/Product'

// Formato que vem da API. O domínio não conhece este formato.
export interface ProductDTO {
  id: string
  name: string
  description: string
  price_cents: number
  discount_percent: number
  stock: number
  variants?: string[]
}

export const ProductMapper = {
  toDomain(dto: ProductDTO): Product {
    return Product.create({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      price: Money.cents(dto.price_cents),
      discountPercent: dto.discount_percent,
      stock: dto.stock,
      variants: dto.variants ?? [],
    })
  },
}
