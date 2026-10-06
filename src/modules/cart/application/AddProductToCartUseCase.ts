import type { ProductRepository } from '../../catalog/application/ProductRepository'
import type { Cart } from '../domain/Cart'
import type { CartRepository } from './CartRepository'

export interface AddProductToCartInput {
  productId: string
  quantity?: number
}

// O caso de uso conhece o fluxo: buscar o produto, entregar ao carrinho, persistir.
// Quem decide se a operação é válida são o Product e o Cart.
export class AddProductToCartUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly carts: CartRepository,
  ) {}

  async execute({ productId, quantity = 1 }: AddProductToCartInput): Promise<Cart> {
    const [product, cart] = await Promise.all([this.products.get(productId), this.carts.get()])
    const updated = cart.addProduct(product, quantity)
    await this.carts.save(updated)
    return updated
  }
}
