import { useEffect, useState } from 'react'
import { Cart } from '../modules/cart/domain/Cart'
import { CartPage } from '../modules/cart/ui/CartPage'
import { CatalogPage } from '../modules/catalog/ui/CatalogPage'
import { ProductPage } from '../modules/catalog/ui/ProductPage'
import { CheckoutPage } from '../modules/checkout/ui/CheckoutPage'
import { OrderPage } from '../modules/order/ui/OrderPage'
import type { App as AppDependencies } from './composition'
import { parseRoute } from './routes'

interface Props {
  app: AppDependencies
}

export function App({ app }: Props) {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  // Estado da aplicação compartilhado entre telas: o carrinho aparece no cabeçalho e em várias páginas.
  const [cart, setCart] = useState<Cart>(Cart.empty())

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    app.getCart.execute().then(setCart)
  }, [app, route])

  return (
    <>
      <nav className="topbar">
        <a href="#/" className="brand">
          Loja
        </a>
        <a href="#/cart">Carrinho ({cart.itemCount()})</a>
      </nav>
      <main>
        {route.name === 'catalog' && (
          <CatalogPage searchProducts={app.searchProducts} addProductToCart={app.addProductToCart} onCartChange={setCart} />
        )}
        {route.name === 'product' && (
          <ProductPage
            productId={route.productId}
            getProduct={app.getProduct}
            addProductToCart={app.addProductToCart}
            onCartChange={setCart}
          />
        )}
        {route.name === 'cart' && (
          <CartPage
            cart={cart}
            changeCartQuantity={app.changeCartQuantity}
            removeProductFromCart={app.removeProductFromCart}
            onCartChange={setCart}
          />
        )}
        {route.name === 'checkout' && (
          <CheckoutPage
            calculateCheckout={app.calculateCheckout}
            placeOrder={app.placeOrder}
            onOrderPlaced={(order) => {
              window.location.hash = `#/orders/${order.id()}`
            }}
          />
        )}
        {route.name === 'order' && (
          <OrderPage key={route.orderId} orderId={route.orderId} getOrder={app.getOrder} cancelOrder={app.cancelOrder} />
        )}
      </main>
    </>
  )
}
