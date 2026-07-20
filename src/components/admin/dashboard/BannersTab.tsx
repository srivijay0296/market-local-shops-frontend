import React from "react";
import { Plus, X, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";

interface BannersTabProps {
  banners: any[];
  isAddingBanner: boolean;
  setIsAddingBanner: (val: boolean) => void;
  bannerForm: {
    title: string;
    description: string;
    image_url: string;
    active: boolean;
    sort_order: number;
  };
  setBannerForm: (val: any) => void;
  handleBannerCreate: (e: React.FormEvent) => void;
  handleBannerToggle: (id: any, currentActive: boolean) => void;
  handleBannerDelete: (id: any) => void;
  loading: boolean;
}

export const BannersTab = React.memo(function BannersTab({
  banners,
  isAddingBanner,
  setIsAddingBanner,
  bannerForm,
  setBannerForm,
  handleBannerCreate,
  handleBannerToggle,
  handleBannerDelete,
  loading
}: BannersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Homepage Slider Marketing</h3>
          <p className="text-slate-500 text-xs mt-0.5">Manage banners sliding on client main screen.</p>
        </div>
        <button
          onClick={() => setIsAddingBanner(!isAddingBanner)}
          className="btn-primary flex items-center gap-1.5 py-2 text-xs"
        >
          {isAddingBanner ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAddingBanner ? "Cancel" : "New Banner"}
        </button>
      </div>

      {isAddingBanner && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleBannerCreate}
          className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 max-w-xl shadow-sm"
        >
          <h4 className="font-bold text-slate-800 text-sm">Initialize Promoted Banner</h4>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Banner Text / Title</label>
            <input
              required
              type="text"
              value={bannerForm.title}
              onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
              placeholder="e.g. Grand Festive Silk Deals"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Subtitle Description</label>
            <input
              type="text"
              value={bannerForm.description}
              onChange={e => setBannerForm({ ...bannerForm, description: e.target.value })}
              placeholder="Up to 45% discount"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Sorting Index</label>
              <input
                type="number"
                value={bannerForm.sort_order}
                onChange={e => setBannerForm({ ...bannerForm, sort_order: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">State</label>
              <select
                value={String(bannerForm.active)}
                onChange={e => setBannerForm({ ...bannerForm, active: e.target.value === "true" })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="true">Active</option>
                <option value="false">Hidden</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Cover Image</label>
            <ImageUpload
              maxImages={1}
              bucket="banners"
              folder="home"
              single={true}
              onUpload={(urls) => setBannerForm({ ...bannerForm, image_url: urls[0] || "" })}
            />
          </div>

          <button type="submit" className="btn-primary py-2.5 px-6 font-bold text-xs uppercase tracking-wider">Publish Slider</button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(b => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="w-full h-44 bg-slate-100 relative">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border
                  ${b.active ? 'bg-green-500/90 border-green-400 text-white' : 'bg-slate-900/80 border-slate-700 text-white'}`}>
                  {b.active ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>
            <div className="p-5 text-left space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{b.title}</h4>
                <p className="text-slate-500 text-xs mt-1">{b.description || "No description provided."}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Sort order: {b.sort_order}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleBannerToggle(b.id, b.active)}
                  className="text-xs font-bold flex items-center gap-1.5 text-slate-500 hover:text-slate-800"
                >
                  {b.active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                  Toggle state
                </button>
                <button onClick={() => handleBannerDelete(b.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition">
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 text-sm font-semibold">
            No banners configured. Add a new banner slider.
          </div>
        )}
      </div>
    </div>
  );
});
