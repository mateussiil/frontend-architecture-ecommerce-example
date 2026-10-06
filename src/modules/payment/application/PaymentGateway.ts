import type { Payment, PaymentResult } from '../domain/Payment'

// O caso de uso trabalha com esta abstração. Stripe, Pagar.me ou um fake são detalhes de infraestrutura.
export interface PaymentGateway {
  pay(payment: Payment): Promise<PaymentResult>
}
