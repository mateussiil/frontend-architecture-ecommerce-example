import type { PaymentGateway } from '../application/PaymentGateway'
import type { Payment, PaymentResult } from '../domain/Payment'

interface StripeChargeResponse {
  id: string
  status: 'succeeded' | 'requires_payment_method'
  last_payment_error?: { message: string }
}

// Implementação que conversa com um backend que fala com a Stripe.
// O domínio e os casos de uso nunca importam este arquivo: só o ponto de composição.
export class StripePaymentGateway implements PaymentGateway {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchFn: typeof fetch = (...args) => fetch(...args),
  ) {}

  async pay(payment: Payment): Promise<PaymentResult> {
    const response = await this.fetchFn(`${this.baseUrl.replace(/\/$/, '')}/payments/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: payment.amount.inCents(),
        currency: 'brl',
        payment_method: payment.cardToken,
        metadata: { order_id: payment.orderId },
      }),
    })
    if (!response.ok) {
      throw new Error(`Falha ao processar pagamento (HTTP ${response.status}).`)
    }
    const charge = (await response.json()) as StripeChargeResponse
    return charge.status === 'succeeded'
      ? { status: 'approved', transactionId: charge.id }
      : { status: 'declined', reason: charge.last_payment_error?.message ?? 'Pagamento recusado.' }
  }
}
