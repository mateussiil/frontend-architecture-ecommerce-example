import type { Money } from '../domain/Money'

// Decisão de apresentação: o domínio decide o valor, a interface decide como mostrá-lo.
const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatMoney(money: Money): string {
  return formatter.format(money.inCents() / 100)
}
