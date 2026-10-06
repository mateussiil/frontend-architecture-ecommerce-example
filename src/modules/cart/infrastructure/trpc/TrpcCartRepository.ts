import type { CartRepository } from '../../application/CartRepository'
import type { Cart } from '../../domain/Cart'
import { CartMapper, type CartDTO } from '../CartMapper'

// O pedaço do cliente tRPC que este repositório usa. O TRPCUntypedClient de @trpc/client já tem
// esse formato; nos testes, qualquer objeto com query/mutation serve.
export interface TrpcClient {
  query(path: string, input?: unknown): Promise<unknown>
  mutation(path: string, input?: unknown): Promise<unknown>
}

// Procedures esperadas no backend:
//   cart.get   (query)    → CartDTO
//   cart.save  (mutation) ← CartDTO
// Num monorepo, importaríamos `type AppRouter` do backend e usaríamos createTRPCClient<AppRouter>
// para ter os tipos de ponta a ponta. Aqui não existe backend, então o cliente é o não tipado e
// o CartMapper continua sendo a fronteira entre o formato da API e o domínio.
export class TrpcCartRepository implements CartRepository {
  constructor(private readonly client: TrpcClient) {}

  async get(): Promise<Cart> {
    return CartMapper.toDomain((await this.client.query('cart.get')) as CartDTO)
  }

  async save(cart: Cart): Promise<void> {
    await this.client.mutation('cart.save', CartMapper.toDTO(cart))
  }
}
