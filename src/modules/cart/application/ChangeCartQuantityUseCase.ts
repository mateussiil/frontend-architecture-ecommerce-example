import type { ProductRepository } from '../../catalog/application/ProductRepository'
import type { Cart } from '../domain/Cart'
import type { CartRepository } from './CartRepository'

export interface ChangeCartQuantityInput {
  productId: string
  quantity: number
}

export class ChangeCartQuantityUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly carts: CartRepository,
  ) {}

  async execute({ productId, quantity }: ChangeCartQuantityInput): Promise<Cart> {
    const [product, cart] = await Promise.all([this.products.get(productId), this.carts.get()])
    const updated = cart.changeQuantity(product, quantity)
    await this.carts.save(updated)
    return updated
  }
}
