import React, { useState } from "react";
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
  Menu,
  Activity,
  Zap,
  ShoppingBag,
  Image as ImageIcon,
  FileText,
  ClipboardCheck,
  Settings,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CreateButton from "./CreateButton";

type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Markets", path: "/admin/markets", icon: Store, adminOnly: true },
    { label: "Shops", path: "/admin/shops", icon: ShoppingBag },
    { label: "Shop Approvals", path: "/admin/requests", icon: ClipboardCheck },
    { label: "Products", path: "/admin/products", icon: Package },
    { label: "Orders & Revenue", path: "/admin/orders", icon: FileText },
    { label: "Banners", path: "/admin/banners", icon: ImageIcon },
    { label: "Users & Roles", path: "/admin/users", icon: Users, adminOnly: true },
    { label: "System Console", path: "/admin/server", icon: Zap, adminOnly: true },
    { label: "System Status", path: "/admin/system", icon: Activity, adminOnly: true },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ].filter((item) => {
    if (!item.adminOnly) return true;
    const userRole = (user?.role || "").toUpperCase();
    return userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  });

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout?.();
    } catch (err) {
      // ignore
    } finally {
      navigate("/login");
    }
  };

  const VITE_API_URL = (import.meta as any)?.env?.VITE_API_URL ?? "";
  const API_URL = typeof VITE_API_URL === "string" && VITE_API_URL.length ? VITE_API_URL : "/api";

  const apiDisplayUrl =
    typeof API_URL === "string" && API_URL.length
      ? API_URL.startsWith("/")
        ? `${window.location.origin}${API_URL}`
        : API_URL
      : window.location.origin;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* LOGO AREA */}
        <div className="h-16 flex items-center px-6 border-b border-border/60 bg-card">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-primary-foreground font-black text-sm shadow-md">
              N
            </div>
            <span className="font-display font-black text-foreground text-sm uppercase tracking-wider">
              Namma<span className="text-accent">Market</span>
            </span>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-bold text-foreground/40 uppercase tracking-[2px] mb-3">
              Management Tier
            </p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 group
                      ${active
                        ? "bg-primary/10 text-accent border border-primary/20"
                        : "text-foreground/60 hover:bg-card/60 hover:text-foreground border border-transparent"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon
                      className={`w-4 h-4 ${active ? "text-accent" : "text-foreground/40 group-hover:text-foreground/80"}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* SYSTEM STATUS */}
        <div className="p-4 bg-background/40 border-t border-border/60 space-y-3">
          <div className="px-4 py-3 bg-card border border-border/60 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-wider">Marketplace Health</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-foreground/80">Active (99.4%)</p>
          </div>

          <div className="px-4 py-3 bg-card border border-border/60 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-wider">HQ Nexus Endpoint</span>
              <span className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <p
              className="text-[9px] text-foreground/60 font-mono break-all select-all font-bold"
              title="API Base URL"
            >
              {apiDisplayUrl}
            </p>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 bg-card border-b border-border/60 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden p-2 text-foreground/60 hover:bg-card rounded-lg transition"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden md:flex items-center bg-background/60 border border-border/80 px-4 py-1.5 rounded-full w-full max-w-md group focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="w-4 h-4 text-foreground/40 group-focus-within:text-accent" />
              <input
                type="text"
                placeholder="Query control center records..."
                className="bg-transparent border-none outline-none px-3 py-1 text-xs font-bold w-full text-foreground placeholder:text-foreground/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-foreground/50 hover:text-accent hover:bg-card rounded-xl transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border border-card" />
            </button>

            <div className="h-6 w-[1px] bg-border/60 mx-1" />

            <CreateButton />

            <div className="flex items-center gap-3 ml-2 group pl-2 py-1 pr-1 rounded-full transition">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-foreground leading-tight">{user?.name ?? "Admin User"}</p>
                <p className="text-[9px] text-foreground/40 uppercase font-black tracking-widest">{user?.role || "Administrator"}</p>
              </div>
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-accent border border-primary/20 group-hover:border-accent transition">
                <User className="w-5 h-5" />
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-2 bg-primary/15 text-accent px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/25 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
