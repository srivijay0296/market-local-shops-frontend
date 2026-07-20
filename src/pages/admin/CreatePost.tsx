import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { shopsApi } from "@/lib/api/shops";
import { sellerPostsApi } from "@/lib/api/sellerPosts";
import { categoriesApi } from "@/lib/api/categories";
import { toast } from "sonner";
import { ChevronLeft, ImageIcon, Save, Building, Video, FileText, Sparkles, MapPin, DollarSign, Tag, Play } from "lucide-react";
import { FormInput } from "@/components/admin/FormInput";
import ImageUpload from "@/components/ImageUpload";

export default function CreatePost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    shop_id: "",
    price: "",
    offer_tag: "",
    location: "",
    media_type: "image",
    media_url: "",
    video_url: ""
  });

  useEffect(() => {
    fetchShops();
    fetchCategories();
  }, []);

  const fetchShops = async () => {
    try {
      const data = await shopsApi.getShops();
      if (data) {
        const validShops = data.filter((s: any) => 
          s.id && 
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

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getCategories();
      if (data) setCategories(data);
    } catch (err) {
      console.error("Fetch Categories Error", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.shop_id) {
        throw new Error("Please select a shop");
      }
      if (!form.title.trim()) {
        throw new Error("Post title is required");
      }

      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category || null,
        shop_id: Number(form.shop_id),
        seller_id: Number(form.shop_id), // back compatibility
        price: form.price ? Number(form.price) : null,
        offer_tag: form.offer_tag.trim() || null,
        location: form.location.trim() || null,
        media_type: form.media_type,
        media_url: form.media_url || null,
        video_url: form.media_type === "video" ? form.video_url.trim() || null : null
      };

      await sellerPostsApi.createPost(payload);
      toast.success("Post published successfully!");
      navigate("/admin/feed");
    } catch (err: any) {
      toast.error(err.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-4 md:p-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-6">
        <Link to="/admin/feed" className="p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Publish Content</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Deploy New Feed and Reel Media</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Shop Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-500" /> Target Vendor/Shop
            </label>
            <select
              value={form.shop_id}
              onChange={(e) => setForm({ ...form, shop_id: e.target.value })}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-slate-800 font-bold"
              required
            >
              <option value="">Select Shop...</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (ID: {s.id})
                </option>
              ))}
            </select>
          </div>

          {/* Title & Description */}
          <FormInput
            label="Post Title"
            icon={Sparkles}
            iconColor="text-blue-500"
            focusColor="blue"
            placeholder="e.g. Festival Season Mega Offer!"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" /> Caption / Description
            </label>
            <textarea
              placeholder="Provide detailed description of the post..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Double Column fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" /> Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-slate-800 font-bold"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Price (Optional)"
              icon={DollarSign}
              iconColor="text-green-500"
              focusColor="emerald"
              type="number"
              placeholder="e.g. 499"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Offer Tag (Optional)"
              icon={Tag}
              iconColor="text-rose-500"
              focusColor="rose"
              placeholder="e.g. 50% OFF"
              value={form.offer_tag}
              onChange={(e) => setForm({ ...form, offer_tag: e.target.value })}
            />

            <FormInput
              label="Location (Optional)"
              icon={MapPin}
              iconColor="text-red-500"
              focusColor="rose"
              placeholder="e.g. First Floor, A-Block"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          {/* Media Configurations */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-500" /> Media Format
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, media_type: "image" })}
                  className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${form.media_type === "image" ? "border-blue-600 bg-white text-blue-600 shadow-md" : "border-transparent bg-slate-200/50 text-slate-500 hover:bg-slate-200"}`}
                >
                  <ImageIcon className="w-5 h-5" /> Image Post
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, media_type: "video" })}
                  className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${form.media_type === "video" ? "border-blue-600 bg-white text-blue-600 shadow-md" : "border-transparent bg-slate-200/50 text-slate-500 hover:bg-slate-200"}`}
                >
                  <Play className="w-5 h-5" /> Video / Reel
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <ImageUpload
                label={form.media_type === "video" ? "Cover Image / Thumbnail" : "Post Image"}
                onUploadComplete={(url) => setForm({ ...form, media_url: url })}
                bucket="product-images"
              />
            </div>

            {/* Video Link */}
            {form.media_type === "video" && (
              <FormInput
                label="Video / Reel URL"
                icon={Video}
                iconColor="text-indigo-500"
                focusColor="purple"
                placeholder="e.g. https://supabase.co/.../video.mp4"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                helperText="Supabase storage file link or public MP4/WebM URL"
              />
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Link
              to="/admin/feed"
              className="px-6 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition active:scale-95 text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-95 inline-flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
