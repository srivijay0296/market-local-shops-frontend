import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.group('🌌 Nexus Environmental Node Check');
console.log('📡 Supabase URL Found:', !!supabaseUrl, supabaseUrl ? `→ ${supabaseUrl}` : '❌ MISSING');
console.log('🔑 Supabase KEY Found:', !!supabaseKey);

const isLegacyJwt = supabaseKey?.startsWith('eyJ');
const isPublishable = supabaseKey?.startsWith('sb_publishable_');

if (!isLegacyJwt && !isPublishable) {
  console.error(
    '🚨 UNRECOGNIZED KEY FORMAT: VITE_SUPABASE_ANON_KEY should start with "eyJ" (legacy anon key) ' +
    'or "sb_publishable_" (current publishable key).'
  );
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Nexus Protocol Violation: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}
console.groupEnd();

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { 'x-app-name': 'namma-market' },
    },
  }
);

supabase.auth.getSession().then(({ data }) => {
  const role = data.session?.user?.role ?? 'anon';
  console.log(`🔐 Supabase Session Role: ${role}`);
}).catch(() => console.log('🔐 Supabase Session Role: anon (no session)'));

export const isCalibrated = !!supabaseUrl && !!supabaseKey && (isLegacyJwt || isPublishable);
export default supabase;
