import client from './client';

export interface Shop {
  id: string;
  market_id: string | null;
  owner_id: string;
  name: string;
  description: string | null;
  is_approved: boolean;
  image_url: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  owner_name?: string;
  market_name?: string;
}

export const shopsApi = {
  async getShops(params: { approved?: string | boolean; market_id?: string; marketId?: string; status?: string } = {}) {
    // Normalise marketId → market_id
    const { marketId, status, ...rest } = params;
    const finalParams: any = marketId ? { ...rest, market_id: marketId } : { ...rest };
    if (status) finalParams.status = status;
    const response = await client.get('/shops', { params: finalParams });
    return response.data;
  },

  async getShopById(id: string) {
    const response = await client.get(`/shops/${id}`);
    return response.data;
  },

  async getShopProducts(id: string) {
    const response = await client.get(`/shops/${id}/products`);
    return response.data;
  },

  async createShop(formData: FormData | object) {
    const config = formData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await client.post('/shops', formData, config);
    return response.data;
  },

  async updateShop(id: string, formData: FormData | object) {
    const config = formData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await client.put(`/shops/${id}`, formData, config);
    return response.data;
  },

  async deleteShop(id: string) {
    const response = await client.delete(`/shops/${id}`);
    return response.data;
  },

  // ✅ Approve / reject individual shop
  async approveShop(id: string) {
    const response = await client.patch(`/shops/${id}/status`, { status: 'approved' });
    return response.data;
  },

  async rejectShop(id: string) {
    const response = await client.patch(`/shops/${id}/status`, { status: 'rejected' });
    return response.data;
  },

  // ✅ Shop requests management
  async getRequests() {
    const response = await client.get('/shops/requests');
    return response.data;
  },

  async approveRequest(req: any) {
    const response = await client.post(`/shops/requests/${req.id}/approve`, req);
    return response.data;
  },

  async rejectRequest(requestId: string) {
    const response = await client.post(`/shops/requests/${requestId}/reject`);
    return response.data;
  },

  // ✅ Status update (approve/reject existing shop)
  async updateStatus(id: string, status: 'approved' | 'rejected') {
    const response = await client.patch(`/shops/${id}/status`, { status });
    return response.data;
  },
};
