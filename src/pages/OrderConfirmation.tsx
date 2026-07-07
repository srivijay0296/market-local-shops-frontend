import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { backendApi } from '@/lib/api/client';
import { formatPrice } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import { CheckCircle, Package, Truck, MapPin, ArrowRight } from 'lucide-react';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const { data: orderData } = await backendApi.get(`/orders/${orderId}`);
        if (orderData) setOrder(orderData);

        const { data: itemsData } = await backendApi.get(`/orders/${orderId}/items`);
        if (itemsData) setItems(itemsData);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <AuthModal />
      <CartDrawer />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 mb-1">Thank you for shopping on Bargur Market Connect</p>
          {orderId && (
            <p className="text-sm text-gray-400">Order #{orderId.slice(0, 8).toUpperCase()}</p>
          )}

          {order && (
            <div className="mt-8 text-left">
              {/* Timeline */}
              <div className="flex items-center justify-between mb-8 px-4">
                {[
                  { icon: CheckCircle, label: 'Confirmed', active: true },
                  { icon: Package, label: 'Packed', active: false },
                  { icon: Truck, label: 'Shipped', active: false },
                  { icon: MapPin, label: 'Delivered', active: false },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium ${s.active ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div className="border rounded-xl overflow-hidden mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-sm">Order Items</h3>
                </div>
                {items.map(item => (
                  <div key={item.id} className="px-4 py-3 border-b last:border-0 flex justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.product_name}</p>
                      {item.variant_title && <p className="text-xs text-gray-500">{item.variant_title}</p>}
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border rounded-xl p-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Total Paid</span>
                  <span className="font-bold text-[#1E3A8A]">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="border rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-sm mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-600">
                    {order.shipping_address.name}<br />
                    {order.shipping_address.address}<br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}<br />
                    {order.shipping_address.country}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link to="/products" className="flex-1 py-3 bg-[#1E3A8A] text-white rounded-xl font-semibold text-center hover:bg-blue-800 transition flex items-center justify-center gap-2">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/" className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold text-center hover:bg-gray-200 transition">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
