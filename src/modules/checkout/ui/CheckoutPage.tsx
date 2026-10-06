import { useEffect, useState } from 'react'
import type { Order } from '../../order/domain/Order'
import type { CalculateCheckoutUseCase } from '../application/CalculateCheckoutUseCase'
import type { PlaceOrderUseCase } from '../application/PlaceOrderUseCase'
import type { Checkout } from '../domain/Checkout'
import { CheckoutView, type PlaceOrderForm } from './CheckoutView'

interface Props {
  calculateCheckout: CalculateCheckoutUseCase
  placeOrder: PlaceOrderUseCase
  onOrderPlaced: (order: Order) => void
}

interface Choices {
  couponCode?: string
  shippingOptionId?: string
}

export function CheckoutPage({ calculateCheckout, placeOrder, onOrderPlaced }: Props) {
  // As escolhas do usuário ficam aqui; os valores sempre vêm recalculados do caso de uso.
  const [choices, setChoices] = useState<Choices>({})
  const [checkout, setCheckout] = useState<Checkout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    let active = true
    calculateCheckout
      .execute()
      .then((c) => active && setCheckout(c))
      .catch((e: Error) => active && setError(e.message))
    return () => {
      active = false
    }
  }, [calculateCheckout])

  async function recalculate(next: Choices) {
    try {
      setCheckout(await calculateCheckout.execute(next))
      setChoices(next)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function handlePlaceOrder(form: PlaceOrderForm) {
    setPlacing(true)
    try {
      onOrderPlaced(await placeOrder.execute({ ...choices, ...form }))
    } catch (e) {
      setError((e as Error).message)
      setPlacing(false)
    }
  }

  if (!checkout) {
    return (
      <p role={error ? 'alert' : 'status'}>
        {error ?? 'Carregando…'} {error && <a href="#/">Ver produtos</a>}
      </p>
    )
  }

  return (
    <CheckoutView
      checkout={checkout}
      error={error}
      placing={placing}
      onApplyCoupon={(couponCode) => recalculate({ ...choices, couponCode })}
      onChooseShipping={(shippingOptionId) => recalculate({ ...choices, shippingOptionId })}
      onPlaceOrder={handlePlaceOrder}
    />
  )
}
