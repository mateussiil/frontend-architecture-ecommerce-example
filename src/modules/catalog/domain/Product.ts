import { Money } from '../../shared/domain/Money'

export class InvalidProductError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidProductError'
  }
}

export interface ProductProps {
  id: string
  name: string
  description: string
  price: Money
  discountPercent: number
  stock: number
  variants: string[]
}

// O produto não é só um objeto com propriedades: ele sabe responder sobre si mesmo.
export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(props: ProductProps): Product {
    if (!Number.isInteger(props.stock) || props.stock < 0) {
      throw new InvalidProductError(`Estoque inválido para "${props.name}".`)
    }
    if (props.discountPercent < 0 || props.discountPercent >= 100) {
      throw new InvalidProductError(`Desconto inválido para "${props.name}".`)
    }
    return new Product({ ...props, variants: [...props.variants] })
  }

  id(): string {
    return this.props.id
  }

  name(): string {
    return this.props.name
  }

  description(): string {
    return this.props.description
  }

  stock(): number {
    return this.props.stock
  }

  variants(): string[] {
    return [...this.props.variants]
  }

  listPrice(): Money {
    return this.props.price
  }

  discountPercent(): number {
    return this.props.discountPercent
  }

  isAvailable(): boolean {
    return this.props.stock > 0
  }

  hasDiscount(): boolean {
    return this.props.discountPercent > 0
  }

  finalPrice(): Money {
    return this.props.price.subtract(this.props.price.percentage(this.props.discountPercent))
  }

  hasVariant(variant: string): boolean {
    return this.props.variants.includes(variant)
  }

  canSupply(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity > 0 && quantity <= this.props.stock
  }

  matches(term: string): boolean {
    const normalized = normalize(term)
    return normalize(this.props.name).includes(normalized) || normalize(this.props.description).includes(normalized)
  }
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
