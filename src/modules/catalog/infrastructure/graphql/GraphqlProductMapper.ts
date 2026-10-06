import { Money } from '../../../shared/domain/Money'
import { Product } from '../../domain/Product'

// Formato do tipo `Product` no schema GraphQL. Diferente do DTO REST, e o domínio não conhece nenhum dos dois.
export interface GraphqlProduct {
  id: string
  name: string
  description: string
  priceCents: number
  discountPercent: number
  stock: number
  variants: string[] | null
}

export const GraphqlProductMapper = {
  toDomain(node: GraphqlProduct): Product {
    return Product.create({
      id: node.id,
      name: node.name,
      description: node.description,
      price: Money.cents(node.priceCents),
      discountPercent: node.discountPercent,
      stock: node.stock,
      variants: node.variants ?? [],
    })
  },
}
