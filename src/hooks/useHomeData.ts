import { useQuery } from "@tanstack/react-query";
import { getMarkets, getProducts, getShops, getPosts } from "@/services/api";

export function useHomeData() {
  const { data: markets = [], isLoading: loadingMarkets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => getMarkets().catch(() => []),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: recentProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'approved'],
    queryFn: () => getProducts({ onlyApproved: true }).catch(() => []),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: shops = [], isLoading: loadingShops } = useQuery({
    queryKey: ['shops', 'approved'],
    queryFn: () => getShops({ status: "approved" }).catch(() => []),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: globalPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts().catch(() => []),
    staleTime: 60 * 1000, // 1 min (posts are dynamic)
    gcTime: 5 * 60 * 1000,
  });

  const loading = loadingMarkets || loadingProducts || loadingShops || loadingPosts;

  return {
    markets,
    shops,
    globalPosts,
    recentProducts,
    loading
  };
}
