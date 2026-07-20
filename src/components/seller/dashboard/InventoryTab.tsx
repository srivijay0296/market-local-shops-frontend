import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Trash2, Clock, Settings, IndianRupee, Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { formatPrice } from "@/lib/constants";

interface InventoryTabProps {
  products: any[];
  showAddProduct: boolean;
  setShowAddProduct: (val: boolean) => void;
  newProduct: {
    name: string;
    price: string;
    description: string;
    category: string;
    images: string[];
    show_price: boolean;
  };
  setNewProduct: (val: any) => void;
  handleCreateProduct: (e: React.FormEvent) => void;
  handleDeleteProduct: (id: string) => void;
  saving: boolean;
}

export const InventoryTab = React.memo(function InventoryTab({
  products,
  showAddProduct,
  setShowAddProduct,
  newProduct,
  setNewProduct,
  handleCreateProduct,
  handleDeleteProduct,
  saving
}: InventoryTabProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-6 border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-display font-black text-foreground">Inventory Management</h2>
          <p className="text-xs font-medium text-foreground/50 mt-1">Manage and provision new assets to your storefront</p>
        </div>
        <button 
          onClick={() => setShowAddProduct(!showAddProduct)} 
          className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-md ${showAddProduct ? 'bg-background text-foreground border border-border' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
        >
          {showAddProduct ? <Settings className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddProduct ? "Close Form" : "Add New Product"}
        </button>
      </div>

      {/* ADD PRODUCT FORM */}
      <AnimatePresence>
        {showAddProduct && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateProduct} 
            className="bg-card p-8 md:p-10 rounded-[28px] border border-border shadow-glass space-y-6 overflow-hidden"
          >
            <div className="flex items-center gap-3 text-foreground pb-4 border-b border-border/60">
              <div className="p-2.5 bg-primary/10 text-accent rounded-xl"><Plus className="w-5 h-5" /></div>
              <h3 className="text-lg font-display font-black uppercase tracking-tight">Create New Listing</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Product Name</label>
                  <input 
                    required value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="e.g. Premium Silk Saree" 
                    className="w-full bg-background border border-border/80 focus:border-primary/50 p-4 rounded-xl outline-none transition-colors font-medium text-sm text-foreground placeholder:text-foreground/30" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Price (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input 
                        type="number" value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="0.00" 
                        className="w-full bg-background border border-border/80 focus:border-primary/50 py-4 pl-12 pr-4 rounded-xl outline-none transition-colors font-medium text-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Category</label>
                    <select 
                      value={newProduct.category} required
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full bg-background border border-border/80 focus:border-primary/50 p-4 rounded-xl outline-none transition-colors font-medium text-sm text-foreground"
                    >
                      <option value="">Select Category</option>
                      <option value="Sarees">Sarees / Textiles</option>
                      <option value="Cotton">Cotton / Fabrics</option>
                      <option value="Silk">Silk Collections</option>
                      <option value="Handicrafts">Handicrafts</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-background/50 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">Price Visibility</p>
                    <p className="text-[10px] font-medium text-foreground/50 mt-0.5">If disabled, product shows as "Enquiry Only"</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setNewProduct({...newProduct, show_price: !newProduct.show_price})}
                    className="transition-transform active:scale-90 focus:outline-none"
                  >
                    {newProduct.show_price ? (
                      <span className="text-accent text-xs font-bold uppercase">Visible</span>
                    ) : (
                      <span className="text-foreground/40 text-xs font-bold uppercase">Enquiry</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Images (Up to 5)</label>
                  <div className="bg-background rounded-xl border border-dashed border-border p-4">
                    <ImageUpload maxImages={5} onUpload={(urls) => setNewProduct(prev => ({ ...prev, images: urls }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Description</label>
                  <textarea 
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Describe the product details, materials, and benefits..."
                    className="w-full bg-background border border-border/80 focus:border-primary/50 p-4 rounded-xl outline-none transition-colors font-medium text-sm h-28 resize-none" 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/60">
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3.5 disabled:opacity-50 text-xs">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Publish Listing"}
              </button>
              <button type="button" onClick={() => setShowAddProduct(false)} className="px-10 py-3.5 bg-background text-foreground/70 border border-border font-bold rounded-xl hover:bg-border/40 transition-colors uppercase text-xs tracking-wider">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
        {products.map(p => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={p.id} 
            className="bg-card rounded-[22px] border border-border shadow-glass flex flex-col overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative"
          >
            <div className="aspect-[4/5] bg-background flex items-center justify-center relative overflow-hidden">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : <Package className="w-10 h-10 text-foreground/20" />}
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-2">
                <button onClick={() => handleDeleteProduct(p.id)} title="Delete Product" className="p-2 bg-card text-red-500 rounded-xl shadow-md border border-border/60 hover:bg-red-500 hover:text-white transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {!p.is_approved && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-3">
                  <div className="text-center bg-card p-2.5 rounded-xl border border-border shadow-sm">
                    <Clock className="w-4 h-4 text-accent mx-auto mb-1" />
                    <span className="text-[9px] font-bold text-foreground/75 uppercase tracking-wider">Pending Review</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <h4 className="font-bold text-foreground text-xs line-clamp-2 leading-snug">{p.name}</h4>
              <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">{p.category}</span>
                <span className="text-accent font-black text-xs">{p.show_price ? formatPrice(p.price) : 'Enquiry'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && !showAddProduct && (
        <div className="py-24 bg-card rounded-[28px] border border-border shadow-glass text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-background rounded-full border border-border/60 flex items-center justify-center mb-6">
            <Package className="w-8 h-8 text-foreground/30" />
          </div>
          <h3 className="text-lg font-display font-black text-foreground">Your Inventory is Empty</h3>
          <p className="text-xs text-foreground/50 font-medium mt-2 max-w-sm px-4">Start provisioning products to reach thousands of potential buyers on the network.</p>
          <button 
            onClick={() => setShowAddProduct(true)}
            className="mt-6 btn-primary py-3 text-xs"
          >
            Create First Listing
          </button>
        </div>
      )}
    </div>
  );
});
