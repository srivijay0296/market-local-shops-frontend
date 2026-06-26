import { backendApi } from '@/lib/api/client';

/**
 * 🛒 CART ENGINE - Spring Boot REST API
 */
export const cartApi = {
  async getCart(userId: string) {
    try {
      const { data } = await backendApi.get('/cart', { params: { user_id: userId } });
      return data || [];
    } catch (error) {
      console.error('🛒 Cart Retrieval Protocol Failure:', error);
      return [];
    }
  },

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const { data } = await backendApi.post('/cart', { user_id: userId, product_id: productId, quantity });
    return data;
  },

  async updateQuantityByProduct(userId: string, productId: string, quantity: number) {
    const { data } = await backendApi.put('/cart', { quantity }, {
      params: { user_id: userId, product_id: productId }
    });
    return data;
  },

  async removeFromCartByProduct(userId: string, productId: string) {
    await backendApi.delete('/cart', { params: { user_id: userId, product_id: productId } });
    return true;
  },

  async clearCart(userId: string) {
    await backendApi.delete('/cart', { params: { user_id: userId } });
    return true;
  }
};
