import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/constants';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2a4f5f]" />
            <h2 className="text-lg font-bold">Your Cart ({cartCount})</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Browse markets and add products</p>
              <button onClick={() => setIsCartOpen(false)} className="mt-4 px-6 py-2.5 bg-[#2a4f5f] text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition">
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id + (item.variant_id || '')} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
                  {item.vendor && (
                    <p className="text-[10px] text-gray-400">{item.vendor}</p>
                  )}
                  <p className="font-bold text-[#2a4f5f] text-sm mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 bg-white rounded-lg border">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-100 rounded-l-lg transition">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-100 rounded-r-lg transition">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-lg font-bold text-[#2a4f5f]">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <Link
              to="/cart"
              onClick={() => setIsCartOpen(false)}
              className="block w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold text-center hover:bg-gray-200 transition text-sm"
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full py-3 bg-[#F97316] text-white rounded-xl font-semibold text-center hover:bg-orange-600 transition"
            >
              Checkout - {formatPrice(cartTotal)}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
