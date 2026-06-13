const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkColumns() {
    const tables = ['courses', 'users', 'events', 'payments', 'attendance', 'materials', 'notifications', 'quizzes', 'assignments', 'logs'];
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (!error) {
            if (data.length > 0) {
                console.log(`Columnas en '${t}':`, Object.keys(data[0]));
            } else {
                console.log(`Tabla '${t}' existe pero está vacía.`);
            }
        } else {
            console.error(`Error en '${t}':`, error.message);
        }
    }
}
checkColumns();
