import { backendApi } from '@/lib/api/client';
import { productsApi } from '@/lib/api/products';
import { shopsApi } from '@/lib/api/shops';
import { marketsApi } from '@/lib/api/markets';
import { usersApi } from '@/lib/api/users';
import { ordersApi } from '@/lib/api/orders';

export const API_SERVER = import.meta.env.VITE_API_URL || '';
export const BACKEND_API_URL = import.meta.env.VITE_API_URL || '';

export const loginUser = async (username: string, password: string) => {
  try {
    const res = await backendApi.post('/auth/login', { username, password });
    if (res.data?.token || res.data?.accessToken) {
      localStorage.setItem('token', res.data.token || res.data.accessToken);
    }
    return { data: { session: res.data, user: res.data.user }, error: null };
  } catch (err: any) {
    return { data: null, error: err.response?.data || { message: err.message } };
  }
};

export const registerUser = async (userData: any) => {
  const res = await backendApi.post('/auth/register', userData);
  return res.data;
};

export const getCurrentUser = async (userId?: string) => {
  if (userId) return await usersApi.getUserById(userId);
  const token = localStorage.getItem('token');
  if (!token) return null;
  const res = await backendApi.get('/auth/profile');
  return res.data;
};

export const getUsers = () => usersApi.getUsers();
export const getUserById = (id: string) => usersApi.getUserById(id);
export const createUser = (data: any) => backendApi.post('/users', data).then(r => r.data);
export const deleteUser = (id: string) => backendApi.delete(`/users/${id}`).then(r => r.data);

export const getShops = (f?: any) => shopsApi.getShops(f);
export const getShopById = (id: string) => shopsApi.getShopById(id);
export const createShop = (data: any) => shopsApi.createShop(data);

export const getProducts = (f?: any) => productsApi.getProducts(f);
export const createProduct = (data: any) => productsApi.createProduct(data);

export const getMarkets = () => marketsApi.getMarkets();
export const createMarket = (name: string, slug?: string, location?: string | null) => 
  marketsApi.createMarket({ name, slug: slug || name.toLowerCase().replace(/\s+/g,'-'), location: location || undefined });

export const getOrders = () => ordersApi.getAllOrders();
export const createOrder = (data: any) => ordersApi.createOrder(data);

export const uploadImage = async (file: File, bucket = 'images') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  const res = await backendApi.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.publicUrl || "https://via.placeholder.com/150";
};

export const getPosts = async () => [];
export const sendEnquiry = async (p: any) => ({ success: true });

export const productService = {
  getAll: () => productsApi.getProducts(),
  getProducts: (f?: any) => productsApi.getProducts(f),
  updateProduct: (id: string, data: any) => productsApi.updateProduct(id, data),
  deleteProduct: (id: string) => productsApi.deleteProduct(id)
};

export { backendApi };
export default backendApi;
