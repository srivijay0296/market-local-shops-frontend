import { supabase } from '@/lib/supabase';
import api from '@/lib/api/client';

/**
 * 🛠️ NAMMA MARKET - CENTRAL API HUB (V4.5)
 * Hardened for Direct Supabase Client usage.
 */

const normalizeApiUrl = (url: string) => url.trim().replace(/\/+$|\s+$/g, '');

const getApiServer = () => {
  const rawUrl = import.meta.env.VITE_API_URL?.trim();
  if (rawUrl) {
    return normalizeApiUrl(rawUrl).replace(/\/api\/?$/, '');
  }

  const isProd = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
  return isProd ? 'https://market-local-shops-143.vercel.app' : 'http://localhost:5000';
};

export const API_SERVER = getApiServer();
export const BACKEND_API_URL = import.meta.env.VITE_API_URL
  ? normalizeApiUrl(import.meta.env.VITE_API_URL)
  : (import.meta.env.DEV ? '/api' : 'https://market-local-shops-143.vercel.app/api');

// =============================
// ✅ AUTHENTICATION
// =============================
// Helper function for timeout protection
const promiseWithTimeout = <T>(promise: Promise<T>, ms: number, timeoutErrorMsg: string): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutErrorMsg));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

// =============================
// ✅ AUTHENTICATION
// =============================
export async function getCurrentUser(userId?: string) {
  const start = Date.now();
  console.log(`[getCurrentUser] Request start at ${new Date(start).toISOString()}. Input userId:`, userId);

  try {
    let finalUserId = userId;
    let userEmail: string | undefined = undefined;
    let userMetadata: any = undefined;

    if (!finalUserId) {
      console.log("[getCurrentUser] No userId provided. Fetching session from Supabase...");
      const sessionPromise = supabase.auth.getSession();
      const { data: { session } } = await promiseWithTimeout(
        sessionPromise,
        10000,
        "Timeout fetching auth session (10s limit exceeded)"
      );
      
      console.log("[getCurrentUser] Supabase getSession response user:", session?.user?.id || "None");
      if (!session?.user) {
        console.warn("[getCurrentUser] No session user found. Returning null.");
        return null;
      }
      finalUserId = session.user.id;
      userEmail = session.user.email;
      userMetadata = session.user.user_metadata;
    }

    console.log(`[getCurrentUser] Fetching profile from 'profiles' for ID: ${finalUserId}`);
    const profilePromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', finalUserId)
      .maybeSingle();

    const { data, error } = await promiseWithTimeout(
      profilePromise,
      10000,
      `Timeout fetching profile for ${finalUserId} (10s limit exceeded)`
    );

    if (error) {
      console.error('[getCurrentUser] Supabase profile fetch error:', error.message);
      throw error;
    }

    console.log("[getCurrentUser] Supabase profile database response:", data);

    if (!data) {
      console.warn(`[getCurrentUser] Profile row missing for ID: ${finalUserId}. Auto-creating profile...`);
      if (!userEmail || !userMetadata) {
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await promiseWithTimeout(
          sessionPromise,
          2000,
          "Timeout fetching auth session during auto-create (2s limit)"
        );
        if (!session?.user) {
          console.warn("[getCurrentUser] No session user during profile auto-creation. Returning null.");
          return null;
        }
        userEmail = session.user.email;
        userMetadata = session.user.user_metadata;
      }

      console.log("[getCurrentUser] Inserting new profile row...");
      const insertPromise = supabase
        .from('profiles')
        .insert({
          id: finalUserId,
          email: userEmail,
          name: userMetadata?.name || userMetadata?.full_name || 'New Member',
          role: 'BUYER',
          is_approved: true,
        })
        .select()
        .maybeSingle();

      const { data: created, error: createError } = await promiseWithTimeout(
        insertPromise,
        2000,
        "Timeout inserting new profile (2s limit)"
      );

      if (createError) {
        console.error("[getCurrentUser] Profile creation error:", createError.message);
        throw createError;
      }

      if (!created) {
        console.warn("[getCurrentUser] Profile creation returned no data. Returning null.");
        return null;
      }

      const result = { ...created, role: (created.role || 'BUYER').toUpperCase(), email: userEmail };
      console.log("[getCurrentUser] Created and returning profile:", result);
      return result;
    }

    // Normalize role to uppercase so BUYER/SELLER/ADMIN matches frontend types
    const result = {
      ...data,
      email: data.email || userEmail,
      role: (data.role || 'buyer').toUpperCase(),
      is_approved: data.is_approved ?? true,
    };

    console.log(`[getCurrentUser] Request finished successfully in ${Date.now() - start}ms. Returning profile:`, result);
    return result;
  } catch (err: any) {
    console.error(`[getCurrentUser] Failed in ${Date.now() - start}ms. Error:`, err.message || err);
    throw err;
  }
}

