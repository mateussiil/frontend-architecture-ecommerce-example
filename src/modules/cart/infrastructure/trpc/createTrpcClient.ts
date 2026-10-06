import { createTRPCUntypedClient, httpBatchLink } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import type { TrpcClient } from './TrpcCartRepository'

export function createTrpcClient(url: string, fetchFn?: typeof fetch): TrpcClient {
  return createTRPCUntypedClient<AnyRouter>({
    links: [httpBatchLink({ url, fetch: fetchFn, fetchOptions: { credentials: 'include' } } as never)],
  })
}
