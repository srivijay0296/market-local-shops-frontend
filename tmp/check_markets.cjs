const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmvsksejqvftoawkixmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdnNrc2VqcXZmdG9hd2tpeG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjMyMzgsImV4cCI6MjA4NjE5OTIzOH0.918sh7UnVFCAuB8DCm_CgRMl5IKlhs4Kl-wvsVqrfFw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMarkets() {
  const { data, error } = await supabase.from('markets').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('--- MARKETS TABLE ---');
  data.forEach(m => console.log(`${m.id}: ${m.name} (${m.slug})`));
  
  const { data: fallback } = await supabase.from('fallback_markets').select('*');
  if (fallback) {
    console.log('\n--- FALLBACK_MARKETS TABLE ---');
    fallback.forEach(m => console.log(`${m.id}: ${m.name} (${m.slug})`));
  }
}

checkMarkets();
