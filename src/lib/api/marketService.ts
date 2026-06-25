import { supabase } from '../supabase';

// ── Logger (consistent with markets.ts) ──────────────────────────────────────
const LOG = {
  info:  (msg: string, data?: any) => console.log (`[MarketService] ℹ️  ${msg}`, data ?? ''),
  warn:  (msg: string, data?: any) => console.warn(`[MarketService] ⚠️  ${msg}`, data ?? ''),
  error: (msg: string, err?: any)  => {
    console.error(`[MarketService] ❌ ${msg}`);
    if (err) {
      console.error(`  → code:    ${err.code ?? 'N/A'}`);
      console.error(`  → message: ${err.message ?? 'No message'}`);
      console.error(`  → hint:    ${err.hint ?? 'No hint'}`);
      console.error(`  → details: ${err.details ?? 'No details'}`);
    }
  },
};

export interface MarketPayload {
  id?: string;
  name: string;
  slug?: string;
  location?: string | null;
  description?: string | null;
  image_url?: string | null;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Session guard — must be called before any write operation.
 * NOTE: The markets table does NOT have an owner_id column.
 *       Write access is controlled by Supabase RLS: profile.role = 'admin'.
 * ─────────────────────────────────────────────────────────────────────────────
 */
async function getVerifiedSession(operation: string) {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    LOG.error(`[${operation}] Auth.getSession() error`, error);
    throw new Error(`Session error: ${error.message}`);
  }

  if (!session?.user?.id) {
    LOG.warn(`[${operation}] No authenticated session — aborting`);
    throw new Error('You must be signed in to perform this action.');
  }

  LOG.info(`[${operation}] Session verified — user_id: ${session.user.id}`);
  return session;
}

/**
 * Insert a new market row.
 * - Does NOT set owner_id (column does not exist on markets table)
 * - Does NOT manually set created_at (DB default handles it)
 * - Validates session before attempting insert
 */
export async function insertMarket(payload: MarketPayload) {
  const session = await getVerifiedSession('insertMarket');

  // Build schema-safe payload — exclude id if not provided (let DB generate)
  const insertData: Record<string, any> = {
    name:        payload.name?.trim(),
    slug:        payload.slug?.trim() || payload.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
    location:    payload.location    ?? null,
    description: payload.description ?? null,
    image_url:   payload.image_url   ?? null,
  };

  // Only include ID if explicitly provided (e.g., migration/seeding scenarios)
  if (payload.id) insertData.id = payload.id;

  LOG.info('insertMarket() — payload', { user_id: session.user.id, ...insertData });

  const { data, error } = await supabase
    .from('markets')
    .insert(insertData)
    .select()
    .maybeSingle();

  if (error) {
    LOG.error('insertMarket() failed', error);
    if (error.code === '42501') {
      throw new Error(
        `Permission denied for user ${session.user.email}. ` +
        `Your profile role must be 'admin' to create markets.`
      );
    }
    if (error.code === '23505') {
      throw new Error(`A market with slug "${insertData.slug}" already exists.`);
    }
    throw new Error(`Insert failed [${error.code}]: ${error.message}`);
  }

  if (!data) {
    LOG.warn('insertMarket() — no data returned (RLS silent reject?)');
    throw new Error('Market insert returned no data. Check your RLS policies and admin role assignment.');
  }

  LOG.info(`insertMarket() SUCCESS — id: ${data.id}`);
  return data;
}

/**
 * Update an existing market row by ID.
 */
