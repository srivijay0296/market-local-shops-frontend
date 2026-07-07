import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { categoriesApi } from '@/lib/api/categories';
import {
  Search, ShoppingCart, User, Menu, X, MapPin, 
  ChevronDown, Store, LogOut, ShieldCheck, LayoutDashboard, Package
} from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, setShowAuthModal, setAuthMode, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoriesApi.getCategories();
        if (Array.isArray(cats)) {
          setCategories(cats);
        } else if (cats?.content && Array.isArray(cats.content)) {
          setCategories(cats.content);
        } else if (cats?.data && Array.isArray(cats.data)) {
          setCategories(cats.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#2a4f5f] text-white shadow-md">
      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3">
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Logo - NammaMart Branding */}
          <Link to="/" className="flex flex-col items-start shrink-0 group">
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter leading-none text-white flex items-center gap-1">
              Namma<span className="text-[#ffe11b]">Market</span>
            </h1>
            <p className="text-[9px] font-black text-blue-100 uppercase tracking-[0.3em] leading-none mt-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              Textile Hub ✦ <span className="text-[#ffe11b]">Namma Market</span>
            </p>
          </Link>

          {/* Search - Amazon/Flipkart Style */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl hidden md:block relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for local shops, sarees, fabric and more..."
              className="w-full pl-6 pr-14 py-3 bg-white text-gray-800 rounded-xl shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-4 focus:ring-[#ffe11b]/20 transition-all text-sm font-bold placeholder:text-gray-400"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#2a4f5f] text-white rounded-lg hover:bg-slate-900 transition-all shadow-md active:scale-95">
              <Search className="w-4.5 h-4.5" />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4 lg:gap-8 ml-auto font-bold text-sm lg:text-base">
            
            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onMouseEnter={() => setUserMenuOpen(true)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div 
                    onMouseLeave={() => setUserMenuOpen(false)}
                    className="absolute right-0 top-full pt-4 w-60 z-50"
                  >
                    <div className="bg-white rounded shadow-2xl border border-gray-100 overflow-hidden text-gray-800">
                      <div className="p-3 bg-gray-50 border-b flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase">
                         Profile
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </div>
                      <div className="p-1">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 text-sm font-bold">
                          <User className="w-4 h-4 text-[#2a4f5f]" /> My Profile
                        </Link>
                        <Link to="/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 text-sm font-bold">
                          <Package className="w-4 h-4 text-[#2a4f5f]" /> Orders
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50">
                            <ShieldCheck className="w-4 h-4 text-orange-500" /> Admin Panel
                          </Link>
                        )}
                        {user?.role === 'SELLER' && (
                          <Link to="/seller" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50">
                            <LayoutDashboard className="w-4 h-4 text-purple-600" /> Seller Hub
                          </Link>
                        )}
                        <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="bg-white text-[#2a4f5f] px-8 py-1.5 rounded font-black shadow-sm hover:bg-gray-50 transition text-sm uppercase tracking-wider"
              >
                Login
              </button>
            )}

            <Link to="/sellers" className="hidden lg:block hover:text-[#ffe11b] transition">
               Become a Seller
            </Link>

            {/* Cart */}
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 hover:text-[#ffe11b] transition relative">
              <ShoppingCart className="w-5 h-5 fill-current" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#fb641b] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[#2a4f5f]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories Bar (Flipkart Style) */}
      <div className="hidden md:block bg-white text-gray-800 shadow-sm border-b">
         <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 overflow-hidden h-10">
            <Link to="/shops" className="text-sm font-black text-[#2a4f5f] hover:scale-105 transition-all flex items-center gap-1.5 whitespace-nowrap uppercase tracking-tighter">
               <Store className="w-4 h-4" /> ALL SHOPS
            </Link>
            {categories.slice(0, 7).map(cat => (
               <Link key={cat.id} to={`/products?category=${cat.id}`} className="text-sm font-bold hover:text-[#2a4f5f] transition whitespace-nowrap uppercase tracking-[0.05em]">
                 {cat.name}
               </Link>
            ))}
            <Link to="/products" className="text-sm font-bold text-orange-600 hover:underline">All Deals</Link>
         </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-gray-800 border-t border-gray-100 animate-in slide-in-from-top-4">
           <div className="p-4 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-100 rounded focus:bg-white border border-transparent focus:border-[#2a4f5f] transition-all outline-none text-sm"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </form>
              <div className="grid grid-cols-2 gap-2">
                 {categories.slice(0, 10).map(cat => (
                   <Link key={cat.id} to={`/products?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)} className="p-3 bg-gray-50 rounded text-xs font-bold uppercase tracking-tight text-center hover:bg-gray-100">
                     {cat.name}
                   </Link>
                 ))}
              </div>
           </div>
        </div>
      )}
    </header>
  );
}