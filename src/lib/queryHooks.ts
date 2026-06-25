/**
 * React Query hooks for Bargur Market
 * Centralizes all async data fetching with caching, pagination, and stale config.
 *
 * Cache strategy:
 *  - Products list: 2 min stale, 10 min cache  (high read, moderate change)
 *  - Single product: 5 min stale, 30 min cache (rarely changes)
 *  - Markets list:  10 min stale, 60 min cache (almost never changes)
 *  - Orders:         0 sec stale (always fresh — user-critical)
 *  - Subscriptions:  0 sec stale (always fresh — gating logic)
 */

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';
import { productsApi } from './api/products';
import { ordersApi } from './api/orders';

export type ProductFilters = { shopId?: string; categoryId?: string; search?: string };
import { marketsApi, Market, MarketPayload } from './api/markets';

// ── Shared QueryClient instance ──────────────────────────────────────────────
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 min default stale
    },
  },
});

// ── Query key factories ──────────────────────────────────────────────────────
export const queryKeys = {
  products: {
    all:     ['products'] as const,
    list:    (f: ProductFilters) => ['products', 'list', f] as const,
    detail:  (id: string)        => ['products', 'detail', id] as const,
    infinite:(f: ProductFilters) => ['products', 'infinite', f] as const,
  },
  markets: {
    all:    ['markets'] as const,
    detail: (slug: string) => ['markets', slug] as const,
  },
  orders: {
    user:   (userId: string)   => ['orders', 'user', userId] as const,
    vendor: (vendorId: string) => ['orders', 'vendor', vendorId] as const,
    admin:  ['orders', 'admin'] as const,
  },
};

// ── Products ─────────────────────────────────────────────────────────────────

/** Standard product list */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey:  queryKeys.products.list(filters),
    queryFn:   () => productsApi.getProducts(filters),
    staleTime: 2 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/** Single product detail */
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey:  queryKeys.products.detail(id!),
    queryFn:   () => productsApi.getProductById(id!),
    enabled:   !!id,
    staleTime: 5 * 60 * 1000,
    gcTime:    30 * 60 * 1000,
  });
}

/** Delete product mutation with cache invalidation */
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.products.all }),
  });
}

// ── Markets ──────────────────────────────────────────────────────────────────

export function useMarkets() {
  return useQuery({
    queryKey:  queryKeys.markets.all,
    queryFn:   () => marketsApi.getMarkets(),
    staleTime: 10 * 60 * 1000,
    gcTime:    60 * 60 * 1000,   // cache 1 hour — markets rarely change
  });
}

export function useMarket(slug: string | undefined) {
  return useQuery({
    queryKey:  queryKeys.markets.detail(slug!),
    queryFn:   () => marketsApi.getMarketBySlug(slug!),
    enabled:   !!slug,
    staleTime: 10 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
  });
}

/** CREATE Market Mutation */
export function useCreateMarket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarketPayload) => marketsApi.createMarket(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.markets.all }),
  });
}

/** UPDATE Market Mutation */
export function useUpdateMarket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MarketPayload> }) => 
                  marketsApi.updateMarket(id, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.markets.all }),
  });
}

/** DELETE Market Mutation */
export function useDeleteMarket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketsApi.deleteMarket(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.markets.all }),
  });
}

// ── Orders ───────────────────────────────────────────────────────────────────

export function useUserOrders(userId: string | undefined) {
  return useQuery({
    queryKey:  queryKeys.orders.user(userId!),
    queryFn:   () => ordersApi.getUserOrders(userId!),
    enabled:   !!userId,
    staleTime: 0,   // orders must always be fresh
    gcTime:    2 * 60 * 1000,
  });
}

/** Update order status with optimistic invalidation */
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: any }) =>
                  ordersApi.updateStatus(orderId, status),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

// ── Prefetch helpers (call on hover for instant navigation) ──────────────────

export function prefetchProduct(id: string) {
  return queryClient.prefetchQuery({
    queryKey:  queryKeys.products.detail(id),
    queryFn:   () => productsApi.getProductById(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function prefetchMarket(slug: string) {
  return queryClient.prefetchQuery({
    queryKey:  queryKeys.markets.detail(slug),
    queryFn:   () => marketsApi.getMarketBySlug(slug),
    staleTime: 10 * 60 * 1000,
  });
}
