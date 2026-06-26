import { backendApi } from '@/lib/api/client';

// ── Logger utility (structured, consistently prefixed) ────────────────────────
const LOG = {
  info:  (msg: string, data?: any) => console.log (`[Markets API] ℹ️  ${msg}`, data ?? ''),
  warn:  (msg: string, data?: any) => console.warn(`[Markets API] ⚠️  ${msg}`, data ?? ''),
  error: (msg: string, err?: any)  => {
    console.error(`[Markets API] ❌ ${msg}`);
    if (err) {
      console.error(`  → code:    ${err.code ?? 'N/A'}`);
      console.error(`  → message: ${err.message ?? 'No message'}`);
      console.error(`  → hint:    ${err.hint ?? 'No hint'}`);
      console.error(`  → details: ${err.details ?? 'No details'}`);
      console.error(`  → status:  ${err.status ?? 'N/A'}`);
    }
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Market {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  cover_image?: string | null;
  created_at: string;
}

export interface MarketPayload {
  name: string;
  slug?: string;
  location?: string | null;
  description?: string | null;
  image_url?: string | null;
}

// ── Session guard ─────────────────────────────────────────────────────────────
async function requireSession(operation: string) {
  const { data: { session }, error: sessionError } = await Promise.resolve({ data: { session: null }, error: null as any });

  if (sessionError) {
    LOG.error(`[${operation}] Session fetch error`, sessionError);
    throw new Error(`Authentication error: ${sessionError.message}`);
  }

  if (!session?.user) {
    LOG.warn(`[${operation}] No active session — user is not logged in`);
    throw new Error('You must be logged in to perform this action. Please sign in and try again.');
  }

  LOG.info(`[${operation}] Session OK — user_id: ${session.user.id}, role: ${session.user.role ?? 'anon'}`);
  return session;
}

// ── Slug auto-generator ───────────────────────────────────────────────────────
function autoSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * 🏪 Markets API
 * All write operations require an active user session.
 */
export const marketsApi = {

  // ── GET all markets ─────────────────────────────────────────────────────────
  async getMarkets(): Promise<Market[]> {
    LOG.info('getMarkets() called');

    try {
      const { data } = await backendApi.get('/markets', { params: { sort: 'created_at_desc' } });
      LOG.info(`getMarkets() returned ${data?.length ?? 0} markets`);
      return data || [];
    } catch (error) {
      LOG.error('getMarkets() failed', error);
      throw error;
    }
  },

  // ── GET market by slug ──────────────────────────────────────────────────────
  async getMarketBySlug(slug: string): Promise<Market | null> {
    LOG.info(`getMarketBySlug("${slug}")`);

    try {
      const { data } = await backendApi.get('/markets', { params: { slug: slug } });
      if (!data) LOG.warn(`getMarketBySlug("${slug}") — no market found`);
      return data;
    } catch (error) {
      LOG.error(`getMarketBySlug("${slug}") failed`, error);
      throw error;
    }
  },

  // ── GET market by ID ────────────────────────────────────────────────────────
  async getMarketById(id: string): Promise<Market | null> {
    LOG.info(`getMarketById("${id}")`);

    try {
      const { data } = await backendApi.get('/markets', { params: { id: id } });
      return data;
    } catch (error) {
      LOG.error(`getMarketById("${id}") failed`, error);
      throw error;
    }
  },

  // ── CREATE market ───────────────────────────────────────────────────────────
  /**
   * Creates a new market. Requires the user to be logged in.
   * NOTE: The markets table does NOT have an owner_id column — do not pass one.
   * Ownership / access control is enforced by the backend.
   */
  async createMarket(payload: MarketPayload): Promise<Market> {
    // ✅ Step 1: Verify session exists
    const session = await requireSession('createMarket');

    // ✅ Step 2: Build clean, schema-safe payload (no owner_id — not in markets table)
    const slug = (payload.slug?.trim()) || autoSlug(payload.name);
    if (!slug) throw new Error('Market slug could not be generated. Please provide a valid name.');

    const cleanPayload = {
      name:        payload.name?.trim() || '',
      slug,
      location:    payload.location?.trim()    || null,
      description: payload.description?.trim() || null,
      image_url:   payload.image_url           || null,
    };

    if (!cleanPayload.name) {
      throw new Error('Market name is required and cannot be empty.');
    }

    // ✅ Step 3: Log full context before DB call
    LOG.info('createMarket() — attempting insert', {
      user_id: session.user.id,
      email:   session.user.email,
      payload: cleanPayload,
    });

    // ✅ Step 4: Execute insert
    try {
      const { data } = await backendApi.post('/markets', cleanPayload);

      if (!data) {
        LOG.warn('createMarket() — insert returned no data');
        throw new Error(
          'Market was not created. ' +
          `Ensure your profile role is 'admin'. User: ${session.user.email}`
        );
      }

      LOG.info(`createMarket() SUCCESS — id: ${data.id}, slug: "${data.slug}"`);
      return data;
    } catch (error: any) {
      LOG.error('createMarket() INSERT failed', error);

      // Translate common error codes to user-friendly messages
      if (error?.response?.data?.code === '42501' || error.code === '42501') {
        throw new Error(
          `Permission denied. Your account (${session.user.email}) does not have admin privileges. ` +
          `Make sure your profile role is set to 'admin'.`
        );
      }
      if (error?.response?.data?.code === '23505' || error.code === '23505') {
        throw new Error(`A market with the slug "${cleanPayload.slug}" already exists. Please choose a different name or slug.`);
      }
      if (error?.response?.data?.code === '42P01' || error.code === '42P01') {
        throw new Error('The markets table does not exist. Please run the database migration first.');
      }
      if (error?.response?.data?.code === 'PGRST301' || error.code === 'PGRST301') {
        throw new Error('JWT expired or invalid. Please sign out and sign back in.');
      }
      // Generic fallback with full error
      throw new Error(`Market creation failed: ${error.message}`);
    }
  },

  // ── UPDATE market ───────────────────────────────────────────────────────────
  async updateMarket(id: string, payload: Partial<MarketPayload>): Promise<Market> {
    const session = await requireSession('updateMarket');

    const cleanUpdate: Record<string, any> = {};
    if (payload.name        !== undefined) cleanUpdate.name        = payload.name.trim();
    if (payload.slug        !== undefined) cleanUpdate.slug        = payload.slug.trim();
    if (payload.location    !== undefined) cleanUpdate.location    = payload.location?.trim() || null;
    if (payload.description !== undefined) cleanUpdate.description = payload.description?.trim() || null;
    if (payload.image_url   !== undefined) cleanUpdate.image_url   = payload.image_url || null;

    LOG.info(`updateMarket("${id}") — update payload`, {
      user_id: session.user.id,
      update:  cleanUpdate,
    });

    try {
      const { data } = await backendApi.put(`/markets/${id}`, cleanUpdate);

      if (!data) {
        LOG.warn(`updateMarket("${id}") — market not found or RLS rejected update`);
        throw new Error(`Market ${id} not found or you do not have permission to update it.`);
      }

      LOG.info(`updateMarket("${id}") SUCCESS`);
      return data;
    } catch (error: any) {
      LOG.error(`updateMarket("${id}") failed`, error);
      if (error?.response?.data?.code === '42501' || error.code === '42501') throw new Error('Permission denied — admin role required to update markets.');
      throw new Error(`Market update failed: ${error.message}`);
    }
  },

  // ── DELETE market ───────────────────────────────────────────────────────────
  async deleteMarket(id: string): Promise<true> {
    const session = await requireSession('deleteMarket');

    LOG.info(`deleteMarket("${id}") — by user ${session.user.id}`);

    try {
      await backendApi.delete(`/markets/${id}`);

      LOG.info(`deleteMarket("${id}") SUCCESS`);
      return true;
    } catch (error: any) {
      LOG.error(`deleteMarket("${id}") failed`, error);
      if (error?.response?.data?.code === '42501' || error.code === '42501') throw new Error('Permission denied — admin role required to delete markets.');
      if (error?.response?.data?.code === '23503' || error.code === '23503') throw new Error('Cannot delete — this market has shops or other records linked to it. Remove those first.');
      throw new Error(`Market deletion failed: ${error.message}`);
    }
  },
};
