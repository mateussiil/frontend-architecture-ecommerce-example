import type { Money } from '../../shared/domain/Money'

export class InvalidPaymentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidPaymentError'
  }
}

export interface Payment {
  orderId: string
  amount: Money
  // Token do cartão gerado pelo provedor. No exemplo, o número digitado faz esse papel.
  cardToken: string
}

export type PaymentResult = { status: 'approved'; transactionId: string } | { status: 'declined'; reason: string }

export function createPayment(payment: Payment): Payment {
  if (payment.amount.isZero()) {
    throw new InvalidPaymentError('Não é possível cobrar um valor zero.')
  }
  if (!payment.cardToken.trim()) {
    throw new InvalidPaymentError('Informe um cartão.')
  }
  return { ...payment }
}
