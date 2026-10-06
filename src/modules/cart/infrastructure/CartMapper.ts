import { Money } from '../../shared/domain/Money'
import { Cart } from '../domain/Cart'

export interface CartDTO {
  items: { productId: string; name: string; unitPriceCents: number; quantity: number }[]
}

export const CartMapper = {
  toDomain(dto: CartDTO): Cart {
    return Cart.restore(
      dto.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        unitPrice: Money.cents(item.unitPriceCents),
        quantity: item.quantity,
      })),
    )
  },

  toDTO(cart: Cart): CartDTO {
    return {
      items: cart.items().map((item) => ({
        productId: item.productId,
        name: item.name,
        unitPriceCents: item.unitPrice.inCents(),
        quantity: item.quantity,
      })),
    }
  },
}
