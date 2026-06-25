import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  ShoppingBag,
  Menu,
  Activity,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CreateButton from "./CreateButton";
import { API_URL } from "@/lib/api/client";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Markets", path: "/admin/markets", icon: Store, adminOnly: true },
    { label: "Shops", path: "/admin/shops", icon: ShoppingBag },
    { label: "Products", path: "/admin/products", icon: Package },
    { label: "Users", path: "/admin/users", icon: Users, adminOnly: true },
    { label: "System Status", path: "/admin/system", icon: Activity, adminOnly: true },
    { label: "Nexus Node", path: "/admin/server", icon: Zap, adminOnly: true },
  ].filter(item => {
    if (!item.adminOnly) return true;
    const userRole = (user?.role || "").toUpperCase();
    const isSrivijay = user?.email?.toLowerCase() === 'srivijay0296@gmail.com';
    return userRole === 'ADMIN';
  });

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#F1F3F6] overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-20">
        
        {/* LOGO AREA - FLIPKART STYLE */}
        <div className="h-14 flex items-center px-6 border-b border-slate-100 bg-white">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#2874f0] rounded-sm flex items-center justify-center text-white font-black text-xs">
              M
            </div>
            <span className="font-black text-[#2874f0] text-sm uppercase tracking-tight">Marketplay Hub</span>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-4">
          <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mb-3">Main Menu</p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all group
                  ${active 
                    ? "bg-blue-50 text-[#2874f0] border-r-4 border-[#2874f0]" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-[#2874f0]" : "text-slate-400 group-hover:text-slate-600"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* SYSTEM STATUS */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
             <div className="px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Store Health</span>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                  <p className="text-xs font-bold text-slate-700">Excellent (98%)</p>
             </div>

             <div className="px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Server Endpoint</span>
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  </div>
                  <p className="text-[10px] font-mono break-all text-slate-600 select-all font-bold" title="API Base URL">
                      {API_URL.startsWith('/') ? `${window.location.origin}${API_URL}` : API_URL}
                  </p>
             </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP HEADER - FLIPKART STYLE */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm shadow-slate-200/50">
          
          <div className="flex items-center gap-6 flex-1">
               <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
                   <Menu className="w-5 h-5" />
               </button>

               {/* 🔍 Global Search Bar */}
               <div className="hidden md:flex items-center bg-slate-100 px-4 py-1.5 rounded-lg w-full max-w-md group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#2874f0]" />
                  <input 
                    type="text" 
                    placeholder="Search records, help, guides..." 
                    className="bg-transparent border-none outline-none px-3 py-1 text-sm w-full font-medium"
                  />
               </div>
          </div>

          <div className="flex items-center gap-4">
            
            <button className="p-2 text-slate-400 hover:text-[#2874f0] hover:bg-blue-50 rounded-full transition relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

            <CreateButton />

            <div className="flex items-center gap-3 ml-2 group cursor-pointer pl-2 py-1 pr-1 hover:bg-slate-50 rounded-full transition">
                <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-slate-800 leading-tight">Admin User</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{user?.role || 'Administrator'}</p>
                </div>
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 group-hover:border-blue-200 transition">
                    <User className="w-5 h-5" />
                </div>
            </div>
          </div>
        </header>

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-slide-up">
           <Outlet />
        </main>
      </div>
    </div>
  );
}