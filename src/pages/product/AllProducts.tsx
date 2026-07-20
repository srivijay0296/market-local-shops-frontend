import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { ShoppingBag, Search } from "lucide-react";
import { useAllProducts } from "@/hooks/useAllProducts";
import { ProductFilters } from "@/components/product/ProductFilters";

export default function AllProducts() {
  const {
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
  } = useAllProducts();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <AuthModal />
      <CartDrawer />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-14 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-4 tracking-tighter uppercase italic flex items-center justify-center gap-5">
              <ShoppingBag className="w-16 h-16 text-[#2a4f5f] animate-pulse" /> BTM Inventory
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] max-w-2xl mx-auto">
              Universal Access to Bargur Textile Excellence
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
            
            {/* Sidebar Filters */}
            <div className="xl:col-span-3">
              <ProductFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>

            {/* Main Grid */}
            <div className="xl:col-span-9">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-[2.5rem] overflow-hidden animate-pulse aspect-[3/4]" />
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-200 rounded-[4rem] bg-white/40 flex flex-col items-center justify-center gap-6">
                    <Search className="w-16 h-16 text-slate-300" />
                    <div>
                      <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">No Registry Matches</h3>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
                        Adjust your search parameters or price bracket.
                      </p>
                    </div>
                    <button 
                      onClick={handleResetFilters} 
                      className="mt-4 px-8 py-3 bg-[#2a4f5f] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-900 transition-all"
                    >
                      Reset Console
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
