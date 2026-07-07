import client from './client';

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  images: string[];
  is_approved: boolean;
  view_count: number;
  created_at: string;
  shop_name?: string;
}

export const productsApi = {
  async getProducts(filters?: { shopId?: string; category?: string; categoryId?: string; approved?: boolean; is_approved?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.shopId) params.append('shop_id', filters.shopId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.categoryId) params.append('category', filters.categoryId);
    const approvedVal = filters?.approved ?? filters?.is_approved;
    if (approvedVal !== undefined) params.append('approved', String(approvedVal));
    
    const res = await client.get(`/products?${params.toString()}`);
    return res.data;
  },

  async getProductById(id: string) {
    const res = await client.get(`/products/${id}`);
    return res.data;
  },

  async createProduct(data: FormData | any) {
    const isFormData = data instanceof FormData;
    const res = await client.post('/products', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return res.data;
  },

  async updateProduct(id: string, data: FormData | any) {
    const isFormData = data instanceof FormData;
    const res = await client.put(`/products/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return res.data;
  },

  async deleteProduct(id: string) {
    const res = await client.delete(`/products/${id}`);
    return res.data;
  }
};