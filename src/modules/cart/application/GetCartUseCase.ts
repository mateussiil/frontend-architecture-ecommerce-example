import type { Cart } from '../domain/Cart'
import type { CartRepository } from './CartRepository'

export class GetCartUseCase {
  constructor(private readonly carts: CartRepository) {}

  execute(): Promise<Cart> {
    return this.carts.get()
  }
}
