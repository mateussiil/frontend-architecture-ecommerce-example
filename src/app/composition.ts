import { AddProductToCartUseCase } from '../modules/cart/application/AddProductToCartUseCase'
import { ChangeCartQuantityUseCase } from '../modules/cart/application/ChangeCartQuantityUseCase'
import { GetCartUseCase } from '../modules/cart/application/GetCartUseCase'
import { RemoveProductFromCartUseCase } from '../modules/cart/application/RemoveProductFromCartUseCase'
import type { CartRepository } from '../modules/cart/application/CartRepository'
import { HttpCartRepository } from '../modules/cart/infrastructure/HttpCartRepository'
import { LocalStorageCartRepository } from '../modules/cart/infrastructure/LocalStorageCartRepository'
import { GetProductUseCase } from '../modules/catalog/application/GetProductUseCase'
import type { ProductRepository } from '../modules/catalog/application/ProductRepository'
import { SearchProductsUseCase } from '../modules/catalog/application/SearchProductsUseCase'
import { HttpProductRepository } from '../modules/catalog/infrastructure/HttpProductRepository'
import { InMemoryProductRepository } from '../modules/catalog/infrastructure/InMemoryProductRepository'
import { seedProducts } from '../modules/catalog/infrastructure/seed'
import { CalculateCheckoutUseCase } from '../modules/checkout/application/CalculateCheckoutUseCase'
import type { CouponRepository } from '../modules/checkout/application/CouponRepository'
import { PlaceOrderUseCase } from '../modules/checkout/application/PlaceOrderUseCase'
import type { ShippingOptionRepository } from '../modules/checkout/application/ShippingOptionRepository'
import { HttpCouponRepository } from '../modules/checkout/infrastructure/HttpCouponRepository'
import { HttpShippingOptionRepository } from '../modules/checkout/infrastructure/HttpShippingOptionRepository'
import { InMemoryCouponRepository } from '../modules/checkout/infrastructure/InMemoryCouponRepository'
import { InMemoryShippingOptionRepository } from '../modules/checkout/infrastructure/InMemoryShippingOptionRepository'
import { seedCoupons, seedShippingOptions } from '../modules/checkout/infrastructure/seed'
import { CancelOrderUseCase } from '../modules/order/application/CancelOrderUseCase'
import { GetOrderUseCase } from '../modules/order/application/GetOrderUseCase'
import type { OrderRepository } from '../modules/order/application/OrderRepository'
import { HttpOrderRepository } from '../modules/order/infrastructure/HttpOrderRepository'
import { LocalStorageOrderRepository } from '../modules/order/infrastructure/LocalStorageOrderRepository'
import type { PaymentGateway } from '../modules/payment/application/PaymentGateway'
import { FakePaymentGateway } from '../modules/payment/infrastructure/FakePaymentGateway'
import { StripePaymentGateway } from '../modules/payment/infrastructure/StripePaymentGateway'

// Ponto de composição: o único lugar que sabe quais implementações concretas são usadas.
// Sem container de DI — as dependências são passadas explicitamente pelo construtor.
export function composeApp() {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined

  const products: ProductRepository = apiUrl
    ? new HttpProductRepository(apiUrl)
    : new InMemoryProductRepository(seedProducts)
  const carts: CartRepository = apiUrl
    ? new HttpCartRepository(apiUrl)
    : new LocalStorageCartRepository(window.localStorage)
  const orders: OrderRepository = apiUrl
    ? new HttpOrderRepository(apiUrl)
    : new LocalStorageOrderRepository(window.localStorage)
  const coupons: CouponRepository = apiUrl
    ? new HttpCouponRepository(apiUrl)
    : new InMemoryCouponRepository(seedCoupons)
  const shippingOptions: ShippingOptionRepository = apiUrl
    ? new HttpShippingOptionRepository(apiUrl)
    : new InMemoryShippingOptionRepository(seedShippingOptions)
  const payments: PaymentGateway = apiUrl ? new StripePaymentGateway(apiUrl) : new FakePaymentGateway()

  const calculateCheckout = new CalculateCheckoutUseCase(carts, coupons, shippingOptions)

  return {
    searchProducts: new SearchProductsUseCase(products),
    getProduct: new GetProductUseCase(products),
    getCart: new GetCartUseCase(carts),
    addProductToCart: new AddProductToCartUseCase(products, carts),
    changeCartQuantity: new ChangeCartQuantityUseCase(products, carts),
    removeProductFromCart: new RemoveProductFromCartUseCase(carts),
    calculateCheckout,
    placeOrder: new PlaceOrderUseCase(calculateCheckout, orders, payments, carts),
    getOrder: new GetOrderUseCase(orders),
    cancelOrder: new CancelOrderUseCase(orders),
  }
}

export type App = ReturnType<typeof composeApp>