export async function updateMarket(id: string, payload: Partial<MarketPayload>) {
  const session = await getVerifiedSession('updateMarket');

  // Only send fields that are actually provided
  const updateData: Record<string, any> = {};
  if (payload.name        !== undefined) updateData.name        = payload.name?.trim();
  if (payload.slug        !== undefined) updateData.slug        = payload.slug?.trim();
  if (payload.location    !== undefined) updateData.location    = payload.location ?? null;
  if (payload.description !== undefined) updateData.description = payload.description ?? null;
  if (payload.image_url   !== undefined) updateData.image_url   = payload.image_url ?? null;

  LOG.info(`updateMarket("${id}")`, { user_id: session.user.id, update: updateData });

  const { data, error } = await supabase
    .from('markets')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    LOG.error(`updateMarket("${id}") failed`, error);
    if (error.code === '42501') throw new Error('Permission denied — admin role required.');
    throw new Error(`Update failed [${error.code}]: ${error.message}`);
  }

  LOG.info(`updateMarket("${id}") SUCCESS`);
  return data;
}

/**
 * Delete a market row by ID.
 */
export async function deleteMarket(id: string) {
  const session = await getVerifiedSession('deleteMarket');

  LOG.info(`deleteMarket("${id}") — user: ${session.user.id}`);

  const { data, error } = await supabase
    .from('markets')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    LOG.error(`deleteMarket("${id}") failed`, error);
    if (error.code === '42501') throw new Error('Permission denied — admin role required.');
    if (error.code === '23503') throw new Error('Cannot delete — this market has shops linked to it. Delete those shops first.');
    throw new Error(`Delete failed [${error.code}]: ${error.message}`);
  }

  LOG.info(`deleteMarket("${id}") SUCCESS`);
  return data;
}

/**
 * Upload a market image to the storage bucket.
 */
export async function uploadMarketImage(file: File, folder: string = 'markets') {
  // Verify authentication before upload
  const session = await getVerifiedSession('uploadMarketImage');

  const fileExt  = file.name.split('.').pop() || 'jpg';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeName}`;
  const filePath = `${folder}/${fileName}`;

  LOG.info(`uploadMarketImage() — uploading "${filePath}"`, { user_id: session.user.id, size: file.size });

  const { data, error } = await supabase.storage
    .from('market-images')
    .upload(filePath, file, {
      upsert:      true,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    LOG.error(`uploadMarketImage("${filePath}") failed`, error);
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('market-images')
    .getPublicUrl(filePath);

  LOG.info(`uploadMarketImage() SUCCESS — url: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

/**
 * List markets with optional filters, pagination, and search.
 * READ is public — no session required.
 */
export async function listMarkets(
  search?: string,
  limit: number = 10,
  offset: number = 0
) {
  LOG.info(`listMarkets() — search:"${search}" limit:${limit} offset:${offset}`);

  let query = supabase.from('markets').select('*');

  if (search) query = query.ilike('name', `%${search}%`);
  query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    LOG.error('listMarkets() failed', error);
    throw new Error(`Fetch failed [${error.code}]: ${error.message}`);
  }

  LOG.info(`listMarkets() — returned ${data?.length ?? 0} rows`);
  return data;
}

/**
 * Count markets with optional search.
 */
export async function countMarkets(search?: string) {
  let query = supabase.from('markets').select('*', { count: 'exact', head: true });
  if (search) query = query.ilike('name', `%${search}%`);

  const { count, error } = await query;
  if (error) {
    LOG.error('countMarkets() failed', error);
    throw new Error(`Count failed [${error.code}]: ${error.message}`);
  }
  return count ?? 0;
}

/**
 * Fetch a single market by ID (public read).
 */
export async function getMarketById(id: string) {
  LOG.info(`getMarketById("${id}")`);

  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    LOG.error(`getMarketById("${id}") failed`, error);
    throw new Error(`Fetch failed [${error.code}]: ${error.message}`);
  }

  return data;
}

/**
 * Fetch multiple markets by IDs (public read).
 */
export async function getMarketsByIds(ids: string[]) {
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .in('id', ids);

  if (error) {
    LOG.error('getMarketsByIds() failed', error);
    throw new Error(`Bulk fetch failed [${error.code}]: ${error.message}`);
  }

  return data;
}
