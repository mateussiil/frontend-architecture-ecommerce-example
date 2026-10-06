import type { Product } from '../../catalog/domain/Product'
import { Money } from '../../shared/domain/Money'

export class InsufficientStockError extends Error {
  constructor(productName: string, available: number) {
    super(`Só temos ${available} unidade(s) de "${productName}" em estoque.`)
    this.name = 'InsufficientStockError'
  }
}

export class ProductUnavailableError extends Error {
  constructor(productName: string) {
    super(`"${productName}" está indisponível.`)
    this.name = 'ProductUnavailableError'
  }
}

export class InvalidQuantityError extends Error {
  constructor(quantity: number) {
    super(`Quantidade inválida: ${quantity}.`)
    this.name = 'InvalidQuantityError'
  }
}

export class CartItemNotFoundError extends Error {
  constructor(productId: string) {
    super(`O produto "${productId}" não está no carrinho.`)
    this.name = 'CartItemNotFoundError'
  }
}

export interface CartItem {
  productId: string
  name: string
  unitPrice: Money
  quantity: number
}

// O carrinho sabe que existe uma operação "adicionar produto".
// Ele não sabe que existe um botão "Adicionar".
export class Cart {
  private constructor(private readonly items_: CartItem[]) {}

  static empty(): Cart {
    return new Cart([])
  }

  static restore(items: CartItem[]): Cart {
    items.forEach((item) => assertValidQuantity(item.quantity))
    return new Cart(items.map((item) => ({ ...item })))
  }

  items(): CartItem[] {
    return this.items_.map((item) => ({ ...item }))
  }

  quantityOf(productId: string): number {
    return this.items_.find((item) => item.productId === productId)?.quantity ?? 0
  }

  itemCount(): number {
    return this.items_.reduce((count, item) => count + item.quantity, 0)
  }

  isEmpty(): boolean {
    return this.items_.length === 0
  }

  addProduct(product: Product, quantity = 1): Cart {
    assertValidQuantity(quantity)
    if (!product.isAvailable()) {
      throw new ProductUnavailableError(product.name())
    }
    const desired = this.quantityOf(product.id()) + quantity
    if (!product.canSupply(desired)) {
      throw new InsufficientStockError(product.name(), product.stock())
    }
    return this.withItem(product, desired)
  }

  changeQuantity(product: Product, quantity: number): Cart {
    assertValidQuantity(quantity)
    if (!this.has(product.id())) {
      throw new CartItemNotFoundError(product.id())
    }
    if (!product.canSupply(quantity)) {
      throw new InsufficientStockError(product.name(), product.stock())
    }
    return this.withItem(product, quantity)
  }

  removeProduct(productId: string): Cart {
    if (!this.has(productId)) {
      throw new CartItemNotFoundError(productId)
    }
    return new Cart(this.items_.filter((item) => item.productId !== productId))
  }

  subtotalOf(productId: string): Money {
    const item = this.items_.find((i) => i.productId === productId)
    return item ? item.unitPrice.times(item.quantity) : Money.zero()
  }

  total(): Money {
    return this.items_.reduce((sum, item) => sum.add(item.unitPrice.times(item.quantity)), Money.zero())
  }

  private has(productId: string): boolean {
    return this.items_.some((item) => item.productId === productId)
  }

  // O preço é sempre o preço final atual do produto: quem decide o preço é o Product.
  private withItem(product: Product, quantity: number): Cart {
    const item: CartItem = { productId: product.id(), name: product.name(), unitPrice: product.finalPrice(), quantity }
    return this.has(product.id())
      ? new Cart(this.items_.map((i) => (i.productId === product.id() ? item : i)))
      : new Cart([...this.items_, item])
  }
}

function assertValidQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new InvalidQuantityError(quantity)
  }
}
