import { supabase } from '@/lib/supabase';

/**
 * 🛒 CART ENGINE v3.1 (Supabase Direct)
 * Updated to use the standard 'cart' table.
 */
export const cartApi = {
  async getCart(userId: string) {
    const { data, error } = await supabase
      .from('cart')
      .select('*, product:products(name, price, images, image_url, shop_id)')
      .eq('user_id', userId);

    if (error) {
      console.error('🛒 Cart Retrieval Protocol Failure:', error);
      return [];
    }
    return data || [];
  },

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const { data, error } = await supabase
      .from('cart')
      .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: 'user_id, product_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuantityByProduct(userId: string, productId: string, quantity: number) {
    const { data, error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromCartByProduct(userId: string, productId: string) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
    return true;
  },

  async clearCart(userId: string) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
};
