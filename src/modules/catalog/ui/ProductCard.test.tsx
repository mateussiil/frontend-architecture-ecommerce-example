import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Money } from '../../shared/domain/Money'
import { aProduct } from '../testing/fixtures'
import { ProductCard } from './ProductCard'

describe('ProductCard', () => {
  it('apresenta o preço final e emite a intenção de adicionar ao carrinho', async () => {
    const onAddToCart = vi.fn()
    render(<ProductCard product={aProduct({ price: Money.cents(10000), discountPercent: 20 })} onAddToCart={onAddToCart} />)

    expect(screen.getByText('-20%')).toBeTruthy()
    expect(screen.getByText(/80,00/)).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar ao carrinho' }))

    expect(onAddToCart).toHaveBeenCalledWith('camiseta')
  })

  it('pergunta ao domínio se o produto está disponível', () => {
    render(<ProductCard product={aProduct({ stock: 0 })} onAddToCart={() => {}} />)

    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Esgotado' }).disabled).toBe(true)
  })
})
