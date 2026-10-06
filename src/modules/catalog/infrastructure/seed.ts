import type { ProductDTO } from './ProductMapper'

export const seedProducts: ProductDTO[] = [
  {
    id: 'camiseta',
    name: 'Camiseta Básica',
    description: 'Algodão orgânico, corte reto.',
    price_cents: 7990,
    discount_percent: 0,
    stock: 5,
    variants: ['P', 'M', 'G'],
  },
  {
    id: 'tenis',
    name: 'Tênis de Corrida',
    description: 'Leve e respirável.',
    price_cents: 39990,
    discount_percent: 20,
    stock: 3,
  },
  {
    id: 'caneca',
    name: 'Caneca de Cerâmica',
    description: 'Feita à mão, 350 ml.',
    price_cents: 4500,
    discount_percent: 10,
    stock: 12,
  },
  {
    id: 'mochila',
    name: 'Mochila Urbana',
    description: 'Compartimento para notebook.',
    price_cents: 25900,
    discount_percent: 0,
    stock: 0,
  },
]
