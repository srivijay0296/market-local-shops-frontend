import { supabase } from '../src/lib/supabase';

async function listMarkets() {
  const { data, error } = await supabase.from('markets').select('id, name, slug');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

listMarkets();
