import React, { useState, useEffect } from "react";
import { ordersApi } from "@/lib/api/orders";
import { toast } from "sonner";
import { Search, ShoppingCart, Clock, CheckCircle2, XCircle, Package, ChevronDown, ChevronUp, MapPin, Phone, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAllOrders();
      setOrders(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    const newStatus = e.target.value;
    try {
      await ordersApi.updateStatus(id, newStatus);
      toast.success(`Order marked as ${newStatus}.`);
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Global Order Fulfillment</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor all platform transactions and update fulfillment status.</p>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID or Customer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading global transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 border-b border-slate-200">Order & Date</th>
                  <th className="p-4 border-b border-slate-200">Customer Details</th>
                  <th className="p-4 border-b border-slate-200 text-right">Items</th>
                  <th className="p-4 border-b border-slate-200 text-right">Total</th>
                  <th className="p-4 border-b border-slate-200 text-center">Status</th>
                  <th className="p-4 border-b border-slate-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => (
                  <React.Fragment key={o.id}>
                    <tr className={`hover:bg-slate-50/50 transition-colors ${expandedOrders.includes(o.id) ? 'bg-slate-50/30' : ''}`}>
                      <td className="p-4">
                        <button onClick={() => toggleExpand(o.id)} className="flex items-center gap-3 text-left group">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expandedOrders.includes(o.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                            {expandedOrders.includes(o.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-mono font-bold text-slate-800 text-xs tracking-tight">#{o.id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {new Date(o.created_at).toLocaleDateString()}</p>
                          </div>
                        </button>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{o.customer_name || o.profiles?.name || 'Guest'}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{o.customer_email || o.profiles?.email || 'No Email'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-black text-slate-600 border border-slate-200">
                          {o.order_items?.length || 0}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-black text-slate-900 text-sm">₹{Number(o.total_amount).toLocaleString()}</p>
                      </td>
                      <td className="p-4 text-center">
                        {o.status === 'completed' || o.status === 'delivered' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 border border-green-200 uppercase">
                            Delivered
                          </span>
                        ) : o.status === 'processing' || o.status === 'shipped' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200 uppercase">
                            Active
                          </span>
                        ) : o.status === 'cancelled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200 uppercase">
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 uppercase">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateStatus(e, o.id)}
                          className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition shadow-sm uppercase tracking-tighter"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                    
                    {/* Expanded Content */}
                    {expandedOrders.includes(o.id) && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="p-0 border-b border-slate-200">
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Items List */}
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Package className="w-3.5 h-3.5" /> Ordered Products
                              </h4>
                              <div className="space-y-2">
                                {o.order_items?.map((item: any) => (
                                  <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                      {item.product?.images?.[0] ? 
                                        <img src={item.product.images[0]} className="w-full h-full object-cover" alt="" /> :
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingCart className="w-5 h-5" /></div>
                                      }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-slate-800 truncate uppercase">{item.product?.name || 'Unknown Product'}</p>
                                      <p className="text-[10px] text-slate-500 font-bold">QTY: {item.quantity} × ₹{item.price_at_time}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-black text-slate-900">₹{(item.quantity * item.price_at_time).toLocaleString()}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                  <MapPin className="w-3.5 h-3.5" /> Shipping Address
                                </h4>
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                  <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-800">{o.customer_name || o.profiles?.name}</p>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{o.shipping_address}</p>
                                  </div>
                                  <div className="pt-3 border-t border-slate-50 space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                      <Phone className="w-3 h-3" /> {o.customer_phone || 'No phone provided'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                      <Mail className="w-3 h-3" /> {o.customer_email || o.profiles?.email}
                                    </div>
                                  </div>
                                </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                           <Search className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching orders found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
