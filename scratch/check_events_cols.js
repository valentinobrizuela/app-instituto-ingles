const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    // Let's insert a temporary row or just query table description if possible
    // In Supabase we can do a request to pg_columns or just check what error we get, or look at postgrest columns
    const { data, error } = await supabase.from('events').insert({ title: 'Test event', start: new Date().toISOString(), type: 'Class' }).select();
    if (error) {
        console.error('Insert error:', error.message);
    } else {
        console.log('Inserted row columns:', Object.keys(data[0]));
        // cleanup
        await supabase.from('events').delete().eq('id', data[0].id);
    }
}
check();
