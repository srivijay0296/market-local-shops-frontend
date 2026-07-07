import { backendApi } from '@/lib/api/client';

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
    shop_banner: shop.image_url,
    market_id: shop.market_id,
    created_at: shop.created_at
  };
};

export const sellersApi = {
  // Get seller by user id (owner_id in shops)
  async getProfileByUserId(userId: string): Promise<Seller | null> {
    if (!userId) return null;
    const { data } = await backendApi.get('/shops', { params: { owner_id: userId } });
    return mapShopToSeller(data);
  },

  // Get seller by id (public lookup on shops)
  async getProfileById(id: string): Promise<Seller | null> {
    if (!id) return null;
    const { data } = await backendApi.get(`/shops/${id}`);
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

    const { data } = await backendApi.post('/shops/upsert', payload);
    return mapShopToSeller(data)!;
  },

  // Get all sellers (public lookup on shops)
  async getAllSellers(): Promise<Seller[]> {
    const { data } = await backendApi.get('/shops', { params: { is_approved: true, sort: 'created_at_desc' } });
    return (data || []).map(mapShopToSeller).filter(Boolean) as Seller[];
  }
};
