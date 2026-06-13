// Crear tablas usando el método correcto: Supabase REST API con función RPC
// Como no hay exec_sql, vamos a usar node-postgres directamente vía el connection string
// El connection string de Supabase siempre es:
// postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

// Sin embargo, no tenemos el password. Alternativa: usar fetch a la API de query.
// La API correcta para ejecutar SQL raw en Supabase es:
// POST https://[ref].supabase.co/rest/v1/rpc/[function]
// O usar el endpoint undocumentado de admin

// Dado que no tenemos acceso directo a SQL, vamos a crear las tablas
// insertando un registro vacío para forzar un error diferente o 
// usando la API de PostgREST para inferir si las tablas existen.

// La mejor solución es usar el cliente Supabase con la service key
// para hacer INSERT con datos, ya que si la tabla no existe dará error diferente.

// SOLUCIÓN: Crear un edge function o usar la CLI. 
// Como alternativa inmediata, vamos a intentar con el endpoint interno de Supabase

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Check what columns logs table actually has
async function checkLogsColumns() {
    // Try inserting without table_name to see what columns exist
    const { data, error } = await supabase.from('logs').insert([{
        action: 'SCHEMA_CHECK',
        details: '{"check": true}'
    }]).select();
    
    if (error) {
        console.log('logs insert error (no table_name):', error.message);
    } else {
        console.log('logs columns:', Object.keys(data[0]));
        console.log('Sample row:', data[0]);
        // Clean up test row
        await supabase.from('logs').delete().eq('id', data[0].id);
    }
}

// Try to check if quizzes table exists now or needs creating
async function checkMissingTables() {
    const tables = ['assignments', 'assignment_submissions', 'quizzes', 'quiz_questions', 'quiz_results', 'rewards', 'user_rewards'];
    
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (error) {
            console.log(`❌ ${t}: ${error.message}`);
        } else {
            console.log(`✅ ${t}: exists`);
        }
    }
}

// Check users table for gamification columns
async function checkUsersColumns() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (!error && data.length > 0) {
        console.log('\nUsers columns:', Object.keys(data[0]));
    }
}

async function run() {
    console.log('=== Checking Supabase Schema ===\n');
    await checkLogsColumns();
    console.log('\n=== Checking Missing Tables ===');
    await checkMissingTables();
    await checkUsersColumns();
}

run().catch(console.error);
