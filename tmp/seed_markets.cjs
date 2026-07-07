const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmvsksejqvftoawkixmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdnNrc2VqcXZmdG9hd2tpeG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjMyMzgsImV4cCI6MjA4NjE5OTIzOH0.918sh7UnVFCAuB8DCm_CgRMl5IKlhs4Kl-wvsVqrfFw';
const supabase = createClient(supabaseUrl, supabaseKey);

// STABLE FALLBACK DATA (Used if DB is empty)
const INITIAL_MARKETS = [
  { 
    name: 'BT Market', 
    slug: 'bt-market', 
    description: 'One of the oldest and busiest markets in Bargur for traditional textiles.', 
    location: 'Bargur Main Road',
    image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800'
  },
  { 
    name: 'Ayyapa Market', 
    slug: 'ayyapa-market', 
    description: 'Famous for cotton fabrics and daily wear garments.', 
    location: 'Market St, Bargur',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800'
  },
  { 
    name: 'Surat Market', 
    slug: 'surat-market', 
    description: 'Wholesale hub for Surat silks and printed sarees.', 
    location: 'Bargur Industrial Area',
    image_url: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=80&w=800'
  },
  { 
    name: 'Mahalakshmi Market', slug: 'mahalakshmi-market', description: 'Premium silk sarees and bridal collection hub.', location: 'West Car St, Bargur',
    image_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800'
  },
  { 
    name: 'ABC Market', slug: 'abc-market', description: 'Modern textile plaza with a variety of lifestyle brands.', location: 'New Market Complex, Bargur',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800'
  },
];

async function seedMarkets() {
  console.log('--- SEEDING SYSTEM (MARKETS) ---');
  
  // 1. TRY DYNAMIC MIGRATION FIRST
  console.log('Fetching source data from legacy table...');
  const { data: legacy, error: fetchError } = await supabase.from('fallback_markets').select('*');

  let queue = [...INITIAL_MARKETS];
  if (!fetchError && legacy && legacy.length > 0) {
    console.log(`Retrieved ${legacy.length} records dynamically. Merging with defaults...`);
    const existingSlugs = new Set(queue.map(m => m.slug));
    legacy.forEach(l => {
        if (!existingSlugs.has(l.slug)) queue.push(l);
    });
  }
  
  console.log(`Queue ready: ${queue.length} unique market zones to commit.`);
  
  for (const m of queue) {
    const { error } = await supabase.from('markets').upsert(m, { onConflict: 'slug' });
    if (error) console.error(`❌ Saving ${m.name}:`, error.message);
    else console.log(`✅ Committed ${m.name}`);
  }
  
  console.log('Seeding process finalized.');
}

seedMarkets();
