const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkConnection() {
    console.log("Verificando conexión con Supabase...");
    const { data, error } = await supabase
        .from('users')
        .select('name, email, role')
        .limit(5);

    if (error) {
        console.error("❌ Error de conexión:", error.message);
        if (error.code === 'PGRST301') {
            console.log("Sugerencia: Parece haber un error de API Key o permisos (JWT).");
        }
    } else {
        console.log("✅ Conexión exitosa. Se encontraron usuarios reales:");
        data.forEach(u => console.log(`- [${u.role}] ${u.name} (${u.email})`));
    }
}

checkConnection();
