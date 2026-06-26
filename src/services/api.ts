import api from '@/lib/api/client';

/**
 * 🛠️ NAMMA MARKET - CENTRAL API HUB (Spring Boot Migration)
 * Mapped to the new Java 21 / Spring Boot 3.5 backend
 */

export const API_SERVER = 'http://localhost:8080';
export const BACKEND_API_URL = 'http://localhost:8080/api';

// =============================
// ✅ AUTHENTICATION
// =============================

export async function loginUser(username: string, password: string) {
  console.log(`[Spring Boot Auth] Attempting login for username: ${username}`);
  try {
    const response = await api.post('/api/auth/login', { username, password });
    
    // Store token if it's returned
    if (response.data?.token || response.data?.accessToken) {
      localStorage.setItem('token', response.data.token || response.data.accessToken);
    }
    
    return { data: { session: response.data, user: response.data.user }, error: null };
  } catch (err: any) {
    console.error("[Spring Boot Auth] Exception caught during login:", err.message || err);
    return { data: null, error: err.response?.data || { message: err.message } };
  }
}

export async function registerUser(userData: any) {
  try {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (err: any) {
    console.error("[Spring Boot Auth] Exception caught during register:", err.message || err);
    throw err.response?.data || err;
  }
}

export async function getCurrentUser(userId?: string) {
  // If we have a userId, fetch that specific user.
  // Otherwise try to fetch the profile of the currently authenticated user
  try {
    if (userId) {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } else {
      // Mocked / fallback for now if there isn't a specific /me endpoint
      // You can implement /api/users/me in Spring Boot to return current user profile based on JWT token
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Temporary fallback: getting first user or decoding token
      // Ideally should be: const response = await api.get('/api/users/me');
      const response = await api.get('/api/users');
      // Just returning first user for now as a mock if /me is missing
      return response.data && response.data.length > 0 ? response.data[0] : null;
    }
  } catch (err) {
    console.warn("Failed to fetch current user, you may need to login:", err);
    return null;
  }
}

// =============================
// ✅ USERS
// =============================

export async function getUsers() {
  const response = await api.get('/api/users');
  return response.data;
}

export async function getUserById(id: string) {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
}

export async function createUser(userData: any) {
  const response = await api.post('/api/users', userData);
  return response.data;
}

export async function deleteUser(id: string) {
  const response = await api.delete(`/api/users/${id}`);
  return response.data;
}

// =============================
// ✅ SHOPS
// =============================

export async function getShops(filters: { status?: string; approved?: boolean } = {}) {
  // Can pass query params based on filters if Spring Boot supports it
  const response = await api.get('/api/shops');
  let shops = response.data || [];
  
  // Frontend fallback filtering if backend doesn't support query params yet
  if (filters.status === 'approved' || filters.approved === true) {
    shops = shops.filter((s: any) => s.is_approved === true || s.isApproved === true);
  }
  
  return shops;
}

export async function getShopById(id: string) {
  const response = await api.get(`/api/shops/${id}`);
  return response.data;
}

export async function createShop(shopData: any) {
  const response = await api.post('/api/shops', shopData);
  return response.data;
}

// =============================
// ✅ PRODUCTS
// =============================

export async function getProducts(filters: any = {}) {
  const response = await api.get('/api/products');
  let products = response.data || [];
  
  if (filters.shopId) {
    products = products.filter((p: any) => p.shop_id === filters.shopId || p.shop?.id === filters.shopId);
  }
  if (filters.onlyApproved) {
    products = products.filter((p: any) => p.is_approved === true || p.isApproved === true);
  }
  
  return products;
}

export async function createProduct(productData: any) {
  const response = await api.post('/api/products', productData);
  return response.data;
}

// =============================
// ✅ MARKETS
// =============================

export async function getMarkets() {
  const response = await api.get('/api/markets');
  return response.data;
}

export async function createMarket(name: string, slug?: string, location?: string | null) {
  const finalSlug = slug?.trim() || name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  const response = await api.post('/api/markets', {
    name: name.trim(),
    slug: finalSlug,
    location: location || null
  });
  return response.data;
}

// =============================
// ✅ ORDERS
// =============================

export async function getOrders() {
  const response = await api.get('/api/orders');
  return response.data;
}

export async function createOrder(orderData: any) {
  const response = await api.post('/api/orders', orderData);
  return response.data;
}

// =============================
// ✅ STORAGE (Placeholder)
// =============================

export async function uploadImage(file: File, bucket: string = 'product-images') {
  console.warn("Upload Image is currently a placeholder. Need to implement Spring Boot S3 / file upload endpoint.");
  // Example implementation once Spring Boot endpoint is ready:
  /*
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  const response = await api.post('/api/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.publicUrl;
  */
  return "https://via.placeholder.com/150";
}

// =============================
// ✅ POSTS (Placeholder)
// =============================

export async function getPosts(limit = 10) {
  console.warn("getPosts not fully implemented in Spring Boot yet, returning empty array.");
  return [];
}

export async function sendEnquiry(payload: any) {
  console.warn("sendEnquiry not implemented in Spring Boot yet.");
  return { success: true };
}

// 📦 PRODUCT SERVICE SHIM (For legacy dashboard components compatibility)
export const productService = {
  getAll: () => getProducts(),
  getProducts: (filters?: any) => getProducts(filters),
  updateProduct: async (id: string, updateData: any) => {
    // Assuming Spring Boot PUT endpoint
    const response = await api.put(`/api/products/${id}`, updateData);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    await api.delete(`/api/products/${id}`);
    return true;
  }
};

// =============================
// ✅ BACKEND BRIDGE
// =============================
export const backendApi = api;
