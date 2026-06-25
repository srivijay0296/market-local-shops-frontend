import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { shopsApi } from "@/lib/api/shops";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { toast } from "sonner";
import { ChevronLeft, Package, Building, ListOrdered, DollarSign, Save, RefreshCw } from "lucide-react";
import { FormInput } from "@/components/admin/FormInput";
import ImageUpload from "@/components/ImageUpload";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [shops, setShops] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    shop_id: "",
    images: [] as string[]
  });

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isShopIdValid = !!(form.shop_id && uuidRegex.test(form.shop_id) && form.shop_id !== "11111111-1111-1111-1111-111111111111" && form.shop_id !== "demo-shop" && form.shop_id !== "test-shop");

  useEffect(() => {
    fetchShops();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getCategories();
      if (data) setCategories(data);
    } catch (err) {
      console.error("Fetch Categories Error", err);
    }
  };

  const fetchShops = async () => {
    try {
      const data = await shopsApi.getShops();
      if (data) {
        // Filter out any mock/placeholder shops
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
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setFetching(true);
      try {
        const data = await productsApi.getProductById(id);
        if (data) {
          setForm({
            ...data,
            category: data.category_id || "",
            price: data.price?.toString() || ""
          });
        }
      } catch (err: any) {
        toast.error(`Fetch failed: ${err.message}`);
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);

    try {
      const sanitizedShopId = form.shop_id?.trim();
      if (!sanitizedShopId) {
        throw new Error("Please select a shop");
      }

      const placeholderShopIds = ["11111111-1111-1111-1111-111111111111", "demo-shop", "test-shop", ""];
      if (placeholderShopIds.includes(sanitizedShopId)) {
        throw new Error("Please select a valid, non-placeholder shop.");
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(sanitizedShopId)) {
        throw new Error("Invalid format for shop_id. Expected a valid UUID.");
      }

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category?.trim() || null,
        shop_id: sanitizedShopId,
        images: form.images,
      };

      console.log("Update Product Payload:", payload);
      await productsApi.updateProduct(id, payload);

      console.debug("DEBUG: Updated Product Payload", { id, shop_id: sanitizedShopId });

      toast.success("Product configurations updated!");
      navigate("/admin/products");
    } catch (err: any) {
      console.error("DEBUG: Product Update Error", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse gap-4 text-slate-400">
         <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
         <p className="font-bold tracking-widest text-sm uppercase">Retrieving Product Data...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-500">
      
      <div className="flex items-center gap-4 py-4">
        <Link 
          to="/admin/products" 
          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition text-slate-500 hover:text-amber-500"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Edit Product Catalog</h1>
          <p className="text-slate-500 font-medium mt-1">Reviewing product configuration for ID: {id}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
        
        <form onSubmit={handleUpdate} className="flex flex-col gap-6 relative z-10 w-full">
          
          <div className="space-y-4 mb-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Gallery Update (Max 5)</label>
            <ImageUpload 
              existingImages={form.images || []}
              onUpload={(urls) => setForm({ ...form, images: urls })} 
            />
          </div>

          <FormInput 
             label="Product Name"
             icon={Package} iconColor="text-amber-500" focusColor="amber"
             placeholder="Product Name" required disabled={loading}
             value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
               label="Price (₹)"
               icon={DollarSign} iconColor="text-green-600" focusColor="amber"
               type="number" placeholder="0.00" required disabled={loading}
               value={form.price} onChange={e => setForm({...form, price: e.target.value})}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-purple-500" /> Category
              </label>
              <select
                value={form.category || ""}
                disabled={loading}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-slate-800 font-bold font-sans cursor-pointer"
              >
                <option value="">-- No Category Assigned --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
                <Building className="w-4 h-4 text-rose-500" /> Member Shop Association
              </label>
              <select
                value={form.shop_id || ""}
                disabled={loading}
                onChange={(e) => setForm({ ...form, shop_id: e.target.value })}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-slate-800 font-bold font-sans"
              >
                <option value="">-- No Shop Assigned --</option>
                {shops.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-end gap-3 mt-2">
            <Link to="/admin/products" className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition active:scale-[0.98]">
              Cancel
            </Link>
            <button type="submit" disabled={loading || !isShopIdValid} className="px-8 py-3.5 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition active:scale-[0.98] inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Updating..." : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
