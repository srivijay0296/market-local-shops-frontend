import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Trash2, Loader2, Store,
  Package, User as UserIcon,
  Activity, ShieldCheck, Ban, Terminal,
  ChevronRight, Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { adminApi } from "@/lib/api/admin";
import { shopsApi } from "@/lib/api/shops";
import { productsApi } from "@/lib/api/products";
import { backendApi } from '@/lib/api/client';
import { usersApi } from "@/lib/api/users";

type TabType = "analytics" | "sellers" | "products" | "security";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [loading, setLoading] = useState(true);

  // Data States
  const [sellers, setSellers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShops: 0,
    totalProducts: 0,
    pendingShops: 0,
    shops: 0,
    pendingProducts: 0,
    sellers: 0,
    pendingSellers: 0,
    buyers: 0,
    admins: 0,
    activeUsers: 0,
  });

  const revenueData = [
    { name: 'Mon', value: 4500 }, { name: 'Tue', value: 7200 }, { name: 'Wed', value: 6800 },
    { name: 'Thu', value: 9100 }, { name: 'Fri', value: 12500 }, { name: 'Sat', value: 15400 },
    { name: 'Sun', value: 14200 }
  ];

  useEffect(() => {
    console.log("🔐 Admin Dashboard Clearance Check: user =", user, "authLoading =", authLoading);
    if (authLoading) return;
    if (user && user.role === 'ADMIN') {
      console.log("🛡️ Admin Dashboard Clearance Approved. Fetching data...");
      fetchData();
    } else {
      console.warn("🚨 Admin Dashboard Access Denied: User role must be ADMIN. Found:", user?.role);
    }
  }, [user, authLoading, activeTab]);

  const fetchData = async () => {
    console.log("📊 Admin Dashboard: Initializing fetchData for activeTab:", activeTab);
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const backendStats = await usersApi.getStats();
        setStats({
          totalUsers: backendStats.totalUsers || 0,
          totalShops: backendStats.shops || 0,
          totalProducts: backendStats.products || 0,
          pendingShops: backendStats.pendingShops || 0,
          shops: backendStats.shops || 0,
          pendingProducts: backendStats.pendingProducts || 0,
          sellers: backendStats.sellers || 0,
          pendingSellers: backendStats.pendingSellers || 0,
          buyers: backendStats.buyers || 0,
          admins: backendStats.admins || 0,
          activeUsers: backendStats.activeUsers || 0,
        });
      } else if (activeTab === 'sellers') {
        const { data } = await backendApi.get('/shops', { params: { sort: 'created_at_desc' } });
        setSellers(data || []);
      } else if (activeTab === 'products') {
        const { data } = await backendApi.get('/products', { params: { sort: 'created_at_desc' } });
        setProducts(data || []);
      }
    } catch (error: any) {
      console.error("Dashboard Fetch Error:", error);
      toast.error("Nexus Communication Fault: Sync Failed.");
    } finally { setLoading(false); }
  };

  const toggleApproval = async (id: string, type: 'shops' | 'products', currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      if (type === 'shops') {
        await backendApi.put(`/shops/${id}`, { is_approved: newStatus });
      } else {
        await backendApi.put(`/products/${id}`, { is_approved: newStatus });
      }
      toast.success(`Node ${newStatus ? 'Authorized' : 'Deauthorized'} Successfully`);
      fetchData();
    } catch (err) {
      toast.error("Authorization Override Failed");
    }
  };

  const approveShop = async (id: string) => {
    await toggleApproval(id, 'shops', false);
  };

  const deleteNode = async (id: string, type: 'shops' | 'products') => {
    if (!confirm("Execute Node Deletion Request? This action is irreversible.")) return;
    try {
      if (type === 'shops') {
        await backendApi.delete(`/shops/${id}`);
      } else {
        await backendApi.delete(`/products/${id}`);
      }
      toast.success("Node Purged from Nexus Record");
      fetchData();
    } catch (err) {
      toast.error("Purge Request Denied: Core Integrity Protection Triggered");
    }
  };

  const deleteShop = async (id: string) => {
    await deleteNode(id, 'shops');
  };

  const copyHealSQL = () => {
    const sql = `-- 🌌 UNIVERSAL HEAL LOGIC (AUTO-EXECUTE)\nNOTIFY pgrst, 'reload schema';\n`;
    navigator.clipboard.writeText(sql);
    toast.success("UNIVERSAL HEAL LOGIC COPIED TO BUFFER.");
  };

  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    console.warn("🛡️ Admin Dashboard Clearance Check Failed: user =", user);
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 p-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
          <span className="text-3xl">🛡️</span>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">Clearance Check Failed</h2>
        <p className="text-slate-400 text-xs max-w-md">
          Your profile clearance level is insufficient or the account was not synced. Please contact your system administrator.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  if (authLoading || (loading && stats.totalShops === 0 && sellers.length === 0 && products.length === 0)) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
      <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
      <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Syncing HQ Nexus...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 animate-in fade-in duration-1000">
      <div className="max-w-[1700px] mx-auto space-y-10">

        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl">
                <Terminal className="w-7 h-7" />
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                Namma<span className="text-indigo-600">HQ</span>
              </h1>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] ml-2">Administrator Core Interface</p>
          </div>

          <div className="flex flex-wrap items-center bg-white p-2 rounded-[2.5rem] shadow-xl border border-slate-100">
            {[
              { id: 'analytics', icon: Activity, label: "Pulse" },
              { id: 'sellers', icon: Store, label: "Vendors" },
              { id: 'products', icon: Package, label: "Assets" },
              { id: 'security', icon: ShieldCheck, label: "SafeGate" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all
                ${activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-2xl scale-105"
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-10">

          {activeTab === 'analytics' && (
            <>
              <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
                <MetricCard icon={<UserIcon className="text-indigo-600" />} label="Total Users" value={stats.totalUsers} change="System Live" positive={true} />
                <MetricCard icon={<UserIcon className="text-blue-500" />} label="Buyers" value={stats.buyers} change="Registered" positive={true} />
                <MetricCard icon={<UserIcon className="text-emerald-500" />} label="Sellers" value={stats.sellers} change={`${stats.pendingSellers} Pending`} positive={stats.pendingSellers === 0} />
                <MetricCard icon={<UserIcon className="text-violet-500" />} label="Admins" value={stats.admins} change="Cleared" positive={true} />
                <MetricCard icon={<Activity className="text-rose-500" />} label="Active Users" value={stats.activeUsers} change="Last 30 Days" positive={true} />
                <MetricCard icon={<Store className="text-amber-500" />} label="Pending Sellers" value={stats.pendingSellers} change="Needs Review" positive={stats.pendingSellers === 0} />
              </div>

              <div className="col-span-12 xl:col-span-8 bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden relative group">
                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Traffic Trajectory</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time engagement pulse</p>
                  </div>
                </div>
                <div className="h-[450px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} dx={-15} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={5} fillOpacity={1} fill="url(#adminGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-4 space-y-10">
                <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-3xl font-black italic uppercase leading-none">SafeGate-Pulse</h3>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-[250px]">Perform an emergency node recalibration for all distributed systems.</p>
                    <button
                      onClick={copyHealSQL}
                      className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-all active:scale-95"
                    >
                      Execute Heal Probe
                    </button>
                  </div>
                  <Activity className="absolute -bottom-8 -right-8 w-40 h-40 text-white/5 opacity-50 group-hover:rotate-12 transition-transform duration-1000" />
                </div>

                <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase italic text-slate-400 tracking-widest">Active Alerts</h3>
                    <Target className="w-4 h-4 text-rose-500 animate-ping" />
                  </div>
                  <div className="space-y-6">
                    {stats.pendingShops > 0 && (
                      <AlertNode label="Pending Shop Approvals" count={stats.pendingShops} color="indigo" onClick={() => setActiveTab('sellers')} />
                    )}
                    {stats.pendingShops === 0 && (
                      <div className="py-10 text-center opacity-30 italic font-black text-slate-300 uppercase text-[10px]">Zero Critical Alerts</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'sellers' && (
            <div className="col-span-12 space-y-8">
              <h2 className="text-4xl font-black text-slate-900 uppercase italic">Shop Approvals</h2>
              <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-8 text-[11px] font-black uppercase text-slate-400">Shop</th>
                      <th className="p-8 text-[11px] font-black uppercase text-slate-400">Owner</th>
                      <th className="p-8 text-[11px] font-black uppercase text-slate-400">Status</th>
                      <th className="p-8 text-[11px] font-black uppercase text-slate-400">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {Array.isArray(sellers) && sellers.map(s => (
                      <tr key={s?.id || Math.random()} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${s?.is_approved ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                              {s?.name?.[0] || 'V'}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 uppercase tracking-tight">{s?.name || 'Unnamed Shop'}</p>
                              <p className="text-[10px] text-slate-400 font-black">{s?.location || 'No Location'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <span className="text-[11px] font-black text-slate-600 italic tracking-tight">
                            {s?.owner?.name || s?.vendor_name || 'Unknown'}
                          </span>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${s?.is_approved ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${s?.is_approved ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {s?.is_approved ? 'APPROVED' : 'PENDING'}
                            </span>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleApproval(s?.id, 'shops', s?.is_approved)}
                              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${s?.is_approved ? 'bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white' : 'bg-indigo-600 text-white shadow-xl hover:scale-105'}`}
                            >
                              {s?.is_approved ? 'REVOKE' : 'AUTHORIZE'}
                            </button>
                            <button onClick={() => deleteNode(s?.id, 'shops')} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sellers.length === 0 && (
                      <tr><td colSpan={4} className="p-20 text-center text-slate-300 uppercase font-black italic">No pending requests</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="col-span-12 space-y-8">
              <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Asset Moderation</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing inventory for marketplace integrity</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.isArray(products) && products.map(p => (
                  <div key={p?.id || Math.random()} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                      <img
                        src={p?.images?.[0] || p?.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        alt={p?.name}
                      />
                      {p?.is_approved ? (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-full shadow-lg">LIVE</div>
                      ) : (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                          <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/30 px-6 py-2 rounded-2xl">Awaiting Protocol</span>
                        </div>
                      )}
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="font-black text-slate-800 uppercase italic text-sm tracking-tight leading-tight line-clamp-2">{p?.name || 'Unknown Asset'}</h4>
                        <span className="text-[9px] font-black text-indigo-400 underline uppercase decoration-2 underline-offset-4 shrink-0">{p?.category || 'General'}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 italic"><Store className="w-3 h-3" /> {p?.shop?.name || 'Independent Node'}</p>
                      <div className="pt-4 border-t border-slate-50 flex gap-2">
                        <button
                          onClick={() => toggleApproval(p?.id, 'products', p?.is_approved)}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${p?.is_approved ? 'bg-slate-900 text-white hover:bg-rose-500' : 'bg-indigo-600 text-white shadow-xl hover:scale-[1.03]'}`}
                        >
                          {p?.is_approved ? 'UNLIST' : 'APPROVE'}
                        </button>
                        <button onClick={() => deleteNode(p?.id, 'products')} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!products || products.length === 0) && (
                  <div className="col-span-full py-40 text-center text-slate-300 font-black uppercase italic tracking-[0.5em] opacity-30">Nexus Buffer Empty</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="col-span-12">
              <div className="bg-slate-900 rounded-[5rem] p-24 shadow-2xl relative overflow-hidden group">
                <Target className="absolute -top-20 -right-20 w-80 h-80 text-white/5 group-hover:scale-125 transition-transform duration-[3000ms]" />
                <div className="relative z-10 max-w-4xl space-y-8">
                  <div className="w-20 h-20 bg-indigo-600/30 rounded-3xl border border-white/20 flex items-center justify-center">
                    <Activity className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">Universal <span className="text-indigo-600">Recalibration</span></h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px] leading-relaxed">
                    Forces a schema synchronization across all distributed Nexus nodes. Run this probe if the global state encounters logic drift or authorization voids.
                  </p>
                  <div className="flex gap-4 pt-10">
                    <button
                      onClick={copyHealSQL}
                      className="px-12 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-indigo-900 transition-all shadow-[0_25px_60px_-15px_rgba(79,70,229,0.7)] active:scale-95"
                    >
                      Execute Logic Clone
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, change, positive }: any) {
  return (
    <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-slate-400">{icon}</div>
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{change}</span>
        </div>
      </div>
      <h3 className="text-6xl font-black text-slate-900 tracking-tighter italic leading-none">{value}</h3>
    </div>
  );
}

function AlertNode({ label, count, color, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full p-6 rounded-[2rem] border border-indigo-100 bg-indigo-50 text-indigo-600 flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xl font-black italic">{count}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  );
}