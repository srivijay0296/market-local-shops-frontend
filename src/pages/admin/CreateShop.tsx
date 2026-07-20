import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getMarkets, createShop } from "@/services/api";
import { toast } from "sonner";
import { ChevronLeft, Store, Tag, Map, User, Save, Info, MapPin, Phone, Loader2 } from "lucide-react";
import { FormInput } from "@/components/admin/FormInput";
import ImageUpload from "@/components/ImageUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const shopSchema = z.object({
  name: z.string().min(3, "Shop name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.string().min(2, "Category is required."),
  status: z.enum(["approved", "pending"]),
  vendor_id: z.string().refine(val => isUUID(val), { message: "Invalid Vendor UUID format." }),
  market_id: z.string().optional(),
  location: z.string().min(5, "Location must be at least 5 characters."),
  phone: z.string().min(10, "Valid phone number required."),
  image_url: z.string().optional(),
});

type ShopFormValues = z.infer<typeof shopSchema>;

export default function CreateShop() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialMarketId = searchParams.get("market_id") || "";

  const { data: markets = [] } = useQuery({
    queryKey: ['markets'],
    queryFn: () => getMarkets().catch(() => []),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: "", description: "", category: "", status: "approved",
      vendor_id: currentUser?.id || "", market_id: initialMarketId,
      location: "", phone: "", image_url: "",
    }
  });

  const createShopMutation = useMutation({
    mutationFn: (payload: any) => createShop(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success("Shop registered successfully!");
      navigate("/admin/shops");
    },
    onError: (err: any) => toast.error(`Database Error: ${err.message}`)
  });

  const onSubmit = (data: ShopFormValues) => {
    createShopMutation.mutate({
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      is_approved: data.status === "approved",
      owner_id: data.vendor_id || null,
      market_id: data.market_id || null,
      image_url: data.image_url,
      location: data.location.trim(),
      phone: data.phone.trim()
    });
  };

  const loading = createShopMutation.isPending;
  const currentImageUrl = watch("image_url");

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-500">
      
      <div className="flex items-center gap-4 py-4">
        <Link 
          to="/admin/shops" 
          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition text-slate-500"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Establish Outlet</h1>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 relative z-10 w-full">
          
          <div className="space-y-2 mb-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Boutique Profile Identity</label>
             <ImageUpload 
                single={true}
                bucket="shops"
                folder="profiles"
                onUpload={(urls) => setValue("image_url", urls[0] || "")}
             />
          </div>
          
          <div>
            <FormInput 
               label="Boutique / Shop Name"
               icon={Store} iconColor="text-purple-500" focusColor="purple"
               placeholder="Bargur Silk Hub" disabled={loading}
               {...register("name")}
            />
            {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2 w-full">
            <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" /> Short Description
            </label>
            <textarea
              placeholder="Provide context about what this shop sells..." 
              disabled={loading} rows={3}
              {...register("description")}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-slate-800 font-medium font-sans placeholder:text-slate-400"
            />
            {errors.description && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormInput 
                 label="Category"
                 icon={Tag} iconColor="text-pink-500" focusColor="purple"
                 placeholder="Sarees, Textiles..." disabled={loading}
                 {...register("category")}
              />
              {errors.category && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.category.message}</p>}
            </div>
            
            <div>
              <FormInput 
                 label="Vendor ID"
                 icon={User} iconColor="text-blue-500" focusColor="purple"
                 placeholder="UUID of the Seller" disabled={loading}
                 {...register("vendor_id")}
              />
              {errors.vendor_id && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.vendor_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
                 <Map className="w-4 h-4 text-green-500" /> Market Association
               </label>
               <select
                 disabled={loading}
                 {...register("market_id")}
                 className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-slate-800 font-bold font-sans"
               >
                 <option value="">-- No Market Selected --</option>
                 {markets.map((m: any) => (
                   <option key={m.id} value={m.id}>{m.name}</option>
                 ))}
               </select>
               <p className="text-[10px] uppercase font-black text-slate-400 ml-2 tracking-widest leading-none">Connect this shop to a specific bazaar zone</p>
            </div>

            <div>
              <FormInput 
                 label="Contact Phone"
                 icon={Phone} iconColor="text-blue-600" focusColor="purple"
                 placeholder="+91 XXXXX XXXXX" disabled={loading}
                 {...register("phone")}
              />
              {errors.phone && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
             <div>
               <FormInput 
                 label="Shop Address / Location"
                 icon={MapPin} iconColor="text-rose-600" focusColor="purple"
                 placeholder="123 Textile St, Bargur" disabled={loading}
                 {...register("location")}
              />
              {errors.location && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.location.message}</p>}
             </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center">
                Launch Status
              </label>
              <select
                disabled={loading}
                {...register("status")}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-slate-800 font-bold font-sans uppercase tracking-wider"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-end gap-3 mt-2">
            <Link to="/admin/shops" className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition active:scale-[0.98]">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="px-8 py-3.5 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition active:scale-[0.98] inline-flex items-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Registering...</> : <><Save className="w-5 h-5" /> Open Outlet</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
