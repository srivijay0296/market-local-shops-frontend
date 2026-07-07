import { backendApi } from '@/lib/api/client';

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
    try {
      const { data } = await backendApi.get('/orders', { params: { sort: 'created_at_desc' } });
      return data || [];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get orders for a specific user
   */
  async getUserOrders(userId: string) {
    try {
      const { data } = await backendApi.get('/orders', { params: { user_id: userId, sort: 'created_at_desc' } });
      return data || [];
    } catch (error) {
      throw error;
    }
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

    try {
      // 1. Create the order
      const { data: order } = await backendApi.post('/orders', {
        user_id: userId,
        total_amount: total,
        shipping_address: address,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        status: 'pending'
      });

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id || item.id,
        shop_id: item.shop_id || null,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      await backendApi.post('/order_items', { items: orderItems });

      return order;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update order status
   */
  async updateStatus(id: string, status: string) {
    try {
      const { data } = await backendApi.put(`/orders/${id}`, { status });
      return data;
    } catch (error) {
      throw error;
    }
  }
};
