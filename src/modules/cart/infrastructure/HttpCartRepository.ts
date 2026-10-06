import type { CartRepository } from '../application/CartRepository'
import { Cart } from '../domain/Cart'
import { CartMapper, type CartDTO } from './CartMapper'

// O carrinho da sessão atual: a API identifica o comprador (cookie/token), não a URL.
export class HttpCartRepository implements CartRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: typeof fetch = (...args) => fetch(...args),
  ) {}

  async get(): Promise<Cart> {
    const response = await this.fetchFn(this.url(), { credentials: 'include' })
    if (response.status === 404) {
      return Cart.empty()
    }
    if (!response.ok) {
      throw new Error(`Falha ao buscar carrinho (HTTP ${response.status}).`)
    }
    return CartMapper.toDomain((await response.json()) as CartDTO)
  }

  async save(cart: Cart): Promise<void> {
    const response = await this.fetchFn(this.url(), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CartMapper.toDTO(cart)),
    })
    if (!response.ok) {
      throw new Error(`Falha ao salvar carrinho (HTTP ${response.status}).`)
    }
  }

  private url(): string {
    return `${this.baseUrl.replace(/\/$/, '')}/cart`
  }
}
