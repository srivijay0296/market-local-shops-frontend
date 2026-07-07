import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import { Minus, Plus, ShoppingBag, ArrowLeft, ShieldCheck, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F1F3F6]">
      <Header />
      <AuthModal />
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-4 py-20 pt-32">
        {cart.length === 0 ? (
          <div className="bg-white rounded shadow-sm p-12 flex flex-col items-center text-center">
             <img src="https://rukminim1.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="Empty Cart" className="w-56 h-56 object-contain mb-6" />
             <h2 className="text-xl font-medium text-gray-800 mb-2">Your cart is empty!</h2>
             <p className="text-sm text-gray-500 mb-6">Add items to it now.</p>
             <Link to="/products" className="bg-[#2874f0] text-white px-12 py-3 rounded shadow-lg font-bold hover:shadow-xl transition">
                Shop Now
             </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Left: Cart Items */}
            <div className="lg:w-[65%] space-y-4">
               <div className="bg-white rounded shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b flex items-center justify-between">
                     <h1 className="text-lg font-bold text-gray-800">My Cart ({totalItems})</h1>
                     <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ShieldCheck className="w-4 h-4 text-green-600" /> 100% Safe Payments
                     </div>
                  </div>

                  <div className="divide-y">
                     {cart.map(item => (
                       <div key={item.product_id + (item.variant_id || '')} className="p-6 flex flex-col sm:flex-row gap-6">
                          <div className="w-24 h-24 shrink-0 mx-auto sm:mx-0">
                             <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 space-y-2 text-center sm:text-left">
                             <h3 className="text-base font-medium text-gray-800 line-clamp-2 hover:text-[#2874f0] transition cursor-pointer">{item.name}</h3>
                             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.vendor || 'BTM weaver'}</p>
                             <div className="flex items-center justify-center sm:justify-start gap-4">
                                <span className="text-gray-400 line-through text-sm">{formatPrice(item.price * 1.5)}</span>
                                <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                                <span className="text-green-700 text-xs font-bold">33% Off</span>
                             </div>
                             
                             <div className="flex items-center justify-center sm:justify-start gap-6 pt-4">
                                <div className="flex items-center border rounded">
                                   <button 
                                     onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                                     className="w-8 h-8 flex items-center justify-center border-r hover:bg-gray-50 disabled:opacity-50"
                                     disabled={item.quantity <= 1}
                                   >
                                      <Minus className="w-3 h-3" />
                                   </button>
                                   <input 
                                     type="text" 
                                     value={item.quantity} 
                                     readOnly 
                                     className="w-12 text-center text-sm font-bold outline-none" 
                                   />
                                   <button 
                                     onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                                     className="w-8 h-8 flex items-center justify-center border-l hover:bg-gray-50"
                                   >
                                      <Plus className="w-3 h-3" />
                                   </button>
                                </div>
                                <button 
                                  onClick={() => removeFromCart(item.product_id, item.variant_id)}
                                  className="text-sm font-bold uppercase tracking-tight text-gray-800 hover:text-red-500 transition flex items-center gap-1"
                                >
                                   <Trash2 className="w-4 h-4" /> Remove
                                </button>
                             </div>
                          </div>
                          <div className="text-center sm:text-right flex flex-col justify-between">
                             <p className="text-xs text-gray-400 mb-1">Delivery by Tomorrow</p>
                             <p className="text-xs text-green-700 font-bold">Free Shipping</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="px-6 py-4 bg-white border-t flex justify-end sticky bottom-0 shadow-inner">
                     <Link 
                       to="/checkout"
                       className="bg-[#fb641b] text-white px-12 py-3 rounded font-bold uppercase tracking-tight shadow-lg hover:bg-[#f4511e] transition"
                     >
                        Place Order
                     </Link>
                  </div>
               </div>

               <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-[#2874f0] hover:underline px-2">
                  <ArrowLeft className="w-4 h-4" /> Continue Shopping
               </Link>
            </div>

            {/* Right: Summary */}
            <div className="lg:w-[35%]">
               <div className="bg-white rounded shadow-sm sticky top-32">
                  <div className="px-6 py-4 border-b">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Price Details</h3>
                  </div>
                  <div className="p-6 space-y-4">
                     <div className="flex justify-between text-base">
                        <span className="text-gray-800">Price ({totalItems} items)</span>
                        <span>{formatPrice(cartTotal * 1.5)}</span>
                     </div>
                     <div className="flex justify-between text-base">
                        <span className="text-gray-800">Discount</span>
                        <span className="text-green-700">- {formatPrice(cartTotal * 0.5)}</span>
                     </div>
                     <div className="flex justify-between text-base">
                        <span className="text-gray-800">Delivery Charges</span>
                        <span className="text-green-700">FREE</span>
                     </div>
                     <div className="border-t border-dashed pt-4 flex justify-between text-lg font-bold text-gray-900">
                        <span>Total Amount</span>
                        <span>{formatPrice(cartTotal)}</span>
                     </div>
                     <div className="border-t border-dashed pt-4">
                        <p className="text-green-700 font-bold text-sm">You will save {formatPrice(cartTotal * 0.5)} on this order</p>
                     </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 flex items-center gap-3 border-t">
                     <ShieldCheck className="w-10 h-10 text-gray-400" />
                     <p className="text-[10px] text-gray-400 font-bold uppercase leading-tight">
                        Safe and Secure Payments. Easy returns. 100% Authentic products.
                     </p>
                  </div>
               </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
