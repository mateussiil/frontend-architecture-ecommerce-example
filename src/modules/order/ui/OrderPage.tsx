import { useEffect, useState } from 'react'
import type { CancelOrderUseCase } from '../application/CancelOrderUseCase'
import type { GetOrderUseCase } from '../application/GetOrderUseCase'
import type { Order } from '../domain/Order'
import { OrderView } from './OrderView'

interface Props {
  orderId: string
  getOrder: GetOrderUseCase
  cancelOrder: CancelOrderUseCase
}

export function OrderPage({ orderId, getOrder, cancelOrder }: Props) {
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getOrder
      .execute(orderId)
      .then((o) => active && setOrder(o))
      .catch((e: Error) => active && setError(e.message))
    return () => {
      active = false
    }
  }, [orderId, getOrder])

  async function handleCancel() {
    try {
      setOrder(await cancelOrder.execute(orderId))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  if (!order) {
    return <p role={error ? 'alert' : 'status'}>{error ?? 'Carregando…'}</p>
  }

  return <OrderView order={order} error={error} onCancel={handleCancel} />
}
