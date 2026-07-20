import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/components/theme-provider';
import { categoriesApi } from '@/lib/api/categories';
import {
  Search, ShoppingCart, User, Menu, X, 
  ChevronDown, Store, LogOut, ShieldCheck, LayoutDashboard, Package, Zap, Sun, Moon
} from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, setShowAuthModal, setAuthMode, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();

  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoriesApi.getCategories();
        if (Array.isArray(cats)) setCategories(cats);
        else if (cats?.content && Array.isArray(cats.content)) setCategories(cats.content);
        else if (cats?.data && Array.isArray(cats.data)) setCategories(cats.data);
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
    <>
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-card/80 dark:bg-card/75 backdrop-blur-xl border-border shadow-glass text-foreground py-2' : 'bg-transparent border-transparent text-foreground py-4'}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 lg:gap-8 justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 group">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-md"
              >
                <Zap className="w-6 h-6 text-primary-foreground fill-current" />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-display font-black tracking-tighter leading-none text-foreground">
                  Namma<span className="text-accent">Market</span>
                </h1>
                <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-[0.2em] leading-none mt-1 group-hover:text-accent transition-colors">
                  Premium Experience
                </p>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden lg:block relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, brands and categories..."
                className={`w-full pl-6 pr-14 py-3 rounded-full transition-all text-sm font-medium outline-none focus:ring-4 focus:ring-primary/30 border border-border/40 ${isScrolled ? 'bg-background/80 shadow-inner' : 'bg-card shadow-float'}`}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full hover:scale-105 transition-transform shadow-md">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-4 lg:gap-6 font-semibold">
              
              <Link to="/sellers" className="hidden lg:block hover:text-accent transition-colors text-sm">
                Become a Seller
              </Link>

              {/* Theme Toggle Switch */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl bg-card border border-border/80 text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-300 shadow-sm"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-primary animate-pulse" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onMouseEnter={() => setUserMenuOpen(true)}
                    className="flex items-center gap-2 hover:text-accent transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs shadow-md">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div 
                      onMouseLeave={() => setUserMenuOpen(false)}
                      className="absolute right-0 top-full pt-4 w-56 z-50"
                    >
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl shadow-glass border border-border overflow-hidden text-foreground"
                      >
                        <div className="p-4 bg-background/50 border-b border-border flex flex-col">
                           <span className="font-bold text-sm truncate">{user?.name}</span>
                           <span className="text-xs text-foreground/60 truncate">{user?.email}</span>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-background rounded-lg transition-colors text-sm font-medium">
                            <User className="w-4 h-4 text-accent" /> Profile
                          </Link>
                          <Link to="/orders" className="flex items-center gap-3 px-4 py-2 hover:bg-background rounded-lg transition-colors text-sm font-medium">
                            <Package className="w-4 h-4 text-accent" /> Orders
                          </Link>
                          {user?.role === 'ADMIN' && (
                            <Link to="/admin" className="flex items-center gap-3 px-4 py-2 hover:bg-background rounded-lg transition-colors text-sm font-medium">
                              <ShieldCheck className="w-4 h-4 text-success" /> Admin Center
                            </Link>
                          )}
                          {user?.role === 'SELLER' && (
                            <Link to="/seller" className="flex items-center gap-3 px-4 py-2 hover:bg-background rounded-lg transition-colors text-sm font-medium">
                              <LayoutDashboard className="w-4 h-4 text-primary" /> Seller Hub
                            </Link>
                          )}
                          <div className="h-px bg-border my-1" />
                          <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors text-sm font-medium">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="btn-primary py-2 px-6 text-sm"
                >
                  Login
                </button>
              )}

              {/* Cart */}
              <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 hover:text-accent transition-colors relative text-foreground">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 lg:hidden text-foreground">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Categories Bar */}
      <div className="hidden lg:block bg-card/60 backdrop-blur-md border-b border-border mt-20">
         <div className="container mx-auto px-4 flex items-center gap-8 overflow-hidden h-12">
            <Link to="/shops" className="text-sm font-bold text-foreground hover:text-accent transition-colors flex items-center gap-1.5 whitespace-nowrap uppercase tracking-wider">
               <Store className="w-4 h-4 text-accent" /> ALL SHOPS
            </Link>
            {categories.slice(0, 7).map(cat => (
               <Link key={cat.id} to={`/products?category=${cat.id}`} className="text-sm font-medium hover:text-accent transition-colors whitespace-nowrap uppercase tracking-wider text-foreground/80">
                 {cat.name}
               </Link>
            ))}
            <Link to="/products" className="text-sm font-bold text-accent hover:underline ml-auto uppercase tracking-wider">All Deals</Link>
         </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-40 bg-background pt-24 text-foreground"
        >
           <div className="p-4 space-y-6 container mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-4 pr-12 py-4 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-primary transition-all outline-none text-base shadow-inner"
                />
                <Search className="absolute right-4 top-4 w-6 h-6 text-foreground/40" />
              </form>
              <div className="grid grid-cols-2 gap-4">
                 {categories.slice(0, 10).map(cat => (
                   <Link key={cat.id} to={`/products?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)} className="p-4 bg-card border border-border rounded-2xl text-sm font-bold uppercase tracking-tight text-center hover:bg-accent/10 hover:text-accent transition-colors">
                     {cat.name}
                   </Link>
                 ))}
              </div>
           </div>
        </motion.div>
      )}
    </>
  );
}