import { useState, type FormEvent } from 'react'
import type { AddressProps } from '../../order/domain/Address'
import { formatMoney } from '../../shared/ui/formatMoney'
import { Price } from '../../shared/ui/Price'
import { MAX_DISCOUNT_PERCENT, type Checkout } from '../domain/Checkout'

export interface PlaceOrderForm {
  address: AddressProps
  cardToken: string
}

interface Props {
  checkout: Checkout
  error?: string | null
  placing?: boolean
  onApplyCoupon: (code: string) => void
  onChooseShipping: (optionId: string) => void
  onPlaceOrder: (form: PlaceOrderForm) => void
}

// A tela não conhece as regras de desconto, frete grátis ou limite de cupom.
// Ela pergunta ao Checkout e apresenta a resposta.
export function CheckoutView({ checkout, error, placing, onApplyCoupon, onChooseShipping, onPlaceOrder }: Props) {
  // Estado da interface: o que está sendo digitado ainda não é do domínio.
  const [couponCode, setCouponCode] = useState(checkout.coupon()?.code() ?? '')
  const [address, setAddress] = useState<AddressProps>({ street: '', number: '', city: '', zipCode: '' })
  const [cardToken, setCardToken] = useState('')

  const field = (name: keyof AddressProps) => ({
    value: address[name],
    onChange: (e: { target: { value: string } }) => setAddress({ ...address, [name]: e.target.value }),
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    onPlaceOrder({ address, cardToken })
  }

  return (
    <section className="checkout">
      <h1>Checkout</h1>
      {error && <p role="alert">{error}</p>}

      <ul className="list">
        {checkout.items().map((item) => (
          <li key={item.productId}>
            <span className="grow">
              {item.quantity} × {item.name}
            </span>
            <Price value={item.unitPrice.times(item.quantity)} />
          </li>
        ))}
      </ul>

      <fieldset>
        <legend>Entrega</legend>
        {checkout.shippingOptions().map((option) => {
          const cost = option.costFor(checkout.subtotal())
          return (
            <label key={option.id()}>
              <input
                type="radio"
                name="shipping"
                checked={checkout.shipping()?.id() === option.id()}
                onChange={() => onChooseShipping(option.id())}
              />{' '}
              {option.label()} — {option.estimatedDays()} dias — {cost.isZero() ? 'Grátis' : formatMoney(cost)}
            </label>
          )
        })}
      </fieldset>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          onApplyCoupon(couponCode)
        }}
      >
        <label>
          Cupom <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
        </label>
        <button type="submit">Aplicar cupom</button>
      </form>

      <dl className="summary">
        <dt>Subtotal</dt>
        <dd>{formatMoney(checkout.subtotal())}</dd>
        <dt>Desconto{checkout.coupon() && ` (${checkout.coupon()!.code()})`}</dt>
        <dd>
          −{formatMoney(checkout.discount())}
          {checkout.isDiscountCapped() && <small className="muted"> limitado a {MAX_DISCOUNT_PERCENT}%</small>}
        </dd>
        <dt>Frete</dt>
        <dd>{checkout.shipping() ? formatMoney(checkout.shippingCost()) : '—'}</dd>
        <dt>Total</dt>
        <dd aria-label="Total">{formatMoney(checkout.total())}</dd>
      </dl>

      <form onSubmit={submit} className="form">
        <fieldset>
          <legend>Endereço</legend>
          <label>
            Rua <input {...field('street')} />
          </label>
          <label>
            Número <input {...field('number')} />
          </label>
          <label>
            Cidade <input {...field('city')} />
          </label>
          <label>
            CEP <input {...field('zipCode')} />
          </label>
        </fieldset>
        <fieldset>
          <legend>Pagamento</legend>
          <label>
            Cartão <input value={cardToken} onChange={(e) => setCardToken(e.target.value)} placeholder="4242 4242 4242 4242" />
          </label>
        </fieldset>
        <button type="submit" disabled={!checkout.canPlaceOrder() || placing}>
          {placing ? 'Processando…' : 'Fechar pedido'}
        </button>
      </form>
    </section>
  )
}
