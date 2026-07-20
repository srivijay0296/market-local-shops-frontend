import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import { Minus, Plus, ShoppingBag, ArrowLeft, ShieldCheck, Trash2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <AuthModal />
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-4 py-24 pt-32 pb-32">
        
        <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tight flex items-center gap-3">
               Asset <span className="text-primary">Manifest</span>
            </h1>
            <p className="text-foreground/50 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-success" /> Secure Provisioning Pipeline
            </p>
        </div>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-border shadow-sm p-16 flex flex-col items-center text-center relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             
             <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mb-6 relative z-10 border border-border">
                <ShoppingBag className="w-10 h-10 text-foreground/20" />
             </div>
             <h2 className="text-2xl font-display font-black text-foreground mb-3 relative z-10">Your manifest is empty</h2>
             <p className="text-sm font-medium text-foreground/50 mb-8 max-w-md relative z-10">Select assets from the global marketplace to initialize a new provisioning protocol.</p>
             <Link to="/products" className="btn-primary py-4 px-10 text-sm relative z-10">
                Access Global Market
             </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Left: Cart Items */}
            <div className="lg:w-[65%] space-y-6">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden"
               >
                  <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-background">
                     <h2 className="text-xl font-display font-black text-foreground">Selected Assets ({totalItems})</h2>
                  </div>

                  <div className="divide-y divide-border">
                     <AnimatePresence>
                       {cart.map((item, i) => (
                         <motion.div 
                           key={item.product_id + (item.variant_id || '')}
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="p-8 flex flex-col sm:flex-row gap-8 hover:bg-background/50 transition-colors"
                         >
                            <div className="w-28 h-28 shrink-0 mx-auto sm:mx-0 bg-background rounded-2xl border border-border overflow-hidden">
                               <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 space-y-2 text-center sm:text-left flex flex-col justify-center">
                               <h3 className="text-lg font-bold text-foreground line-clamp-2 hover:text-primary transition-colors cursor-pointer leading-tight">{item.name}</h3>
                               <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest flex items-center gap-1 justify-center sm:justify-start">
                                  <Package className="w-3 h-3" /> Node: {item.vendor || 'Core Network'}
                               </p>
                               <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
                                  <span className="text-foreground/40 line-through text-sm font-medium">{formatPrice(item.price * 1.5)}</span>
                                  <span className="text-xl font-black text-foreground">{formatPrice(item.price)}</span>
                                  <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">33% Discount Applied</span>
                               </div>
                               
                               <div className="flex items-center justify-center sm:justify-start gap-6 pt-6">
                                  <div className="flex items-center bg-background rounded-xl border border-border p-1">
                                     <button 
                                       onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                                       className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-foreground/70 hover:text-foreground disabled:opacity-50 transition-colors shadow-sm"
                                       disabled={item.quantity <= 1}
                                     >
                                        <Minus className="w-3 h-3" />
                                     </button>
                                     <input 
                                       type="text" 
                                       value={item.quantity} 
                                       readOnly 
                                       className="w-12 text-center text-sm font-bold bg-transparent outline-none text-foreground" 
                                     />
                                     <button 
                                       onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                                       className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-foreground/70 hover:text-foreground transition-colors shadow-sm"
                                     >
                                        <Plus className="w-3 h-3" />
                                     </button>
                                  </div>
                                  <button 
                                    onClick={() => removeFromCart(item.product_id, item.variant_id)}
                                    className="text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-destructive transition-colors flex items-center gap-1.5"
                                  >
                                     <Trash2 className="w-4 h-4" /> Remove
                                  </button>
                               </div>
                            </div>
                            <div className="text-center sm:text-right flex flex-col justify-center sm:justify-start gap-2">
                               <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest border border-border rounded-md px-3 py-1.5 inline-block mx-auto sm:ml-auto sm:mr-0">Express Routing</p>
                               <p className="text-xs text-success font-bold mt-1">Complimentary Transit</p>
                            </div>
                         </motion.div>
                       ))}
                     </AnimatePresence>
                  </div>
               </motion.div>

               <div className="flex justify-between items-center px-4">
                  <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/50 hover:text-primary transition-colors uppercase tracking-widest">
                     <ArrowLeft className="w-4 h-4" /> Global Market
                  </Link>
               </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:w-[35%]">
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-white rounded-3xl shadow-glass border border-border sticky top-32 overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  <div className="px-8 py-6 border-b border-border bg-background relative z-10">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-primary" /> Authorization Summary
                     </h3>
                  </div>
                  
                  <div className="p-8 space-y-5 relative z-10">
                     <div className="flex justify-between text-sm font-medium">
                        <span className="text-foreground/70">Subtotal ({totalItems} assets)</span>
                        <span className="text-foreground line-through opacity-70">{formatPrice(cartTotal * 1.5)}</span>
                     </div>
                     <div className="flex justify-between text-sm font-medium">
                        <span className="text-foreground/70">Network Discount</span>
                        <span className="text-success font-bold">- {formatPrice(cartTotal * 0.5)}</span>
                     </div>
                     <div className="flex justify-between text-sm font-medium">
                        <span className="text-foreground/70">Routing Fee</span>
                        <span className="text-success font-bold bg-success/10 px-2 py-0.5 rounded uppercase text-[10px] tracking-widest">Complimentary</span>
                     </div>
                     
                     <div className="border-t border-border pt-6 mt-6 flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">Total Required</span>
                        <span className="text-3xl font-display font-black text-primary">{formatPrice(cartTotal)}</span>
                     </div>
                     
                     <div className="bg-success/5 border border-success/10 rounded-xl p-3 text-center mt-4">
                        <p className="text-success font-bold text-xs">Total Savings: {formatPrice(cartTotal * 0.5)}</p>
                     </div>

                     <div className="pt-6">
                        <Link 
                          to="/checkout"
                          className="w-full btn-primary py-5 text-sm flex items-center justify-center gap-2"
                        >
                           Initialize Provisioning <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                     </div>
                  </div>
                  
                  <div className="p-6 bg-background/50 flex items-start gap-4 border-t border-border relative z-10">
                     <ShieldCheck className="w-8 h-8 text-success shrink-0" />
                     <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest leading-relaxed">
                        256-bit encrypted transaction. <br/>Asset authenticity guaranteed by network consensus.
                     </p>
                  </div>
               </motion.div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
