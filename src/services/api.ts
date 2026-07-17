import { backendApi } from '@/lib/api/client';
import { productsApi, Product } from '@/lib/api/products';
import { shopsApi, Shop } from '@/lib/api/shops';
import { marketsApi, Market, MarketPayload } from '@/lib/api/markets';
import { usersApi } from '@/lib/api/users';
import { ordersApi, Order } from '@/lib/api/orders';

// Interface Definitions to replace 'any'
export interface AuthResponse {
  data: { session: { token?: string; accessToken?: string; user?: unknown } | null; user: unknown | null } | null;
  error: { message?: string } | null;
}

export interface RegisterData {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  [key: string]: unknown;
}

export interface ProductFilters {
  shopId?: string;
  category?: string;
  categoryId?: string;
  approved?: boolean;
  is_approved?: boolean;
  onlyApproved?: boolean;
}

export interface ShopFilters {
  status?: string;
  approved?: boolean;
}

export const API_SERVER = import.meta.env.VITE_API_URL || '';
export const BACKEND_API_URL = import.meta.env.VITE_API_URL || '';

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const res = await backendApi.post('/auth/login', { username, password });
    const token = res.data?.token || res.data?.accessToken;
    if (token) {
      localStorage.setItem('token', token);
    }
    return { data: { session: res.data, user: res.data?.user || null }, error: null };
  } catch (err: unknown) {
    const errorMsg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data || { message: (err as Error).message };
    return { data: null, error: errorMsg };
  }
};

export const registerUser = async (userData: RegisterData): Promise<unknown> => {
  try {
    const res = await backendApi.post('/auth/register', userData);
    return res.data;
  } catch (err: unknown) {
    console.error("Register Error:", err);
    throw err;
  }
};

export const getCurrentUser = async (userId?: string): Promise<unknown | null> => {
  try {
    if (userId) return await usersApi.getUserById(userId);
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await backendApi.get('/auth/profile');
    return res.data;
  } catch (err: unknown) {
    console.error("GetCurrentUser Error:", err);
    return null;
  }
};

export const getUsers = async (): Promise<unknown[]> => {
  try {
    return await usersApi.getUsers();
  } catch (err: unknown) {
    console.error("getUsers Error:", err);
    return [];
  }
};

export const getUserById = async (id: string): Promise<unknown | null> => {
  try {
    const res = await backendApi.get(`/users/${id}`);
    return res.data;
  } catch (err: unknown) {
    console.error("getUserById Error:", err);
    return null;
  }
};

export const createUser = async (data: RegisterData): Promise<unknown> => {
  try {
    const res = await backendApi.post('/users', data);
    return res.data;
  } catch (err: unknown) {
    console.error("createUser Error:", err);
    throw err;
  }
};

export const deleteUser = async (id: string): Promise<unknown> => {
  try {
    const res = await backendApi.delete(`/users/${id}`);
    return res.data;
  } catch (err: unknown) {
    console.error("deleteUser Error:", err);
    throw err;
  }
};

export const getShops = async (f?: ShopFilters): Promise<Shop[]> => {
  try {
    return await shopsApi.getShops(f);
  } catch (err: unknown) {
    console.error("getShops Error:", err);
    return [];
  }
};

export const getShopById = async (id: string): Promise<Shop | null> => {
  try {
    return await shopsApi.getShopById(id);
  } catch (err: unknown) {
    console.error("getShopById Error:", err);
    return null;
  }
};

export const createShop = async (data: Partial<Shop>): Promise<Shop> => {
  try {
    return await shopsApi.createShop(data as any);
  } catch (err: unknown) {
    console.error("createShop Error:", err);
    throw err;
  }
};

export const getProducts = async (f?: ProductFilters): Promise<Product[]> => {
  try {
    return await productsApi.getProducts(f);
  } catch (err: unknown) {
    console.error("getProducts Error:", err);
    return [];
  }
};

export const createProduct = async (data: Partial<Product> | FormData): Promise<Product> => {
  try {
    return await productsApi.createProduct(data);
  } catch (err: unknown) {
    console.error("createProduct Error:", err);
    throw err;
  }
};

export const getMarkets = async (): Promise<Market[]> => {
  try {
    return await marketsApi.getMarkets();
  } catch (err: unknown) {
    console.error("getMarkets Error:", err);
    return [];
  }
};

export const createMarket = async (name: string, slug?: string, location?: string | null): Promise<Market> => {
  try {
    const payload: MarketPayload = { 
      name, 
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'), 
      location: location || undefined 
    };
    return await marketsApi.createMarket(payload);
  } catch (err: unknown) {
    console.error("createMarket Error:", err);
    throw err;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    return await ordersApi.getAllOrders();
  } catch (err: unknown) {
    console.error("getOrders Error:", err);
    return [];
  }
};

export const createOrder = async (data: Partial<Order>): Promise<Order> => {
  try {
    return await ordersApi.createOrder(data);
  } catch (err: unknown) {
    console.error("createOrder Error:", err);
    throw err;
  }
};

export const uploadImage = async (file: File, bucket: string = 'images'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    const res = await backendApi.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.publicUrl || "https://via.placeholder.com/150";
  } catch (err: unknown) {
    console.error("uploadImage Error:", err);
    throw err;
  }
};

export const getPosts = async (): Promise<unknown[]> => {
  return [];
};

export const sendEnquiry = async (p: Record<string, unknown>): Promise<{ success: boolean }> => {
  return { success: true };
};

export const productService = {
  getAll: async (): Promise<Product[]> => getProducts(),
  getProducts: async (f?: ProductFilters): Promise<Product[]> => getProducts(f),
  updateProduct: async (id: string, data: Partial<Product> | FormData): Promise<Product> => {
    try {
      return await productsApi.updateProduct(id, data);
    } catch (err: unknown) {
      console.error("updateProduct Error:", err);
      throw err;
    }
  },
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      await productsApi.deleteProduct(id);
      return true;
    } catch (err: unknown) {
      console.error("deleteProduct Error:", err);
      return false;
    }
  }
};

export { backendApi };
export default backendApi;
