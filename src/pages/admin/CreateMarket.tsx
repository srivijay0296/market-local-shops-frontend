import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, Store, MapPin, Tag, Save, Info, Loader2 } from "lucide-react";
import { useCreateMarket } from "@/lib/queryHooks";
import { MarketPayload } from "@/lib/api/markets";
import ImageUpload from "@/components/admin/ImageUpload";
import { FormInput } from "@/components/admin/FormInput";

export default function CreateMarket() {
  const navigate = useNavigate();
  const createMarket = useCreateMarket();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    location: "",
    description: "",
    image_url: "",
  });

  const handleNameChange = (val: string) => {
    const slug = val.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    setForm(prev => ({ ...prev, name: val, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Market name is required.');

    setLoading(true);
    try {
      const payload: MarketPayload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        image_url: form.image_url || null,
      };

      await createMarket.mutateAsync(payload);
      toast.success('Market successfully established!');
      navigate("/admin/markets");
    } catch (err: any) {
      console.error("Market Create Error:", err);
      toast.error(`Initialization failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-500 pb-12">
      
      <div className="flex items-center gap-4 py-4">
        <Link 
          to="/admin/markets" 
          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition text-slate-500 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Initialize New Market</h1>
          <p className="text-slate-500 text-sm font-medium">Set up a new geographical textile hub</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10 w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
               label="Market Display Name"
               icon={Store} iconColor="text-blue-500" focusColor="blue"
               placeholder="Bargur Central Textile Plaza" required disabled={loading}
               value={form.name} onChange={e => handleNameChange(e.target.value)}
            />
            
            <FormInput 
               label="URL Identifier (Slug)"
               icon={Tag} iconColor="text-slate-500" focusColor="blue"
               placeholder="central-textile-plaza" required disabled={loading}
               value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
            />
          </div>

          <FormInput 
             label="Primary Location / Address"
             icon={MapPin} iconColor="text-rose-500" focusColor="blue"
             placeholder="Main Road, Bargur Zone 4" required disabled={loading}
             value={form.location} onChange={e => setForm({...form, location: e.target.value})}
          />
          
          <div className="space-y-2 w-full">
            <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-500" /> Market Context & Description
            </label>
            <textarea
              placeholder="Provide background on the market's specialty and history..." 
              required disabled={loading} rows={4}
              value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium font-sans placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Cover Imagery</label>
            <div className="p-1 bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200">
                <ImageUpload
                  bucketName="market-images"
                  defaultImage={form.image_url}
                  onUploadSuccess={(url) => setForm({ ...form, image_url: url })}
                />
            </div>
          </div>

          <hr className="border-slate-100 my-2" />

          <div className="flex justify-end gap-3 mt-2">
            <Link 
              to="/admin/markets" 
              className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition active:scale-[0.98]"
            >
              Discard
            </Link>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-10 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-[0.98] inline-flex items-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <><Save className="w-5 h-5" /> Initialize Market</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
