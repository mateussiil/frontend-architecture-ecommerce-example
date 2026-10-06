import type { Cart } from '../domain/Cart'
import type { CartRepository } from './CartRepository'

export class RemoveProductFromCartUseCase {
  constructor(private readonly carts: CartRepository) {}

  async execute(productId: string): Promise<Cart> {
    const updated = (await this.carts.get()).removeProduct(productId)
    await this.carts.save(updated)
    return updated
  }
}
