import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { ShoppingBag, Search, Filter } from "lucide-react";

export default function AllProducts() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, parseInt(searchParams.get("maxPrice") || "50000")]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, prods] = await Promise.all([
          categoriesApi.getCategories(),
          productsApi.getProducts()
        ]);
        setCategories(cats || []);
        setProducts(prods || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = (products || []).filter(p => {
    if (!p) return false;
    
    // 🛡️ Data Sanitization Shield
    const nameStr = (p.name || '').toLowerCase();
    const searchStr = (searchQuery || '').toLowerCase();
    const shopNameStr = (p.shops?.name || p.vendor?.shop_name || '').toLowerCase();

    const matchesSearch = nameStr.includes(searchStr) || shopNameStr.includes(searchStr);
    
    const productPrice = parseFloat(p.price) || 0;
    const matchesPrice = productPrice >= (priceRange[0] || 0) && productPrice <= (priceRange[1] || 50000);
    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory || p.category === selectedCategory;

    return matchesSearch && matchesPrice && matchesCategory;
  });

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
            <div className="xl:col-span-3 space-y-8">
               <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-50">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3">
                     <Filter className="w-4 h-4 text-[#2a4f5f]" /> Command Filters
                  </h3>
                  
                  <div className="space-y-8">
                     {/* Search */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Search Registry</label>
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <input 
                              type="text" 
                              placeholder="Type query..." 
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-[#2a4f5f] outline-none transition-all text-sm font-bold"
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                           />
                        </div>
                     </div>

                     {/* Price Range */}
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Price Bracket: ₹{priceRange[0]} - ₹{priceRange[1]}</label>
                        <input 
                           type="range" 
                           min="0" 
                           max="50000" 
                           step="100"
                           className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2a4f5f]"
                           value={priceRange[1]}
                           onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        />
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Hub Categories</h3>
                  <div className="flex flex-col gap-2">
                     <button 
                        onClick={() => setSelectedCategory("all")}
                        className={`text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === "all" ? 'bg-white text-slate-900 shadow-xl translate-x-2' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                     >
                        Universal Grid
                     </button>
                     {categories.map(c => (
                        <button 
                           key={c.id}
                           onClick={() => setSelectedCategory(c.id)}
                           className={`text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === c.id ? 'bg-white text-slate-900 shadow-xl translate-x-2' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                           {c.name}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Main Grid */}
            <div className="xl:col-span-9">
               <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({length: 6}).map((_, i) => (
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
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Adjust your search parameters or price bracket.</p>
                    </div>
                    <button onClick={() => {setSearchQuery(""); setSelectedCategory("all"); setPriceRange([0, 50000]);}} className="mt-4 px-8 py-3 bg-[#2a4f5f] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-900 transition-all">Reset Console</button>
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
