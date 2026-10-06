import type { CartRepository } from '../application/CartRepository'
import { Cart } from '../domain/Cart'
import { CartMapper, type CartDTO } from './CartMapper'

const KEY = 'cart'

export class LocalStorageCartRepository implements CartRepository {
  constructor(private readonly storage: Storage) {}

  async get(): Promise<Cart> {
    const stored = this.storage.getItem(KEY)
    return stored ? CartMapper.toDomain(JSON.parse(stored) as CartDTO) : Cart.empty()
  }

  async save(cart: Cart): Promise<void> {
    this.storage.setItem(KEY, JSON.stringify(CartMapper.toDTO(cart)))
  }
}
