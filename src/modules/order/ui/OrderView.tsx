import { formatMoney } from '../../shared/ui/formatMoney'
import type { Order, OrderStatus } from '../domain/Order'

// O domínio decide o status. A interface decide como chamá-lo.
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Aguardando pagamento',
  paid: 'Pago',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
}

interface Props {
  order: Order
  error?: string | null
  onCancel: () => void
}

export function OrderView({ order, error, onCancel }: Props) {
  const address = order.address().toProps()
  return (
    <section>
      <h1>Pedido {order.id()}</h1>
      <p>
        Status: <strong>{STATUS_LABELS[order.status()]}</strong>
      </p>
      {error && <p role="alert">{error}</p>}
      <ul className="list">
        {order.items().map((item) => (
          <li key={item.productId}>
            <span className="grow">
              {item.quantity} × {item.name}
            </span>
            {formatMoney(item.unitPrice.times(item.quantity))}
          </li>
        ))}
      </ul>
      <dl className="summary">
        <dt>Subtotal</dt>
        <dd>{formatMoney(order.subtotal())}</dd>
        <dt>Desconto</dt>
        <dd>−{formatMoney(order.discount())}</dd>
        <dt>Frete</dt>
        <dd>{formatMoney(order.shipping())}</dd>
        <dt>Total</dt>
        <dd>{formatMoney(order.total())}</dd>
      </dl>
      <p className="muted">
        Entrega em {address.street}, {address.number} — {address.city}
      </p>
      {order.canCancel() && <button onClick={onCancel}>Cancelar pedido</button>}
      <p>
        <a href="#/">Continuar comprando</a>
      </p>
    </section>
  )
}
