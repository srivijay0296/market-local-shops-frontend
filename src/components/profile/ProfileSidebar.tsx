import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Package, Heart, ShieldCheck, LogOut, ChevronRight } from "lucide-react";

interface ProfileSidebarProps {
  user: any;
  name: string;
  logout: () => void;
}

export const ProfileSidebar = React.memo(function ProfileSidebar({ user, name, logout }: ProfileSidebarProps) {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-border flex flex-col items-center text-center relative overflow-hidden group"
      >
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-primary/20 to-accent/20 z-0" />
        <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center mb-4 relative z-10 group-hover:scale-105 transition-transform">
          <User className="w-10 h-10 text-foreground/30" />
        </div>
        <h3 className="font-display font-black text-foreground text-xl relative z-10">
          {name || "Namma Member"}
        </h3>
        <div className="mt-2 bg-success/10 px-4 py-1.5 rounded-full flex items-center gap-2 relative z-10">
          <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-success uppercase tracking-widest">
            {user.role} Access
          </span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden"
      >
        <nav className="flex flex-col">
          <Link to="/orders" className="flex items-center justify-between p-5 hover:bg-background transition-colors border-b border-border group">
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold uppercase tracking-wider text-foreground">My Orders</span>
            </div>
            <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/cart" className="flex items-center justify-between p-5 hover:bg-background transition-colors border-b border-border group">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold uppercase tracking-wider text-foreground">Wishlist</span>
            </div>
            <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:translate-x-1 transition-transform" />
          </Link>
          {user?.role === "ADMIN" && (
            <Link to="/admin" className="flex items-center justify-between p-5 hover:bg-background transition-colors border-b border-border group">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span className="text-sm font-bold uppercase tracking-wider text-foreground">Admin Core</span>
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          <button onClick={logout} className="flex items-center justify-between p-5 hover:bg-destructive/5 transition-colors group text-destructive text-left">
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Sign Out</span>
            </div>
          </button>
        </nav>
      </motion.div>
    </div>
  );
});
