export type Route =
  | { name: 'catalog' }
  | { name: 'product'; productId: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'order'; orderId: string }

// Roteamento por hash, sem biblioteca: a rota é só uma decisão de apresentação.
export function parseRoute(hash: string): Route {
  const [, section, id] = hash.replace(/^#/, '').split('/')
  if (section === 'products' && id) return { name: 'product', productId: decodeURIComponent(id) }
  if (section === 'cart') return { name: 'cart' }
  if (section === 'checkout') return { name: 'checkout' }
  if (section === 'orders' && id) return { name: 'order', orderId: decodeURIComponent(id) }
  return { name: 'catalog' }
}
