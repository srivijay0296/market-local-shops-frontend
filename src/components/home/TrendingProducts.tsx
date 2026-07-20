import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/api/products";
import { safeArray } from "@/lib/utils";

interface TrendingProductsProps {
  recentProducts: Product[];
  loading: boolean;
}

export const TrendingProducts = React.memo(function TrendingProducts({ recentProducts, loading }: TrendingProductsProps) {
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground flex items-center gap-3">
            Trending <span className="text-primary">Assets</span>
          </h2>
          <p className="text-foreground/50 mt-3 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            <Star className="w-4 h-4 text-primary fill-primary" /> High-volume protocols active now
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[400px] bg-white rounded-3xl animate-pulse border border-border shadow-sm" />
            ))
          : safeArray(recentProducts).slice(0, 8).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))
        }
      </div>
    </section>
  );
});
