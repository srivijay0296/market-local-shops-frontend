import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/lib/api/orders";
import { generateInvoicePDF } from "@/lib/invoice";
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  LogIn,
  Download,
  ShieldCheck,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  total_price?: number; // compat
  shipping_address: string;
  created_at: string;
  items?: any[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Protocol Initiated",
    color: "bg-warning/10 text-warning border-warning/20",
    icon: <Clock className="w-4 h-4" />,
  },
  processing: {
    label: "Processing",
    color: "bg-primary/10 text-primary border-primary/20",
    icon: <Package className="w-4 h-4" />,
  },
  shipped: {
    label: "In Transit",
    color: "bg-accent/10 text-accent border-accent/20",
    icon: <Truck className="w-4 h-4" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-success/10 text-success border-success/20",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  cancelled: {
    label: "Terminated",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <XCircle className="w-4 h-4" />,
  },
};

const STEPS = ["pending", "processing", "shipped", "delivered"];

function OrderProgress({ status }: { status: string }) {
  const currentStep = STEPS.indexOf(status);
  if (status === "cancelled") return null;

  return (
    <div className="flex items-center gap-0 mt-4 mb-2 max-w-sm w-full">
      {STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${done ? "bg-primary text-foreground shadow-lg shadow-primary/20" : "bg-white border-2 border-border text-foreground/40"}
                ${active ? "scale-110" : ""}`}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-1 mx-2 rounded-full bg-border overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: i < currentStep ? "100%" : "0%" }}
                  className="absolute inset-y-0 left-0 bg-primary"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, index }: { order: Order, index: number }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const totalPrice = order.total_amount || order.total_price || 0;
  const date = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleDownloadInvoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateInvoicePDF(order, order.items || []);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden transform transition-all hover:shadow-md hover:border-primary/20"
    >
      {/* Order Header */}
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex gap-4 relative z-10">
           <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center border border-border shrink-0">
             <Package className="w-7 h-7 text-primary" />
           </div>
           <div>
            <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Protocol ID</p>
            <p className="font-display text-lg font-black text-foreground">
              #{order.id.slice(0, 12).toUpperCase()}
            </p>
            <p className="text-xs text-foreground/60 font-medium mt-0.5">{date}</p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end justify-between sm:justify-end gap-3 sm:gap-4 relative z-10">
          <div className="sm:text-right">
            <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Authorization Value</p>
            <p className="text-2xl font-black text-primary">
              ₹{totalPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold border uppercase tracking-widest ${statusCfg.color}`}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="px-6 py-4 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-b border-border">
         <div className="flex-1 w-full max-w-md">
            <OrderProgress status={order.status} />
            <div className="flex justify-between mt-2 w-full max-w-sm">
              {STEPS.map((s) => (
                <span key={s} className={`text-[9px] font-bold uppercase tracking-widest ${s === order.status ? 'text-primary' : 'text-foreground/40'}`}>
                  {STATUS_CONFIG[s].label.split(' ')[0]}
                </span>
                ))}
            </div>
         </div>
         <button 
           onClick={handleDownloadInvoice}
           className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-foreground hover:bg-background hover:border-primary/50 transition-colors shadow-sm shrink-0 uppercase tracking-widest"
         >
           <Download className="w-4 h-4" />
           Manifest
         </button>
      </div>

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 text-xs text-primary font-bold hover:bg-primary/5 transition-colors uppercase tracking-widest"
      >
        <span>{expanded ? "HIDE ASSETS" : "VIEW ASSETS"}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Order Items */}
      <AnimatePresence>
        {expanded && order.items && order.items.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="px-6 py-5 flex items-center gap-5 hover:bg-background/50 transition-colors">
                  <div className="w-20 h-20 bg-background rounded-xl border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-foreground/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate uppercase tracking-tight">
                      {item.product?.name || "Asset"}
                    </p>
                    {item.vendor?.shop_name && (
                      <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mt-1">
                        Node: {item.vendor.shop_name}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                       <p className="text-sm font-black text-foreground">₹{(item.price_at_time || 0).toLocaleString("en-IN")}</p>
                       <div className="w-1 h-1 rounded-full bg-border" />
                       <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest">QTY: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 bg-background border-t border-border space-y-2">
              <div className="flex items-start gap-3">
                 <Target className="w-5 h-5 text-primary shrink-0" />
                 <div>
                    <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1">Destination Node</p>
                    <p className="text-sm text-foreground font-medium leading-relaxed max-w-md">{order.shipping_address}</p>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TrackOrdersPage() {
  const { user, isAuthenticated, setShowAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const result = await ordersApi.getUserOrders(user.id);
        setOrders(result || []);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError("Unable to sync protocol history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <AuthModal />
      <CartDrawer />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 pb-24">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
           <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Package className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black text-foreground tracking-tight flex items-center gap-2">
                 Command <span className="text-primary">Log</span>
              </h1>
              <p className="text-foreground/50 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                 <ShieldCheck className="w-3 h-3 text-success" /> Secure Asset Tracking
              </p>
            </div>
          </div>
        </div>

        {!isAuthenticated ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-sm border border-border"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-black text-foreground mb-3">
              Authentication Required
            </h2>
            <p className="text-foreground/60 mb-8 max-w-md">Please sync your identity to access your command log and track incoming provisions.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary py-4 px-10 text-sm"
            >
              Initialize Identity Sync
            </button>
          </motion.div>
        ) : loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-[200px] rounded-3xl animate-pulse border border-border" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-destructive/20 bg-destructive/5">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground">{error}</h2>
          </div>
        ) : orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 flex flex-col items-center text-center shadow-sm border border-dashed border-border"
          >
            <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mb-6 border border-border">
              <ShoppingBag className="w-10 h-10 text-foreground/20" />
            </div>
            <h2 className="text-2xl font-display font-black text-foreground mb-2">No active protocols</h2>
            <p className="text-foreground/50 mb-8 max-w-md text-sm">Your command log is empty. Initialize a new provisioning protocol to see it here.</p>
            <Link
              to="/products"
              className="btn-primary py-4 px-10 text-sm"
            >
              Access Global Market
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
