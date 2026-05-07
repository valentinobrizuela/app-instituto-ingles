const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getFullUserList() {
    console.log("Recuperando lista completa de usuarios...");
    const { data: users, error } = await supabase
        .from('users')
        .select('name, email, role')
        .order('role', { ascending: true });

    if (error) {
        console.error("Error al obtener usuarios:", error);
        return;
    }

    const adminsEmails = [
        'morebrizuela26@gmail.com',
        'brizuelavalen0@gmail.com',
        'oscararmandolujan@gmail.com',
        'maricelandrealujan@gmail.com'
    ];

    const list = users.map(u => {
        let password = 'WestHouse2026'; // Default for teachers and students
        if (u.role === 'admin' || adminsEmails.includes(u.email)) {
            password = 'AdminWestHouse2026';
        }
        return {
            Rol: u.role.toUpperCase(),
            Nombre: u.name,
            Email: u.email,
            Contraseña: password
        };
    });

    console.table(list);
    
    // Also output as JSON string for easier copying if needed
    // console.log(JSON.stringify(list, null, 2));
}

getFullUserList();
