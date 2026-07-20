import React from "react";
import { Filter, Search } from "lucide-react";

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  priceRange: [number, number];
  setPriceRange: (val: [number, number]) => void;
  categories: any[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
}

export const ProductFilters = React.memo(function ProductFilters({
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  categories,
  selectedCategory,
  setSelectedCategory
}: ProductFiltersProps) {
  return (
    <div className="space-y-8">
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
              Price Bracket: ₹{priceRange[0]} - ₹{priceRange[1]}
            </label>
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
            className={`text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedCategory === "all" 
                ? "bg-white text-slate-900 shadow-xl translate-x-2" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Universal Grid
          </button>
          {categories.map(c => (
            <button 
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === c.id 
                  ? "bg-white text-slate-900 shadow-xl translate-x-2" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
