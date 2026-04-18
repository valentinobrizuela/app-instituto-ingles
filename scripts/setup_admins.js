const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const admins = [
    { name: 'Morena Brizuela', email: 'morebrizuela26@gmail.com' },
    { name: 'Valentino Brizuela', email: 'brizuelavalen0@gmail.com' },
    { name: 'Oscar Lujan', email: 'oscararmandolujan@gmail.com' },
    { name: 'Maricel Lujan', email: 'maricelandrealujan@gmail.com' }
];

async function createAdmins() {
    console.log("🛠️ Configurando Cuentas de Administradores...");

    for (let admin of admins) {
        console.log(`\nProcesando a ${admin.email}...`);

        // 1. Crear en Supabase Auth directamente para que TENGAN CONTRASEÑA obligatoria
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
            email: admin.email,
            password: 'AdminWestHouse2026', // <--- ESTA SERÁ LA CONTRASEÑA
            email_confirm: true,
            user_metadata: { name: admin.name }
        });

        if (authErr) {
            if (authErr.message.includes('already been registered') || authErr.message.includes('already registered')) {
                console.log(`El usuario ya existía en Auth. Forzando el reseteo de la contraseña a la nueva...`);
                
                // Vamos a actualizar la clave para asegurarnos de que la nueva sea AdminWestHouse2026
                // Primero buscamos el ID del usuario auth
                const { data: listData } = await supabase.auth.admin.listUsers();
                const existingUser = listData.users.find(u => u.email === admin.email);
                
                if (existingUser) {
                    await supabase.auth.admin.updateUserById(existingUser.id, {
                        password: 'AdminWestHouse2026'
                    });
                    console.log(`✅ Contraseña reseteada obligatoriamente para ${admin.email}`);
                }
            } else {
                console.error(`❌ Error en Auth para ${admin.email}:`, authErr.message);
                continue;
            }
        } else {
            console.log(`✅ Usuario creado en Auth: ${admin.email}`);
        }

        // 2. Asegurar en la tabla public.users que tengan el ROL correcto
        const { error: dbErr } = await supabase
            .from('users')
            .upsert({ 
                name: admin.name, 
                email: admin.email, 
                role: 'admin' 
            }, { onConflict: 'email' });

        if (dbErr) {
            console.error(`❌ Error guardando en public.users para ${admin.email}:`, dbErr.message);
        } else {
            console.log(`✅ Rol de ADMIN asegurado en public.users para ${admin.email}`);
        }
    }

    console.log("\n🚀 Todos los administradores han sido configurados correctamente.");
}

createAdmins();
