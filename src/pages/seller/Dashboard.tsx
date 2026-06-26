import { useState, useEffect } from 'react';
import { backendApi } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSellerData = async () => {
      try {
        // Mocking some data for the demo since analytics table might be empty
        const { data: vendor } = await backendApi.get('/vendors', { params: { user_id: user.id } });

        if (vendor) {
           // Fetch orders for this vendor
           const { data: orders } = await backendApi.get('/order-items', { params: { vendor_id: vendor.id, sort: 'created_at_desc', limit: 5 } });
           
           setRecentOrders(orders || []);
           
           setStats({
             totalSales: 45000,
             totalOrders: 12,
             activeProducts: 8,
             totalCustomers: 10,
             pendingOrders: 3
           });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F1F3F6]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-24 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
              <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Seller Dashboard</h1>
              <p className="text-gray-500 text-xs font-bold border-l-2 border-blue-500 pl-2">Performance & Insights</p>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Settlement Period:</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Last 30 Days</span>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           {[
             { label: 'Total Revenue', value: formatPrice(stats.totalSales), icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
             { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
             { label: 'Active Products', value: stats.activeProducts, icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
           ].map((item, i) => (
             <div key={i} className="bg-white p-6 rounded shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                   <h3 className="text-xl font-black text-gray-800">{item.value}</h3>
                </div>
                <div className={`w-12 h-12 ${item.bg} rounded flex items-center justify-center`}>
                   <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
             </div>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Recent Orders Table */}
           <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                       <Clock className="w-4 h-4 text-blue-600" /> Recent Orders
                    </h2>
                    <button className="text-xs font-bold text-blue-600 hover:underline px-3 py-1 bg-blue-50 rounded">View All</button>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                          <tr>
                             <th className="px-6 py-3">Order ID</th>
                             <th className="px-6 py-3">Product</th>
                             <th className="px-6 py-3">Amount</th>
                             <th className="px-6 py-3">Status</th>
                             <th className="px-6 py-3 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50 text-sm">
                          {recentOrders.length > 0 ? recentOrders.map((item, i) => (
                             <tr key={i} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4 font-mono font-bold text-xs">#{item.order?.id?.substring(0, 8).toUpperCase()}</td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gray-100 rounded" />
                                      <span className="font-medium text-gray-700 line-clamp-1">Product #{item.product_id?.substring(0, 4)}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</td>
                                <td className="px-6 py-4">
                                   <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-yellow-50 text-yellow-600 border border-yellow-100">
                                      {item.order?.status || 'Pending'}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <button className="text-gray-400 hover:text-blue-600"><MoreVertical className="w-4 h-4" /></button>
                                </td>
                             </tr>
                          )) : (
                             <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-bold uppercase text-xs">No orders yet</td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Tips Section */}
              <div className="bg-blue-600 rounded p-6 shadow-lg text-white relative overflow-hidden">
                 <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-2 uppercase tracking-wide">Boost Your Sales</h3>
                    <p className="text-blue-100 text-sm max-w-md">Add at least 5 products with high-quality images and clear descriptions to improve visibility by <span className="font-bold text-white uppercase italic tracking-tighter">up to 40%</span>.</p>
                    <button className="mt-4 bg-white text-blue-600 px-6 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-blue-50 transition">Add New Product</button>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
                 <TrendingUp className="absolute bottom-4 right-4 w-20 h-20 text-white/10" />
              </div>
           </div>

           {/* Sidebar Analytics */}
           <div className="space-y-6">
              <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
                 <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 pb-2 border-b border-gray-50">Insights</h2>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Returning Customers</p>
                          <p className="text-sm font-bold text-gray-800">15% <span className="text-green-600 font-normal">▲ 5%</span></p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Fullfillment Rate</p>
                          <p className="text-sm font-bold text-gray-800">98.2% <span className="text-blue-600 font-normal">Stable</span></p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Return Rate</p>
                          <p className="text-sm font-bold text-gray-800">1.5% <span className="text-green-600 font-normal">▼ 2%</span></p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
                 <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Upcoming Settlements</h2>
                 <div className="p-4 bg-gray-50 rounded border border-dashed border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Estimated 15th Oct</p>
                    <p className="text-xl font-black text-gray-800 mt-1">{formatPrice(12450)}</p>
                    <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase">* After platform fees & TDS</p>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
