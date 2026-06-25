import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { shopsApi } from "@/lib/api/shops";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, Package, Building, ListOrdered, DollarSign, Save, FileText, Hash, Image as ImageIcon, Database } from "lucide-react";
import { FormInput } from "@/components/admin/FormInput";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/lib/supabase";

export default function CreateProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [hasCategoryColumn, setHasCategoryColumn] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    shop_id: "",
    stock: "1",
    images: [] as string[],
    category_id: ""
  });
  const [categories, setCategories] = useState<any[]>([]);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isShopIdValid = !!(form.shop_id && uuidRegex.test(form.shop_id) && form.shop_id !== "11111111-1111-1111-1111-111111111111" && form.shop_id !== "demo-shop" && form.shop_id !== "test-shop");

  useEffect(() => {
    fetchShops();
    fetchCategories();
    checkSchema();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getCategories();
      if (data) setCategories(data);
    } catch (err) {
      console.error("Fetch Categories Error", err);
    }
  };

  const checkSchema = async () => {
    // Proactive check for 'category_id' column to avoid 400 Bad Request
    const { error } = await supabase.from('products').select('category_id').limit(1);
    if (error && error.code === 'PGRST204') {
        console.warn("⚠️ 'category_id' column missing in products table. Neutralizing field.");
        setHasCategoryColumn(false);
    } else {
        setHasCategoryColumn(true);
    }
  };

  const fetchShops = async () => {
    try {
      const data = await shopsApi.getShops();
      if (data) {
        // Filter out any mock/placeholder shops that don't have valid UUID IDs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const validShops = data.filter((s: any) => 
          s.id && 
          uuidRegex.test(s.id) && 
          s.id !== "11111111-1111-1111-1111-111111111111" && 
          s.id !== "demo-shop" && 
          s.id !== "test-shop"
        );
        setShops(validShops);
      }
    } catch (err) {
      console.error("Fetch Shops Error", err);
      toast.error("Could not load shops. Please refresh.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.shop_id) {
        throw new Error("Please select a shop");
      }

      const placeholderShopIds = ["11111111-1111-1111-1111-111111111111", "demo-shop", "test-shop", ""];
      if (placeholderShopIds.includes(form.shop_id)) {
        throw new Error("Please select a valid, non-placeholder shop.");
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(form.shop_id)) {
        throw new Error("Invalid format for shop_id. Expected a valid UUID.");
      }

      if (!form.name.trim()) throw new Error("Product name is required.");
      if (!form.price || Number(form.price) <= 0) throw new Error("Valid price required.");

      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        shop_id: form.shop_id,
        stock: Number(form.stock) || 1,
      };

      // 🛡️ ONLY include category if the column actually exists in your DB
      if (hasCategoryColumn) {
          payload.category = form.category.trim() || null;
      }

      // Handle images (Standardize across columns)
      if (form.images.length > 0) {
          payload.image_url = form.images[0];
          payload.images = form.images; // Requirement 1: Full gallery support
      }

      console.log("Submit Product Payload:", payload);
      console.debug("DEBUG: Submitting Controlled Product Payload", payload);

      const data = await productsApi.createProduct(payload);
      
      toast.success("Inventory Updated!");
      navigate("/admin/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to list item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-4 md:p-10 animate-in fade-in duration-700">
      
      <div className="flex items-center gap-6">
        <Link to="/admin/products" className="p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Inventory Provisioning</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Ecosystem Asset Management</p>
        </div>
      </div>

      {!hasCategoryColumn && (
        <div className="bg-amber-50 border-2 border-dashed border-amber-200 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl shadow-amber-100/50 group hover:border-amber-500 transition-all">
           <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-200 animate-pulse">
              <Database className="w-6 h-6 text-white" />
           </div>
           <div>
              <p className="text-amber-800 font-black uppercase text-xs tracking-tighter">Schema Out-of-Sync Detected</p>
              <p className="text-amber-600 text-[10px] font-bold">The 'category' field is currently invisible to the database. Use 'Admin Hub' to Repair.</p>
           </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-50"></div>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Gallery Upload (Max 5)</label>
            <ImageUpload 
              maxImages={5} 
              onUpload={(urls) => setForm(prev => ({ ...prev, images: urls }))} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormInput 
               label="Product Identity" icon={Package} required disabled={loading}
               value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            />
            <FormInput 
               label="Market Value (₹)" type="number" icon={DollarSign} required disabled={loading}
               value={form.price} onChange={e => setForm({...form, price: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`transition-opacity duration-500 ${!hasCategoryColumn ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block flex items-center gap-1.5">
                  <ListOrdered className="w-3 h-3 text-indigo-600" /> Global Classification
               </label>
               <select
                 value={form.category}
                 disabled={loading || !hasCategoryColumn}
                 onChange={(e) => setForm({ ...form, category: e.target.value })}
                 className="w-full p-6 bg-slate-50 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black appearance-none shadow-sm cursor-pointer"
               >
                 <option value="">-- NO CATEGORY --</option>
                 {categories.map(c => ( <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option> ))}
               </select>
            </div>
            <FormInput 
               label="Current Stock" type="number" icon={Hash} disabled={loading}
               value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Narrative Description</label>
            <textarea
              placeholder="System details..."
              disabled={loading}
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={4}
              className="w-full p-6 bg-slate-50 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Vendor Hub Association</label>
            <select
              value={form.shop_id}
              disabled={loading}
              onChange={(e) => setForm({ ...form, shop_id: e.target.value })}
              className="w-full p-6 bg-slate-50 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black appearance-none shadow-sm cursor-pointer"
            >
              <option value="">-- SELECT HUB --</option>
              {shops.map(s => ( <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option> ))}
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
            <button type="submit" disabled={loading || !isShopIdValid} className="px-12 py-5 bg-indigo-600 text-white font-black rounded-[1.8rem] shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition active:scale-95 flex items-center gap-3 uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <><Save className="w-5 h-5" /> Execute Provisioning</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Loader2({className}:any) { return <Package className={className} />; }
