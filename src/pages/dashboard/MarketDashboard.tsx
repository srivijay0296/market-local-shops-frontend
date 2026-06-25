import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { marketsApi, Market } from '@/lib/api/markets';
import { productsApi } from '@/lib/api/products';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import { BarChart3, Users, Package, Shield, Store, MapPin, ChevronRight, Eye } from 'lucide-react';

export default function MarketDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated, setShowAuthModal, setAuthMode } = useAuth();
  const navigate = useNavigate();
  
  const [market, setMarket] = useState<Market | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine if admin logic should apply. For now we assume admins can view any dashboard.
    // In a real app, you would check if user is admin OR market_manager specifically.
    if (!isAuthenticated || user?.role !== 'ADMIN') {
        setLoading(false);
        return; 
    }

    const loadMarketData = async () => {
      try {
        if (!slug) return;
        const marketData = await marketsApi.getMarketBySlug(slug);
        if (!marketData) {
            navigate('/admin');
            return;
        }
        setMarket(marketData);

        // Fetch shops for this market, then get their products
        const { data: shopsInMarket } = await supabase
          .from('shops')
          .select('id')
          .eq('market_id', marketData.id);
        
        const shopIds = (shopsInMarket || []).map((s: any) => s.id);
        
        let prods: any[] = [];
        if (shopIds.length > 0) {
          // Get products for each shop (first shop for simplicity, or loop all)
          for (const shopId of shopIds) {
            const shopProds = await productsApi.getProducts({ shopId });
            prods = [...prods, ...shopProds];
          }
        }
        setProducts(prods);
        
        // Fetch vendors specific to this market
        const { data: vData } = await supabase.from('vendors').select('*').eq('market_id', marketData.id);
        setVendors(vData || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadMarketData();
  }, [slug, isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Header /><AuthModal /><CartDrawer />
        <div className="max-w-lg mx-auto px-4 py-32 text-center">
          <Shield className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Market Dashboard Access Restricted</h1>
          <p className="text-gray-500 mb-6">This area is restricted to administrators and market managers.</p>
          <button
            onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
            className="px-8 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold hover:bg-blue-800 transition"
          >
            Login to Access
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
      return (
          <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
              <Header />
              <div className="flex-1 flex items-center justify-center p-8 text-xl font-medium text-gray-400 animate-pulse">
                  Loading Market Console...
              </div>
          </div>
      )
  }

  if (!market) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <AuthModal />
      <CartDrawer />

      <div className="bg-white border-b relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#1E3A8A]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/admin" className="hover:text-[#1E3A8A]">System Admin</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">{market.name} Overview</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Widget */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 mb-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-50 z-0 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-6 h-6 text-[#1E3A8A]" />
              <span className="text-sm text-[#1E3A8A] uppercase tracking-widest font-bold">Market Division Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 truncate max-w-2xl">{market.name}</h1>
            <p className="text-gray-600 flex items-center gap-2 max-w-xl">
              <MapPin className="w-4 h-4 text-[#F97316] shrink-0" /> {market.location}
            </p>
          </div>
          <div className="relative z-10 flex gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <div className="text-center px-4 border-r border-gray-200">
                 <p className="text-2xl font-black text-[#1E3A8A]">{vendors.length}</p>
                 <p className="text-xs font-bold text-gray-500 uppercase">Vendors</p>
             </div>
             <div className="text-center px-4">
                 <p className="text-2xl font-black text-[#F97316]">{products.length}</p>
                 <p className="text-xs font-bold text-gray-500 uppercase">Products</p>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Vendors List Side */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:h-fit">
                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-[#1E3A8A]" />
                    Registered Shops
                </h3>
                <div className="space-y-4">
                    {vendors.map(v => (
                        <div key={v.id} className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-1 border border-transparent hover:border-gray-200 transition">
                            <span className="font-bold text-gray-900 line-clamp-1">{v.shop_name}</span>
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-[#F97316]"/> {v.address || 'No Address'}</span>
                            <span className="text-xs text-gray-400 mt-1">{v.phone || 'No Phone'}</span>
                        </div>
                    ))}
                    {vendors.length === 0 && (
                        <div className="text-center py-8 text-gray-400 italic text-sm border-2 border-dashed rounded-xl">No shops registered.</div>
                    )}
                </div>
            </div>

            {/* Products Main View */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#1E3A8A]" />
                        Market Active Inventory
                    </h3>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#f8fafc] border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 font-bold text-gray-600">Product List</th>
                                <th className="text-left px-6 py-4 font-bold text-gray-600">Shop</th>
                                <th className="text-left px-6 py-4 font-bold text-gray-600">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-lg overflow-hidden border">
                                                <img src={p.images?.[0] || '/placeholder.svg'} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <span className="font-semibold text-gray-800 line-clamp-1 max-w-[200px]">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                            {p.vendor?.shop_name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-[#1E3A8A] whitespace-nowrap">{formatPrice(p.price)}</td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 border border-dashed m-6 rounded-2xl block">No products in this market yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
