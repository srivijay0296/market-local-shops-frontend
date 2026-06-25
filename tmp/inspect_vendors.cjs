const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vntghvukwukqoxofvxtx.supabase.co'; // Using project URL from metadata if available, otherwise just mock
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
  const { data, error } = await supabase.from('vendors').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Columns:', data?.[0] ? Object.keys(data[0]) : 'No data in table');
  }
}

inspectTable();