// ─── SCHEMA PROBE CACHE ──────────────────────────────────────────
const schemaCache: Record<string, boolean> = {};

async function columnExists(table: string, column: string): Promise<boolean> {
  const key = `${table}.${column}`;
  if (key in schemaCache) return schemaCache[key];
  const { error } = await supabase.from(table).select(column).limit(0);
  schemaCache[key] = !error || error.code !== '42703';
  return schemaCache[key];
}

export async function loginUser(email: string, password: string) {
  // 4. Validate before login
  const trimmedEmail = email ? email.trim() : "";
  if (!trimmedEmail) {
    throw new Error("Email cannot be empty.");
  }
  if (!password) {
    throw new Error("Password cannot be empty.");
  }

  // 2. Log: email and password length (never the password itself)
  console.log(`[Supabase Auth] Attempting signInWithPassword: email="${trimmedEmail}", passwordLength=${password.length}`);

  try {
    const result = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    
    // 2. Log: returned error and returned data
    console.log("[Supabase Auth] Response Data:", result.data);
    console.log("[Supabase Auth] Response Error:", result.error);

    if (result.error) {
      const errorMsg = result.error.message || "";
      console.error("[Supabase Auth] signInWithPassword error message:", errorMsg);

      // 5. If the user is not confirmed: Show: "Please verify your email before logging in."
      if (errorMsg.toLowerCase().includes("email not confirmed") || errorMsg.toLowerCase().includes("confirm your email")) {
        throw new Error("Please verify your email before logging in.");
      }
      
      // 6. If credentials are incorrect: Show: "Invalid email or password."
      if (errorMsg.toLowerCase().includes("invalid login credentials") || errorMsg.toLowerCase().includes("invalid credentials")) {
        throw new Error("Invalid email or password.");
      }

      // 3. Display the exact Supabase error message to the user
      throw new Error(errorMsg || "Login failed");
    }

    return result;
  } catch (err: any) {
    console.error("[Supabase Auth] Exception caught during signInWithPassword:", err.message || err);
    throw err;
  }
}

export async function signUpUser() {
  throw new Error('signUpUser() is a test stub. Use registerUser() instead.');
}

export async function registerUser(userData: any) {
  const response = await api.post('/auth/register', userData);
  return response.data;
}

// =============================
// ✅ SHOPS
// =============================
/**
 * 🏪 CREATE SHOP (Supabase Client ONLY)
 * Ensures market_id is valid and status is mapped correctly.
 */
