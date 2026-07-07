const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmvsksejqvftoawkixmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdnNrc2VqcXZmdG9hd2tpeG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjMyMzgsImV4cCI6MjA4NjE5OTIzOH0.918sh7UnVFCAuB8DCm_CgRMl5IKlhs4Kl-wvsVqrfFw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Fetching from fallback_markets...');
  const { data: fallback, error: fError } = await supabase.from('fallback_markets').select('*');
  if (fError) {
    console.error('Error fetching fallback:', fError);
    return;
  }
  
  console.log(`Found ${fallback.length} entries. Migrating to markets...`);
  
  for (const m of fallback) {
    // Basic mapping, assuming schemas are similar
    const market = {
       name: m.name,
       slug: m.slug,
       description: m.description,
       location: m.location
    };
    
    const { data, error } = await supabase.from('markets').insert([market]);
    if (error) {
       console.error(`Error inserting ${m.name}:`, error);
    } else {
       console.log(`Successfully migrated: ${m.name}`);
    }
  }
  
  console.log('\nMigration complete.');
}

migrate();
