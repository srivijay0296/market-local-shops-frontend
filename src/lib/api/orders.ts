import { supabase } from '../supabase';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  created_at: string;
  order_items?: any[];
  profiles?: {
    name: string;
    email: string;
  };
}

/**
 * 🛒 Orders API - Complete CRUD Service
 */
export const ordersApi = {
  /**
   * Get all orders with items (Admin)
   */
  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id(name, email),
        order_items(
          *,
          product:products(name, images)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get orders for a specific user
   */
  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product:products(name, images)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new order with items
   */
  async createOrder(params: {
    userId?: string;
    total: number;
    items: any[];
    address: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }) {
    const { userId, total, items, address, customerName, customerPhone, customerEmail } = params;

    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        total_amount: total,
        shipping_address: address,
        status: 'pending',
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id || item.id,
      shop_id: item.shop_id || null,
      quantity: item.quantity,
      price_at_time: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  },

  /**
   * Update order status
   */
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
