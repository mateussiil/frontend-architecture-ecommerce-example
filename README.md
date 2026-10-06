# Frontend Architecture — E-commerce Example

Exemplo mínimo de uma arquitetura de frontend organizada **por domínio**, com camadas separadas
dentro de cada módulo. O app é uma loja com catálogo, carrinho, checkout, pedido e pagamento —
pequena de propósito, para que a estrutura apareça mais do que o produto.

Exemplo irmão, com a mesma arquitetura aplicada a um dashboard:
[frontend-architecture-dashboard-example](https://github.com/mateussiil/frontend-architecture-dashboard-example).

## A ideia

Tratar o frontend com a mesma disciplina que normalmente aplicamos ao backend:

- **Módulos por domínio, não por página.** Cada módulo (`catalog/`, `cart/`, `checkout/`,
  `order/`, `payment/`) é um bounded context. Páginas e URLs mudam; o domínio continua.
- **Camadas dentro de cada módulo** (organização vertical):
  - `domain/` — entidades e regras de negócio. Sem React, sem browser, sem HTTP.
  - `application/` — casos de uso. Coordenam o fluxo e dependem de interfaces (repositories, gateways).
  - `infrastructure/` — implementações concretas: HTTP, `localStorage`, Stripe, mappers de DTO.
  - `ui/` — React. Apresenta dados, recebe eventos e chama casos de uso.
- **DI explícita, sem container.** Dependências entram pelo construtor e são montadas em um único
  ponto de composição (`src/app/composition.ts`).
- **O domínio decide o significado, a interface decide como apresentar.** O preço é um `Money` em
  centavos no domínio; `formatMoney` decide como ele aparece na tela.
- **O ponto de entrada coordena, o domínio decide e o componente apresenta.**

## Estrutura

```text
src/
├── app/                         # composition.ts, App.tsx (rotas + carrinho compartilhado)
├── main.tsx
└── modules/
    ├── shared/                  # Money (domínio) e formatMoney / Price (UI)
    ├── catalog/
    │   ├── domain/              # Product: preço final, desconto, disponibilidade, estoque
    │   ├── application/         # ProductRepository, SearchProducts, GetProduct
    │   ├── infrastructure/      # Http / InMemory ProductRepository, ProductMapper
│   │   └── graphql/         # GraphqlProductRepository, queries, GraphqlProductMapper
    │   ├── ui/                  # CatalogPage, ProductPage (pontos de entrada), ProductCard
    │   └── testing/             # FakeProductRepository, fixtures
    ├── cart/
    │   ├── domain/              # Cart: adicionar, remover, alterar quantidade, total
    │   ├── application/         # AddProductToCart, ChangeCartQuantity, RemoveProductFromCart
    │   ├── infrastructure/      # Http / LocalStorage CartRepository, CartMapper
│   │   └── trpc/            # TrpcCartRepository, createTrpcClient
    │   └── ui/                  # CartPage, CartView
    ├── checkout/
    │   ├── domain/              # Checkout (limite de desconto), Coupon, ShippingOption
    │   ├── application/         # CalculateCheckout, PlaceOrder
    │   ├── infrastructure/      # Http / InMemory Coupon e ShippingOption repositories, mappers
    │   └── ui/                  # CheckoutPage, CheckoutView
    ├── order/
    │   ├── domain/              # Order: status em sequência válida, Address
    │   ├── application/         # OrderRepository, GetOrder, CancelOrder
    │   ├── infrastructure/      # Http / LocalStorage OrderRepository, OrderMapper
    │   └── ui/                  # OrderPage, OrderView
    └── payment/
        ├── domain/              # Payment
        ├── application/         # PaymentGateway (interface)
        └── infrastructure/      # FakePaymentGateway, StripePaymentGateway
```

A dependência entre módulos tem um sentido só: `checkout` usa `cart`, `order` e `payment`;
`cart` usa `catalog`. Nenhum deles conhece o `checkout`.

## Como funciona: adicionar ao carrinho

```text
ProductCard              emite a intenção; o botão já vem desabilitado se product.isAvailable() for false
   ↓
CatalogPage              chama o caso de uso e atualiza o estado da tela
   ↓
AddProductToCartUseCase  busca produto e carrinho, entrega ao domínio, persiste, devolve
   ↓
Product / Cart           decidem se há estoque e qual é o preço
   ↓
CartRepository           interface
   ↓
LocalStorage / HTTP      infraestrutura
```

Tentar adicionar 20 unidades de um produto com 5 em estoque é recusado pelo `Cart`, não por um
`onClick`.

## Como funciona: fechar o pedido

`PlaceOrderUseCase` só conhece a ordem dos passos; cada regra está no domínio a que pertence:

```text
CalculateCheckout   carrinho não pode estar vazio, frete grátis acima de R$ 200, desconto no máximo 30%
   ↓
Order.place         sem itens, sem endereço ou com total zero: erro
   ↓
PaymentGateway      recusado → pedido cancelado, carrinho mantido
   ↓
Order               pending → paid → confirmed
```

## Trocando a infraestrutura

Por padrão tudo roda sem backend: catálogo, cupons e fretes em memória, carrinho e pedidos no
`localStorage`, pagamento com `FakePaymentGateway`. O ponto de composição escolhe outra
implementação por variável de ambiente — nenhuma linha de domínio, aplicação ou UI muda:

| Variável           | O que troca                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `VITE_API_URL`     | todos os repositórios passam para REST e o pagamento para Stripe    |
| `VITE_GRAPHQL_URL` | o catálogo passa a usar `GraphqlProductRepository`                  |
| `VITE_TRPC_URL`    | o carrinho passa a usar `TrpcCartRepository` (procedures `cart.get` e `cart.save`) |

Cada módulo pode falar um protocolo diferente: catálogo em GraphQL, carrinho em tRPC e o resto
em REST, por exemplo. Para o caso de uso, todos são só um `ProductRepository` ou um
`CartRepository`. Os formatos de cada protocolo ficam nos mappers da própria pasta
(`GraphqlProductMapper`, `CartMapper`), e o domínio não conhece nenhum deles.

Para testar no app: cupons `BEMVINDO10` e `METADE` (50%, limitado a 30%); cartão terminado em
`0002` é recusado.

## Testes por camada

| Camada          | Como é testada                                       |
| --------------- | ---------------------------------------------------- |
| Domain          | Vitest puro                                          |
| Application     | Vitest + repositórios e gateway falsos               |
| Infrastructure  | Vitest com `localStorage` do jsdom, `fetch` falso (REST/GraphQL) e um servidor tRPC em memória |
| Componentes     | Vitest + Testing Library com dados falsos            |
| Fluxo real      | Playwright no browser                                |

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest
npm run test:e2e   # Playwright
```
