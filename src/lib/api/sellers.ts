import { supabase } from '../supabase';

export interface Seller {
  id: string;
  user_id: string;
  shop_name: string;
  owner_name?: string;
  phone_number?: string;
  location?: string;
  description?: string;
  profile_image?: string;
  shop_banner?: string;
  market_id?: string | null;
  created_at?: string;
}

// 🛡️ Helper to map Shop (new) to Seller (legacy)
const mapShopToSeller = (shop: any): Seller | null => {
  if (!shop) return null;
  return {
    id: shop.id,
    user_id: shop.owner_id,
    shop_name: shop.name || "BTM Boutique",
    owner_name: shop.owner?.name || shop.vendor_name || "Verified Weaver",
    phone_number: shop.phone,
    location: shop.location || "Bargur",
    description: shop.description,
    profile_image: shop.image_url,
    shop_banner: shop.image_url, // For now, use same as profile if banner missing
    market_id: shop.market_id,
    created_at: shop.created_at
  };
};

export const sellersApi = {
  // Get seller by user id (owner_id in shops)
  async getProfileByUserId(userId: string): Promise<Seller | null> {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('shops')
      .select('*, owner:profiles!owner_id(name)')
      .eq('owner_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[sellersApi.getProfileByUserId] Error:', error.message);
      throw error;
    }
    return mapShopToSeller(data);
  },

  // Get seller by id (public lookup on shops)
  async getProfileById(id: string): Promise<Seller | null> {
    if (!id) return null;
    const { data, error } = await supabase
      .from('shops')
      .select('*, owner:profiles!owner_id(name)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[sellersApi.getProfileById] Error:', error.message);
      throw error;
    }
    return mapShopToSeller(data);
  },

  // Upsert seller profile (Create or Update on shops table)
  async upsertProfile(seller: Partial<Seller>): Promise<Seller> {
    if (!seller.user_id) throw new Error("User ID is required for profile sync.");

    const payload: any = {
      owner_id: seller.user_id,
      name: seller.shop_name,
      description: seller.description,
      location: seller.location,
      phone: seller.phone_number,
      image_url: seller.profile_image || seller.shop_banner,
      is_approved: true
    };

    const { data: upsertData, error: upsertError } = await supabase
      .from('shops')
      .upsert(payload, { onConflict: 'owner_id' })
      .select('*, owner:profiles!owner_id(name)')
      .maybeSingle();

    if (upsertError) {
      console.error('[sellersApi.upsertProfile] Error:', upsertError.message);
      throw upsertError;
    }

    return mapShopToSeller(upsertData)!;
  },

  // Get all sellers (public lookup on shops)
  async getAllSellers(): Promise<Seller[]> {
    const { data, error } = await supabase
      .from('shops')
      .select('*, owner:profiles!owner_id(name)')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[sellersApi.getAllSellers] Error:', error.message);
      throw error;
    }
    return (data || []).map(mapShopToSeller).filter(Boolean) as Seller[];
  }
};
