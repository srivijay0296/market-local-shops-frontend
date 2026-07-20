import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, Package, ListOrdered, DollarSign, Save, Hash, Database, Loader2 } from "lucide-react";
import { FormInput } from "@/components/admin/FormInput";
import ImageUpload from "@/components/ImageUpload";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopsApi } from "@/lib/api/shops";
import { categoriesApi } from "@/lib/api/categories";
import { productsApi } from "@/lib/api/products";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Product name is required (min 2 chars)."),
  description: z.string().optional(),
  price: z.coerce.number().positive("Valid price required (must be > 0)."),
  category: z.string().optional(),
  shop_id: z.string().min(1, "Please select a valid shop."),
  stock: z.coerce.number().min(0, "Stock cannot be negative."),
  images: z.array(z.string()).default([]),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProduct() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories().catch(() => []),
  });

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const data = await shopsApi.getShops();
      return (data || []).filter((s: any) => 
        s.id && 
        s.id !== "11111111-1111-1111-1111-111111111111" && 
        s.id !== "demo-shop" && 
        s.id !== "test-shop" &&
        (/^\d+$/i.test(String(s.id)) || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s.id)))
      );
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0, category: "", shop_id: "", stock: 1, images: [] }
  });

  const createProductMutation = useMutation({
    mutationFn: (payload: any) => productsApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Inventory Updated!");
      navigate("/admin/products");
    },
    onError: (err: any) => toast.error(err.message || "Failed to list item.")
  });

  const onSubmit = (data: ProductFormValues) => {
    const payload: any = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: data.price,
      shop_id: data.shop_id,
      stock: data.stock,
      category: data.category?.trim() || null,
    };

    if (data.images.length > 0) {
      payload.image_url = data.images[0];
      payload.images = data.images;
    }

    createProductMutation.mutate(payload);
  };

  const loading = createProductMutation.isPending;
  const currentShopId = watch("shop_id");
  const isShopIdValid = !!currentShopId;

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

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-50"></div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Gallery Upload (Max 5)</label>
            <ImageUpload 
              maxImages={5} 
              onUpload={(urls) => setValue("images", urls)} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <FormInput 
                 label="Product Identity" icon={Package} disabled={loading}
                 {...register("name")}
              />
              {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.name.message}</p>}
            </div>
            <div>
              <FormInput 
                 label="Market Value (₹)" type="number" icon={DollarSign} disabled={loading}
                 {...register("price")}
              />
              {errors.price && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.price.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="transition-opacity duration-500">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 flex items-center gap-1.5">
                  <ListOrdered className="w-3 h-3 text-indigo-600" /> Global Classification
               </label>
               <select
                 disabled={loading}
                 {...register("category")}
                 className="w-full p-6 bg-slate-50 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black appearance-none shadow-sm cursor-pointer"
               >
                 <option value="">-- NO CATEGORY --</option>
                 {categories.map((c: any) => ( <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option> ))}
               </select>
            </div>
            <div>
              <FormInput 
                 label="Current Stock" type="number" icon={Hash} disabled={loading}
                 {...register("stock")}
              />
              {errors.stock && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Narrative Description</label>
            <textarea
              placeholder="System details..."
              disabled={loading}
              rows={4}
              {...register("description")}
              className="w-full p-6 bg-slate-50 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold shadow-inner"
            />
            {errors.description && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Vendor Hub Association</label>
            <select
              disabled={loading}
              {...register("shop_id")}
              className="w-full p-6 bg-slate-50 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black appearance-none shadow-sm cursor-pointer"
            >
              <option value="">-- SELECT HUB --</option>
              {shops.map((s: any) => ( <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option> ))}
            </select>
            {errors.shop_id && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.shop_id.message}</p>}
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
