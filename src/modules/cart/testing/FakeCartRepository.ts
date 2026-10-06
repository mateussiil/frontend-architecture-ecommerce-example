import type { CartRepository } from '../application/CartRepository'
import { Cart } from '../domain/Cart'

export class FakeCartRepository implements CartRepository {
  readonly saved: Cart[] = []

  constructor(private cart: Cart = Cart.empty()) {}

  async get(): Promise<Cart> {
    return this.cart
  }

  async save(cart: Cart): Promise<void> {
    this.saved.push(cart)
    this.cart = cart
  }
}
