const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkColumns() {
    const { data, error } = await supabase.from('courses').select('*').limit(1);
    if (!error && data.length > 0) {
        console.log("Columnas en 'courses':", Object.keys(data[0]));
    } else {
        console.error("Error o tabla vacía:", error);
    }
    
    const { data: usersData, error: uError } = await supabase.from('users').select('*').limit(1);
    if (!uError && usersData.length > 0) {
        console.log("Columnas en 'users':", Object.keys(usersData[0]));
    }
}
checkColumns();
