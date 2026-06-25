// Diagnosing markets table schema
const supabaseUrl = 'https://tmvsksejqvftoawkixmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdnNrc2VqcXZmdG9hd2tpeG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjMyMzgsImV4cCI6MjA4NjE5OTIzOH0.918sh7UnVFCAuB8DCm_CgRMl5IKlhs4Kl-wvsVqrfFw';

async function checkSchema() {
    console.log("Checking markets table schema via direct fetch...");
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/markets?select=*&limit=1`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            console.log("Markets Columns:", data.length > 0 ? Object.keys(data[0]) : "Empty table");
        } else {
            console.error("Fetch Error:", data);
        }
    } catch (err) {
        console.error("Request failed:", err);
    }
}

checkSchema();