export async function createShop(shopData: any) {
  const { data, error } = await supabase
    .from("shops")
    .insert([
      {
        name: shopData.name,
        description: shopData.description,
        market_id: shopData.market_id || null, // 🔴 MUST EXIST IF PROVIDED
        owner_id: shopData.owner_id || null,
        image_url: shopData.image_url,
        is_approved: shopData.is_approved ?? true,
        address: shopData.location,
        phone: shopData.phone
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase Shop Insert Error:", error);
    throw error;
  }
  return data;
}

export async function getShops(filters: { status?: string; approved?: boolean } = {}) {
  let query = supabase
    .from("shops")
    .select(`
      id,
      name,
      market_id,
      markets (
        id,
        name
      )
    `)
    .order("name", { ascending: true });

  if (filters.status === 'approved' || filters.approved === true) {
    query = query.eq("is_approved", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getShopById(id: string) {
  const { data, error } = await supabase
    .from('shops')
    .select('*, markets(*), profiles:owner_id(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// =============================
// ✅ PRODUCTS
// =============================
export async function getProducts(filters: any = {}) {
  let query = supabase.from("products").select(`
    id,
    name,
    price,
    description,
    category_id,
    categories (
      id,
      name
    ),
    image_url,
    images,
    is_approved,
    shops (
      id,
      name,
      market_id,
      owner_id
    )
  `);

  if (filters.shopId) query = query.eq('shop_id', filters.shopId);
  if (filters.onlyApproved) query = query.eq('is_approved', true);

  const { data, error } = await query;
  if (error) throw error;
  
  return (data || []).map((p: any) => ({
    ...p,
    category: p.categories?.name || null
  }));
}

export async function createProduct(productData: any) {
  const { data, error } = await supabase
    .from("products")
    .insert([productData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// =============================
// ✅ MARKETS
// =============================
export async function getMarkets() {
  const { data, error } = await supabase.from("markets").select('*').order('name');
  if (error) {
    console.error('[api.ts] getMarkets() error:', error.code, error.message);
    throw error;
  }
  return data;
}

/**
 * @deprecated — Use marketsApi.createMarket() from lib/api/markets.ts instead.
 * This shim is kept for backward compat and delegates to the canonical implementation.
 */
export async function createMarket(name: string, slug?: string, location?: string | null) {
  // ✅ Verify session before attempting insert
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    const msg = sessionError?.message ?? 'No active session. Please sign in first.';
    console.error('[api.ts] createMarket() — session error:', msg);
    throw new Error(msg);
  }

  // ✅ Auto-generate slug if not provided
  const finalSlug = slug?.trim() ||
    name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

  console.log('[api.ts] createMarket() — payload', {
    user_id: session.user.id,
    name, slug: finalSlug, location,
  });

  // ✅ Schema-safe insert — no owner_id (column does not exist in markets table)
  const { data, error } = await supabase
    .from("markets")
    .insert([{ name: name.trim(), slug: finalSlug, location: location ?? null }])
    .select()
    .maybeSingle();

  if (error) {
    console.error('[api.ts] createMarket() INSERT error:', {
      code: error.code, message: error.message, hint: error.hint, details: error.details,
    });
    throw error;
  }

  if (!data) {
    console.warn('[api.ts] createMarket() — no data returned (RLS reject?)');
    throw new Error('Market creation failed silently. Check your admin role and RLS policies.');
  }

  return data;
}


// =============================
// ✅ STORAGE
// =============================
export async function uploadImage(file: File, bucket: string = 'product-images') {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

// =============================
// ✅ BACKEND BRIDGE
// =============================
export const backendApi = api;

// =============================
// ✅ POSTS (Seller feed)
// =============================
export async function getPosts(limit = 10) {
  const { data, error } = await supabase
    .from('seller_posts')
    .select(`
      id,
      title,
      content,
      image_url,
      created_at,
      shops (
        id,
        name,
        image_url,
        address
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// =============================
// ✅ ENQUIRIES
// =============================
export async function sendEnquiry(payload: {
  buyer_id: string;
  seller_id: string;
  product_id: string;
  message: string;
}) {
  const { data, error } = await supabase
    .from('enquiries')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 📦 PRODUCT SERVICE SHIM (For legacy dashboard components compatibility)
export const productService = {
  getAll: () => getProducts(),
  getProducts: (filters?: any) => getProducts(filters),
  updateProduct: async (id: string, updateData: any) => {
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  deleteProduct: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
