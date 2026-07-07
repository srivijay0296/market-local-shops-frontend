import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking markets table schema...");
    const { data, error } = await supabase.from('markets').select('*').limit(1);
    if (error) {
        console.error("Schema Check Error:", error);
    } else {
        console.log("Markets Columns:", data.length > 0 ? Object.keys(data[0]) : "Empty table");
    }
}

checkSchema();
