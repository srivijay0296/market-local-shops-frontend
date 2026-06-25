import { supabase } from '../supabase';

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
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

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
 * 🏪 Markets API — Direct Supabase Integration
 * All write operations require an active user session (admin RLS enforced on DB).
 */
export const marketsApi = {

  // ── GET all markets ─────────────────────────────────────────────────────────
  async getMarkets(): Promise<Market[]> {
    LOG.info('getMarkets() called');

    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      LOG.error('getMarkets() failed', error);
      throw error;
    }

    LOG.info(`getMarkets() returned ${data?.length ?? 0} markets`);
    return data || [];
  },

  // ── GET market by slug ──────────────────────────────────────────────────────
  async getMarketBySlug(slug: string): Promise<Market | null> {
    LOG.info(`getMarketBySlug("${slug}")`);

    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('slug', slug)
      .maybeSingle(); // avoids 406 when no match

    if (error) {
      LOG.error(`getMarketBySlug("${slug}") failed`, error);
      throw error;
    }

    if (!data) LOG.warn(`getMarketBySlug("${slug}") — no market found`);
    return data;
  },

  // ── GET market by ID ────────────────────────────────────────────────────────
  async getMarketById(id: string): Promise<Market | null> {
    LOG.info(`getMarketById("${id}")`);

    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      LOG.error(`getMarketById("${id}") failed`, error);
      throw error;
    }

    return data;
  },

  // ── CREATE market ───────────────────────────────────────────────────────────
  /**
   * Creates a new market. Requires the user to be logged in (RLS: admin role).
   * NOTE: The markets table does NOT have an owner_id column — do not pass one.
   * Ownership / access control is enforced by Supabase RLS checking profile.role = 'admin'.
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
    const { data, error } = await supabase
      .from('markets')
      .insert([cleanPayload])
      .select()
      .maybeSingle();

    // ✅ Step 5: Detailed error reporting
    if (error) {
      LOG.error('createMarket() INSERT failed', error);

      // Translate common Supabase/PostgREST error codes to user-friendly messages
      if (error.code === '42501') {
        throw new Error(
          `Permission denied. Your account (${session.user.email}) does not have admin privileges. ` +
          `Make sure your profile role is set to 'admin' in the Supabase profiles table.`
        );
      }
      if (error.code === '23505') {
        throw new Error(`A market with the slug "${cleanPayload.slug}" already exists. Please choose a different name or slug.`);
      }
      if (error.code === '42P01') {
        throw new Error('The markets table does not exist. Please run the database migration first.');
      }
      if (error.code === 'PGRST301') {
        throw new Error('JWT expired or invalid. Please sign out and sign back in.');
      }
      // Generic fallback with full Supabase error
      throw new Error(`Market creation failed [${error.code}]: ${error.message}${error.hint ? ` — Hint: ${error.hint}` : ''}`);
    }

    if (!data) {
      LOG.warn('createMarket() — insert returned no data (RLS may have silently rejected)');
      throw new Error(
        'Market was not created. This is usually caused by a Row Level Security policy rejecting the insert. ' +
        `Ensure your profile role is 'admin' in Supabase. User: ${session.user.email}`
      );
    }

    LOG.info(`createMarket() SUCCESS — id: ${data.id}, slug: "${data.slug}"`);
    return data;
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

    const { data, error } = await supabase
      .from('markets')
      .update(cleanUpdate)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      LOG.error(`updateMarket("${id}") failed`, error);
      if (error.code === '42501') throw new Error('Permission denied — admin role required to update markets.');
      throw new Error(`Market update failed [${error.code}]: ${error.message}`);
    }

    if (!data) {
      LOG.warn(`updateMarket("${id}") — market not found or RLS rejected update`);
      throw new Error(`Market ${id} not found or you do not have permission to update it.`);
    }

    LOG.info(`updateMarket("${id}") SUCCESS`);
    return data;
  },

  // ── DELETE market ───────────────────────────────────────────────────────────
  async deleteMarket(id: string): Promise<true> {
    const session = await requireSession('deleteMarket');

    LOG.info(`deleteMarket("${id}") — by user ${session.user.id}`);

    const { error } = await supabase
      .from('markets')
      .delete()
      .eq('id', id);

    if (error) {
      LOG.error(`deleteMarket("${id}") failed`, error);
      if (error.code === '42501') throw new Error('Permission denied — admin role required to delete markets.');
      if (error.code === '23503') throw new Error('Cannot delete — this market has shops or other records linked to it. Remove those first.');
      throw new Error(`Market deletion failed [${error.code}]: ${error.message}`);
    }

    LOG.info(`deleteMarket("${id}") SUCCESS`);
    return true;
  },
};
