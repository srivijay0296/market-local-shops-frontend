const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmvsksejqvftoawkixmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdnNrc2VqcXZmdG9hd2tpeG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjMyMzgsImV4cCI6MjA4NjE5OTIzOH0.918sh7UnVFCAuB8DCm_CgRMl5IKlhs4Kl-wvsVqrfFw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function tryInsert() {
  const { data, error } = await supabase.from('markets').insert({
    name: 'Test Market',
    slug: 'test-market'
  });
  if (error) console.error(error);
  else console.log('Successfully inserted Test Market');
}

tryInsert();
