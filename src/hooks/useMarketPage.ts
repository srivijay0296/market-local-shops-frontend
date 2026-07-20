import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { marketsApi } from "@/lib/api/markets";
import { shopsApi } from "@/lib/api/shops";

export function useMarketPage() {
  const { slug } = useParams();

  // 1. Fetch all markets if no slug is provided (for the grid view)
  const { data: markets = [], isLoading: loadingMarkets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => marketsApi.getMarkets().catch(() => []),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: !slug,
  });

  // 2. Fetch specific market detail if slug IS provided
  const { data: selectedMarket, isLoading: loadingMarket, error: marketError } = useQuery({
    queryKey: ['markets', 'detail', slug],
    queryFn: () => marketsApi.getMarketBySlug(slug!),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: !!slug,
  });

  // 3. Fetch shops for the selected market
  const { data: marketShops = [], isLoading: loadingShops } = useQuery({
    queryKey: ['shops', 'market', selectedMarket?.id],
    queryFn: () => shopsApi.getShops({ marketId: selectedMarket?.id, status: "approved" }).catch(() => []),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!selectedMarket?.id,
  });

  const loading = slug ? (loadingMarket || loadingShops) : loadingMarkets;
  const error = marketError ? (marketError as Error).message : null;

  return {
    slug,
    markets,
    selectedMarket,
    marketShops,
    loading,
    error
  };
}
