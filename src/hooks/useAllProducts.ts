import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";

export function useAllProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, parseInt(searchParams.get("maxPrice") || "50000")]);

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories().catch(() => []),
    staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
    gcTime: 24 * 60 * 60 * 1000,
  });

  const { data: products = [], isLoading: loadingProds } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts().catch(() => []),
    staleTime: 2 * 60 * 1000, // 2 mins
    gcTime: 10 * 60 * 1000,
  });

  const loading = loadingCats || loadingProds;

  // useMemo for expensive filtering
  const filteredProducts = useMemo(() => {
    return (products || []).filter(p => {
      if (!p) return false;
      
      const nameStr = (p.name || "").toLowerCase();
      const searchStr = (searchQuery || "").toLowerCase();
      const shopNameStr = (p.shops?.name || p.vendor?.shop_name || "").toLowerCase();

      const matchesSearch = nameStr.includes(searchStr) || shopNameStr.includes(searchStr);
      
      const productPrice = parseFloat(p.price) || 0;
      const matchesPrice = productPrice >= (priceRange[0] || 0) && productPrice <= (priceRange[1] || 50000);
      const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory || p.category === selectedCategory;

      return matchesSearch && matchesPrice && matchesCategory;
    });
  }, [products, searchQuery, priceRange, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 50000]);
    setSearchParams({}); // Clear URL params too
  };

  return {
    products,
    categories,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    filteredProducts,
    handleResetFilters
  };
}
