import { backendApi } from '@/lib/api/client';

export interface VendorInput {
  user_id: string;
  shop_name: string;
  description?: string;
  address?: string;
  phone?: string;
  market_id?: string;
}

export const vendorsApi = {
  // Register a new vendor profile
  async registerVendor(vendor: VendorInput) {
    const { data } = await backendApi.post('/vendors', vendor);
    return data;
  },

  // Get vendor profile by user ID
  async getVendorProfile(userId: string) {
    const { data } = await backendApi.get('/vendors', { params: { user_id: userId } });
    return data;
  },

  // Get vendor by ID
  async getVendorById(id: string) {
    const { data } = await backendApi.get(`/vendors/${id}`);
    return data;
  }
};
