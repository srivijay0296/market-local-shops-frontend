import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { marketsApi } from "@/lib/api/markets";
import { shopsApi } from "@/lib/api/shops";
import { toast } from "sonner";
import { ChevronLeft, Store, Tag, Map, User, Save, Info, RefreshCw, MapPin, Phone } from "lucide-react";
import { FormInput } from "@/components/admin/FormInput";
import ImageUpload from "@/components/ImageUpload";

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export default function EditShop() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isValidShopId, setIsValidShopId] = useState(true);
  
  const [markets, setMarkets] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    status: "approved",
    vendor_id: "",
    market_id: "",
    location: "",
    phone: "",
    image_url: "",
  });

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const data = await marketsApi.getMarkets();
      if (data) setMarkets(data);
    } catch (err) {
      console.error("Fetch Markets Error", err);
    }
  };

  useEffect(() => {
    console.log("Shop ID:", id);

    if (!id || !isUUID(id) || id === "11111111-1111-1111-1111-111111111111") {
      setIsValidShopId(false);
      setFetching(false);
      toast.error("Shop not found");
      return;
    }

    const fetchShop = async () => {
      setFetching(true);
      try {
        const data = await shopsApi.getShopById(id);
        if (data) {
          setForm({
            ...data,
            market_id: data.market_id?.toString() || "",
            location: data.location || "",
            phone: data.phone || "",
            image_url: data.image_url || "",
            vendor_id: data.owner_id || data.vendor_name || "", 
          });
          setIsValidShopId(true);
        } else {
          setIsValidShopId(false);
          toast.error("Shop not found");
        }
      } catch (err: any) {
        setIsValidShopId(false);
        toast.error(`Fetch failed: ${err.message}`);
      } finally {
        setFetching(false);
      }
    };
    fetchShop();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !isValidShopId) {
      toast.error("Shop not found");
      return;
    }
    setLoading(true);

    try {
      const sanitizedVendorId = form.vendor_id?.trim() || "";
      const sanitizedMarketId = form.market_id?.trim() || null;

      const isVendorUUID = isUUID(sanitizedVendorId);

      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        owner_id: isVendorUUID ? sanitizedVendorId : null,
        market_id: sanitizedMarketId,
        image_url: form.image_url,
        phone: form.phone,
        location: form.location,
        is_approved: form.status === 'approved'
      };

      console.log("🏪 Nexus Shop Update Payload:", payload);

      await shopsApi.updateShop(id, payload);

      toast.success("Shop information updated!");
      navigate("/admin/shops");
    } catch (err: any) {
      console.error("DEBUG: Shop Update Error", err);
      toast.error(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse gap-4 text-slate-400">
         <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
         <p className="font-bold tracking-widest text-sm uppercase">Loading Boutique Data...</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Edit Outlet Data</h1>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
        <form onSubmit={handleUpdate} className="flex flex-col gap-6 relative z-10 w-full">
          
          <div className="space-y-2 mb-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Boutique Profile Identity</label>
             <ImageUpload 
                single={true}
                bucket="shops"
                folder="profiles"
                existingImages={form.image_url ? [form.image_url] : []}
                onUpload={(urls) => setForm({ ...form, image_url: urls[0] || "" })}
             />
          </div>
          
          <FormInput 
             label="Boutique / Shop Name"
             icon={Store} iconColor="text-purple-500" focusColor="amber"
             placeholder="Bargur Silk Hub" required disabled={loading}
             value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})}
          />
          
          <div className="space-y-2 w-full">
            <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" /> Short Description
            </label>
            <textarea
              placeholder="Provide context about what this shop sells..." 
              required disabled={loading} rows={3}
              value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-slate-800 font-medium font-sans placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
               label="Category"
               icon={Tag} iconColor="text-pink-500" focusColor="amber"
               placeholder="Sarees, Textiles..." required disabled={loading}
               value={form.category || ""} onChange={e => setForm({...form, category: e.target.value})}
            />
            
            <FormInput 
               label="Vendor ID"
               icon={User} iconColor="text-blue-500" focusColor="amber"
               placeholder="UUID of the Seller" disabled={loading} required
               value={form.vendor_id || ""} onChange={e => setForm({...form, vendor_id: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
                 <Map className="w-4 h-4 text-green-500" /> Market Association
               </label>
               <select
                 value={form.market_id || ""}
                 disabled={loading}
                 onChange={(e) => setForm({ ...form, market_id: e.target.value })}
                 className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-slate-800 font-bold font-sans"
               >
                 <option value="">-- No Market Selected --</option>
                 {markets.map(m => (
                   <option key={m.id} value={m.id}>{m.name}</option>
                 ))}
               </select>
               <p className="text-[10px] uppercase font-black text-slate-400 ml-2 tracking-widest leading-none">Connect this shop to a specific bazaar zone</p>
            </div>

            <FormInput 
               label="Contact Phone"
               icon={Phone} iconColor="text-blue-600" focusColor="amber"
               placeholder="+91 XXXXX XXXXX" disabled={loading}
               value={form.phone || ""} onChange={e => setForm({...form, phone: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
             <FormInput 
               label="Shop Address / Location"
               icon={MapPin} iconColor="text-rose-600" focusColor="amber"
               placeholder="123 Textile St, Bargur" disabled={loading}
               value={form.location || ""} onChange={e => setForm({...form, location: e.target.value})}
            />

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center">
                Launch Status
              </label>
              <select
                value={form.status || "approved"} disabled={loading}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-slate-800 font-bold font-sans uppercase tracking-wider"
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
            <button type="submit" disabled={loading || !isValidShopId} className="px-8 py-3.5 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition active:scale-[0.98] inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Revising..." : <><Save className="w-5 h-5" /> Commit Overrides</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
