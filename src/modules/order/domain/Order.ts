import { Money } from '../../shared/domain/Money'
import type { Address } from './Address'

export type OrderStatus = 'pending' | 'paid' | 'confirmed' | 'cancelled'

// O status segue uma sequência válida. Essa regra mora aqui, não em um if espalhado pela UI.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['confirmed', 'cancelled'],
  confirmed: ['cancelled'],
  cancelled: [],
}

export class InvalidOrderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidOrderError'
  }
}

export class InvalidOrderTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Um pedido "${from}" não pode passar para "${to}".`)
    this.name = 'InvalidOrderTransitionError'
  }
}

export interface OrderItem {
  productId: string
  name: string
  unitPrice: Money
  quantity: number
}

export interface OrderProps {
  id: string
  items: OrderItem[]
  address: Address
  subtotal: Money
  discount: Money
  shipping: Money
  status: OrderStatus
  transactionId?: string
}

export type PlaceOrderProps = Omit<OrderProps, 'status' | 'transactionId'>

export class Order {
  private constructor(private readonly props: OrderProps) {}

  // Um pedido não pode ser criado sem itens, sem endereço ou com total zero.
  static place(props: PlaceOrderProps): Order {
    if (props.items.length === 0) {
      throw new InvalidOrderError('Um pedido não pode ser criado sem itens.')
    }
    const order = new Order({ ...props, items: props.items.map((i) => ({ ...i })), status: 'pending' })
    if (order.total().isZero()) {
      throw new InvalidOrderError('O total do pedido precisa ser maior que zero.')
    }
    return order
  }

  static restore(props: OrderProps): Order {
    return new Order({ ...props, items: props.items.map((i) => ({ ...i })) })
  }

  id(): string {
    return this.props.id
  }

  items(): OrderItem[] {
    return this.props.items.map((i) => ({ ...i }))
  }

  address(): Address {
    return this.props.address
  }

  status(): OrderStatus {
    return this.props.status
  }

  transactionId(): string | undefined {
    return this.props.transactionId
  }

  subtotal(): Money {
    return this.props.subtotal
  }

  discount(): Money {
    return this.props.discount
  }

  shipping(): Money {
    return this.props.shipping
  }

  total(): Money {
    return this.props.subtotal.subtract(this.props.discount).add(this.props.shipping)
  }

  canCancel(): boolean {
    return TRANSITIONS[this.props.status].includes('cancelled')
  }

  markPaid(transactionId: string): Order {
    return this.transitionTo('paid', { transactionId })
  }

  confirm(): Order {
    return this.transitionTo('confirmed')
  }

  cancel(): Order {
    return this.transitionTo('cancelled')
  }

  private transitionTo(status: OrderStatus, changes: Partial<OrderProps> = {}): Order {
    if (!TRANSITIONS[this.props.status].includes(status)) {
      throw new InvalidOrderTransitionError(this.props.status, status)
    }
    return new Order({ ...this.props, ...changes, status })
  }
}
