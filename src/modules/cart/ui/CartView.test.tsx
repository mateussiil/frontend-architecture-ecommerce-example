import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { aProduct } from '../../catalog/testing/fixtures'
import { Money } from '../../shared/domain/Money'
import { Cart } from '../domain/Cart'
import { CartView } from './CartView'

const cart = Cart.empty().addProduct(aProduct({ id: 'camiseta', name: 'Camiseta', price: Money.cents(5000) }), 2)

describe('CartView', () => {
  it('apresenta os itens e o total calculado pelo domínio', () => {
    render(<CartView cart={cart} onChangeQuantity={() => {}} onRemove={() => {}} />)

    expect(screen.getByText(/Total/).textContent).toMatch(/100,00/)
  })

  it('emite as intenções de alterar quantidade e remover', async () => {
    const onChangeQuantity = vi.fn()
    const onRemove = vi.fn()
    render(<CartView cart={cart} onChangeQuantity={onChangeQuantity} onRemove={onRemove} />)

    const item = within(screen.getByRole('listitem', { name: 'Camiseta' }))
    await userEvent.click(item.getByRole('button', { name: 'Aumentar' }))
    await userEvent.click(item.getByRole('button', { name: 'Remover' }))

    expect(onChangeQuantity).toHaveBeenCalledWith('camiseta', 3)
    expect(onRemove).toHaveBeenCalledWith('camiseta')
  })

  it('mostra uma mensagem quando o carrinho está vazio', () => {
    render(<CartView cart={Cart.empty()} onChangeQuantity={() => {}} onRemove={() => {}} />)

    expect(screen.getByText(/carrinho está vazio/)).toBeTruthy()
  })
})
