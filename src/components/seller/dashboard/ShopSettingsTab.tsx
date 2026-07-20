import React, { useState } from "react";
import { toast } from "sonner";
import { backendApi } from "@/lib/api/client";
import { Store, Save, Phone, MapPin, Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface ShopSettingsTabProps {
  shop: any;
  onRefresh: () => void;
}

export const ShopSettingsTab = React.memo(function ShopSettingsTab({ shop, onRefresh }: ShopSettingsTabProps) {
  const [name, setName] = useState(shop?.name || "");
  const [phone, setPhone] = useState(shop?.phone || "");
  const [description, setDescription] = useState(shop?.description || "");
  const [imageUrl, setImageUrl] = useState(shop?.imageUrl || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await backendApi.put(`/shops/${shop.id}`, {
        name,
        phone,
        description,
        imageUrl,
        isApproved: shop?.isApproved ?? true,
        marketId: shop?.markets?.id
      });
      toast.success("Shop settings updated successfully.");
      onRefresh();
    } catch (err) {
      toast.error("Failed to update shop settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-glass space-y-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 bg-primary/10 text-accent rounded-xl">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-black text-foreground text-lg uppercase tracking-tight">Shop Configurations</h3>
          <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest mt-1">Configure your public vendor page details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Shop Name</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border p-3.5 rounded-xl outline-none font-medium text-sm focus:border-primary/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-accent" /> Phone / Contact
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="w-full bg-background border border-border p-3.5 rounded-xl outline-none font-medium text-sm focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent" /> Market Hub
            </label>
            <input
              disabled
              type="text"
              value={shop?.markets?.name || "Central Market"}
              className="w-full bg-background/50 border border-border p-3.5 rounded-xl outline-none font-semibold text-xs text-foreground/50 uppercase tracking-wider"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Shop Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduce your boutique, products, and specialties..."
            className="w-full bg-background border border-border p-3.5 rounded-xl outline-none font-medium text-sm focus:border-primary/50 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Shop Cover Image</label>
          <div className="bg-background rounded-xl border border-dashed border-border p-4">
            <ImageUpload
              maxImages={1}
              bucket="shops"
              single={true}
              onUpload={(urls) => setImageUrl(urls[0] || "")}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border/40">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold uppercase text-xs tracking-widest rounded-xl hover:opacity-90 active:scale-95 transition flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
});
