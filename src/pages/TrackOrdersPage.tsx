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
} from "lucide-react";

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
    label: "Order Placed",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Clock className="w-4 h-4" />,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Package className="w-4 h-4" />,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: <Truck className="w-4 h-4" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
  },
};

const STEPS = ["pending", "processing", "shipped", "delivered"];

function OrderProgress({ status }: { status: string }) {
  const currentStep = STEPS.indexOf(status);
  if (status === "cancelled") return null;

  return (
    <div className="flex items-center gap-0 mt-4 mb-2 max-w-sm">
      {STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all
                ${done ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400"}
                ${active ? "ring-2 ring-blue-100 scale-110" : ""}`}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-0.5 rounded transition-all ${
                  i < currentStep ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
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
    <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden transform transition hover:shadow-md">
      {/* Order Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-4">
           <div className="hidden sm:flex w-12 h-12 bg-gray-50 rounded items-center justify-center">
             <Package className="w-6 h-6 text-gray-300" />
           </div>
           <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order ID</p>
            <p className="font-mono text-sm font-bold text-gray-800">
              #{order.id.slice(0, 12).toUpperCase()}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{date}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</p>
            <p className="text-lg font-black text-gray-900">
              ₹{totalPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${statusCfg.color}`}
          >
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-b border-gray-50">
         <div>
            <OrderProgress status={order.status} />
            <div className="flex justify-between mt-1 max-w-sm">
              {STEPS.map((s) => (
                <span key={s} className={`text-[9px] font-bold uppercase ${s === order.status ? 'text-blue-600' : 'text-gray-400'}`}>
                  {STATUS_CONFIG[s].label.split(' ')[0]}
                </span>
                ))}
            </div>
         </div>
         <button 
           onClick={handleDownloadInvoice}
           className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
         >
           <Download className="w-3.5 h-3.5" />
           Invoice
         </button>
      </div>

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs text-blue-600 font-bold hover:bg-blue-50 transition border-t border-gray-50"
      >
        <span>{expanded ? "HIDE ITEMS" : "VIEW ITEMS"}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Order Items */}
      {expanded && order.items && order.items.length > 0 && (
        <div className="border-t border-gray-100 divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2">
          {order.items.map((item) => (
            <div key={item.id} className="px-5 py-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded border border-gray-100 flex items-center justify-center overflow-hidden">
                {item.product?.images?.[0] ? (
                  <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-gray-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate uppercase tracking-tight">
                  {item.product?.name || "Product"}
                </p>
                {item.vendor?.shop_name && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    by {item.vendor.shop_name}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                   <p className="text-xs font-bold text-blue-600">₹{(item.price_at_time || 0).toLocaleString("en-IN")}</p>
                   <p className="text-[10px] text-gray-400 font-bold">QTY: {item.quantity}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="px-5 py-4 bg-gray-50/50 space-y-2">
            <div className="flex items-start gap-2">
               <Truck className="w-4 h-4 text-gray-400 mt-0.5" />
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery Address</p>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{order.shipping_address}</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
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
        setError("Unable to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#F1F3F6] font-sans">
      <Header />
      <AuthModal />
      <CartDrawer />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pb-20">
        <div className="mb-8 flex items-center justify-between">
           <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#2874f0] rounded flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">My Orders</h1>
              <p className="text-gray-500 text-xs font-bold border-l-2 border-orange-500 pl-2">Track & Manage Purchases</p>
            </div>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white rounded p-12 flex flex-col items-center text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
              <LogIn className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Please sign in to view orders
            </h2>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-3 bg-[#2874f0] text-white font-bold rounded hover:bg-blue-700 transition shadow-md uppercase tracking-wider text-sm"
            >
              Sign In
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-32 rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded p-12 text-center shadow-sm">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800">{error}</h2>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded p-16 flex flex-col items-center text-center shadow-sm">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-5">
              <ShoppingBag className="w-10 h-10 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders found</h2>
            <Link
              to="/products"
              className="px-8 py-3 bg-[#fb641b] text-white font-bold rounded hover:bg-orange-600 transition shadow-md uppercase tracking-wider text-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
