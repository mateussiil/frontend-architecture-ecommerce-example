import type { PaymentGateway } from '../application/PaymentGateway'
import type { Payment, PaymentResult } from '../domain/Payment'

// Gateway de mentira para rodar sem backend: recusa cartões terminados em 0002,
// o mesmo cartão de teste que os provedores costumam usar para "recusado".
export class FakePaymentGateway implements PaymentGateway {
  readonly payments: Payment[] = []

  async pay(payment: Payment): Promise<PaymentResult> {
    this.payments.push(payment)
    if (payment.cardToken.replace(/\D/g, '').endsWith('0002')) {
      return { status: 'declined', reason: 'Cartão recusado pelo emissor.' }
    }
    return { status: 'approved', transactionId: `fake-${payment.orderId}` }
  }
}
