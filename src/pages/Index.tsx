import { useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { Truck, ShieldCheck, Award, Zap } from "lucide-react";
import { useHomeData } from "@/hooks/useHomeData";
import { Hero } from "@/components/home/Hero";
import { BenefitCard } from "@/components/home/BenefitCard";
import { CategorySection } from "@/components/home/CategorySection";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { MarketsSection } from "@/components/home/MarketsSection";
import { LiveIntelSection } from "@/components/home/LiveIntelSection";

export default function Index() {
  const { markets, globalPosts, recentProducts, loading } = useHomeData();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden selection:bg-primary selection:text-dark">
      <Header />
      <AuthModal />
      <CartDrawer />

      {/* 🌟 PREMIUM HERO SECTION */}
      <Hero y={y} opacity={opacity} />

      {/* 🚀 VALUE PROPOSITION */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-xl border border-border grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          <BenefitCard icon={<Truck />} title="Rapid Transit" desc="Priority Logistics Network" color="text-accent" />
          <BenefitCard icon={<ShieldCheck />} title="Verified Nodes" desc="Enterprise Authorization" color="text-success" />
          <BenefitCard icon={<Award />} title="Asset Quality" desc="Immutable Verification" color="text-primary" />
          <BenefitCard icon={<Zap />} title="Flash Protocols" desc="Dynamic Pricing Models" color="text-warning" />
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-32 space-y-32">
        {/* 🛍️ CATEGORIES (3D Hover Cards) */}
        <CategorySection />

        {/* ⚡ FEATURED PRODUCTS */}
        <TrendingProducts recentProducts={recentProducts} loading={loading} />

        {/* 🏪 TOP MARKETS */}
        <MarketsSection markets={markets} />

        {/* 💬 SELLER UPDATES */}
        <LiveIntelSection globalPosts={globalPosts} />
      </main>
      
      <Footer />
    </div>
  );
}