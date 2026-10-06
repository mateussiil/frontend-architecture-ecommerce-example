import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Cart } from '../../cart/domain/Cart'
import { aProduct } from '../../catalog/testing/fixtures'
import { Money } from '../../shared/domain/Money'
import { Checkout } from '../domain/Checkout'
import { expressShipping, halfCoupon, standardShipping } from '../testing/fixtures'
import { CheckoutView } from './CheckoutView'

const checkout = () =>
  Checkout.start(Cart.empty().addProduct(aProduct({ price: Money.cents(10000), stock: 5 })), [
    standardShipping(),
    expressShipping(),
  ])

const noop = () => {}

describe('CheckoutView', () => {
  it('só permite fechar o pedido quando o domínio diz que pode', () => {
    const { rerender } = render(
      <CheckoutView checkout={checkout()} onApplyCoupon={noop} onChooseShipping={noop} onPlaceOrder={noop} />,
    )
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Fechar pedido' }).disabled).toBe(true)

    rerender(
      <CheckoutView
        checkout={checkout().chooseShipping('padrao')}
        onApplyCoupon={noop}
        onChooseShipping={noop}
        onPlaceOrder={noop}
      />,
    )
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Fechar pedido' }).disabled).toBe(false)
  })

  it('emite a escolha de frete e o cupom digitado', async () => {
    const onChooseShipping = vi.fn()
    const onApplyCoupon = vi.fn()
    render(
      <CheckoutView checkout={checkout()} onApplyCoupon={onApplyCoupon} onChooseShipping={onChooseShipping} onPlaceOrder={noop} />,
    )

    await userEvent.click(screen.getByLabelText(/Expresso/))
    await userEvent.type(screen.getByLabelText('Cupom'), 'bemvindo10')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar cupom' }))

    expect(onChooseShipping).toHaveBeenCalledWith('expresso')
    expect(onApplyCoupon).toHaveBeenCalledWith('bemvindo10')
  })

  it('avisa quando o desconto foi limitado pelo domínio', () => {
    render(
      <CheckoutView
        checkout={checkout().applyCoupon(halfCoupon())}
        onApplyCoupon={noop}
        onChooseShipping={noop}
        onPlaceOrder={noop}
      />,
    )

    expect(screen.getByText(/limitado a 30%/)).toBeTruthy()
    expect(screen.getByLabelText('Total').textContent).toMatch(/70,00/)
  })
})
