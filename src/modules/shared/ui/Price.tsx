import type { Money } from '../domain/Money'
import { formatMoney } from './formatMoney'

interface Props {
  value: Money
  original?: Money
}

export function Price({ value, original }: Props) {
  return (
    <span className="price">
      {original && !original.equals(value) && <s className="muted">{formatMoney(original)}</s>} {formatMoney(value)}
    </span>
  )
}
