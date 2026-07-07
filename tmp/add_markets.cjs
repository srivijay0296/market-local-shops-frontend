const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmvsksejqvftoawkixmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdnNrc2VqcXZmdG9hd2tpeG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjMyMzgsImV4cCI6MjA4NjE5OTIzOH0.918sh7UnVFCAuB8DCm_CgRMl5IKlhs4Kl-wvsVqrfFw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function manageMarkets() {
  console.log('--- MARKETPLAY DIRECTORY (Live DB: fallback_markets) ---');
  
  // 1. FETCH DYNAMIC DATA
  const { data: markets, error: fetchError } = await supabase
    .from('fallback_markets')
    .select('*')
    .order('id', { ascending: true });
    
  if (fetchError) {
    console.error('FETCH ERROR:', fetchError.message);
    return;
  }
  
  console.log(`Current Status: ${markets.length} active market zones found.\n`);
  
  // 2. RENDER DIRECTORY
  console.log('--- ACTIVE TEXTILE HUBS ---');
  markets.forEach((m, i) => {
    console.log(`${i + 1}. [${m.id}] ${m.name}`);
    console.log(`   Slug: ${m.slug}`);
    console.log(`   Loc:  ${m.location}`);
    console.log(`   Desc: ${m.description?.slice(0, 50)}...`);
    console.log('   -----------------------------------');
  });
  
  console.log('\nDynamic data retrieval complete.');
}

manageMarkets();
