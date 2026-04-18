const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (Usando Service Role Key para crear usuarios Auth)
const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const studentsData = [
  { "name": "Francisco", "surname": "Valles Barros", "email": "fvalles@gmail.com", "group": "Kids A2", "teacher": "Luana", "payment": "$85.000,00" },
  { "name": "Pablo", "surname": "Carrizo Gramajo", "email": "scristinagramajo+1@gmail.com", "group": "B1 Preliminary", "teacher": "Maricel", "payment": "$85.000,00" },
  { "name": "Santiago", "surname": "Carrizo Gramajo", "email": "scristinagramajo@gmail.com", "group": "Kids A1+(A)", "teacher": "Amelia", "payment": "$100.000,00" },
  { "name": "Felipe", "surname": "Parada Larrosa", "email": "marcedecara@gmail.com", "group": "B2 First A", "teacher": "Brian", "payment": "Virtual" },
  { "name": "Manuel", "surname": "Parada Larrosa", "email": "marcedecara+2@gmail.com", "group": "B1 Preliminary", "teacher": "Maricel", "payment": "$85.000,00" },
  { "name": "Evangelina", "surname": "Paz Bazan", "email": "eugebazann@gmail.com", "group": "Kids A2", "teacher": "Luana", "payment": "$85.000,00" },
  { "name": "Mateo Roman", "surname": "Pizarro", "email": "2m0a1t6eo@gmail.com", "group": "Kids A1+(A)", "teacher": "Amelia", "payment": "$85.000,00" },
  { "name": "Milena", "surname": "Daste", "email": "leguizamoav@gmail.com", "group": "B2 First A", "teacher": "Brian", "payment": "$85.000,00" },
  { "name": "Valentino Andres", "surname": "Cessano Beale", "email": "stefaniabeale@gmail.com", "group": "Kids A2", "teacher": "Luana", "payment": "$90.000,00" },
  { "name": "Benicio Giovanni", "surname": "Cessano Beale", "email": "stefaniabp5@gmail.com", "group": "Kids A1", "teacher": "Luana", "payment": "$90.000,00" },
  { "name": "Maria Josefina", "surname": "De la Colina", "email": "nataliavaras29@gmail.com", "group": "Kids A1", "teacher": "Luana", "payment": "$85.000,00" },
  { "name": "Juana", "surname": "Basso Garceron", "email": "cecigarce@hotmail.com", "group": "Pre Teens A2 A", "teacher": "Amelia", "payment": "$85.000,00" },
  { "name": "Paulina", "surname": "Pineda Cabral", "email": "elaisacabral@gmail.com", "group": "Kids A2", "teacher": "Luana", "payment": "$85.000,00" },
  { "name": "Camilo", "surname": "De la Vega Ascoeta", "email": "conty_ascoeta+1@hotmail.com", "group": "B1 Preliminary", "teacher": "Maricel", "payment": "$85.000,00" },
  { "name": "Catalina", "surname": "De la Vega Ascoeta", "email": "conty_ascoeta@hotmail.com", "group": "Kids A2", "teacher": "Luana", "payment": "$85.000,00" },
  { "name": "Delfina", "surname": "Narvaez", "email": "dnarvaez@gmail.com", "group": "Teens A2+(B)", "teacher": "Yael", "payment": "$85.000,00" },
  { "name": "Santino", "surname": "Della Barca", "email": "Santidellabarca@gmail.com", "group": "B2 First A", "teacher": "Brian", "payment": "$85.000,00" },
  { "name": "Constantino", "surname": "Della Barca", "email": "Constantinodb78@gmail.com", "group": "B1 Preliminary", "teacher": "Maricel", "payment": "$85.000,00" },
  { "name": "Pilar", "surname": "Ascoeta", "email": "daniabraham72@gmail.com", "group": "Teens A2+(A)", "teacher": "Yael", "payment": "$85.000,00" },
  { "name": "Mateo", "surname": "Gonzalez Cataldo", "email": "mlauc24@gmail.com", "group": "Kids A1 B", "teacher": "Luana", "payment": "$85.000,00" },
  { "name": "Daniela", "surname": "Martinez Masier", "email": "danielamartinezmasier@gmail.com", "group": "Adults B1", "teacher": "Amelia", "payment": "$85.000,00" },
  { "name": "Francesca", "surname": "Arrizabalaga", "email": "Anahivispo@gmail.com", "group": "Kids A1+(A)", "teacher": "Amelia", "payment": "$100.000,00" },
  { "name": "Martin", "surname": "Castro", "email": "drariverosdelavega@live.com.ar", "group": "Teens A2+(A)", "teacher": "Yael", "payment": "$100.000,00" },
  { "name": "Luka", "surname": "Aurilio", "email": "gladysferro3401@gmail.com", "group": "Kids A1+(C)", "teacher": "Luana", "payment": "$100.000,00" },
  { "name": "Luciano", "surname": "Castro Mercado", "email": "analauram.inm@gmail.com", "group": "Kids A1", "teacher": "Luana", "payment": "$100.000,00" },
  { "name": "Benjamin", "surname": "Valles Barros", "email": "fvalles+1@gmail.com", "group": "B2 First B", "teacher": "Brian", "payment": "$100.000,00" },
  { "name": "Maria Julia", "surname": "Bermuez Basso", "email": "jimebasso@gmail.com", "group": "B2 First B", "teacher": "Brian", "payment": "$100.000,00" },
  { "name": "Benicio", "surname": "Romero", "email": "romyyzurano@gmail.com", "group": "Pre Teens A2 A", "teacher": "Amelia", "payment": "$100.000,00" },
  { "name": "Victoria", "surname": "Vargas", "email": "Caromu2010@hotmail.com", "group": "Pre Teens A2 A", "teacher": "Amelia", "payment": "$100.000,00" },
  { "name": "Josefina", "surname": "Nieto Casado", "email": "ju29-sug@hotmail.com", "group": "Teens A2+(B)", "teacher": "Yael", "payment": "$100.000,00" },
  { "name": "Isabella Gianna", "surname": "Santelli", "email": "isantelli@gmail.com", "group": "Kids A1+(A)", "teacher": "Amelia", "payment": "$100.000,00" },
  { "name": "Valentino", "surname": "Santelli", "email": "isantelli+1@gmail.com", "group": "Kids A1+(A)", "teacher": "Amelia", "payment": "$100.000,00" }
];

async function migrate() {
    console.log("🚀 Iniciando migración de datos reales...");

    // 0. Limpiar datos viejos
    console.log("🧹 Limpiando base de datos...");
    await supabase.from('logs').delete().neq('id', 0);
    await supabase.from('grades').delete().neq('id', 0);
    await supabase.from('notifications').delete().neq('id', 0);
    await supabase.from('materials').delete().neq('id', 0);
    await supabase.from('payments').delete().neq('id', 0);
    await supabase.from('attendance').delete().neq('id', 0);
    await supabase.from('courses').delete().neq('id', 0);
    await supabase.from('users').delete().neq('role', 'none'); // Truncate users except admins if desired, but better all.
    
    // NOTA: Para usuarios Auth, tendríamos que borrarlos manualmente o vía admin API. 
    // Por simplicidad, el script creará usuarios nuevos o ignorará si ya existen.

    // 1. Crear Profesores únicos
    const teacherNames = [...new Set(studentsData.map(s => s.teacher))];
    const teacherIdMap = {};

    for (const tName of teacherNames) {
        console.log(`--- Creando profesor: ${tName} ---`);
        const email = `${tName.toLowerCase().replace(/\s/g, '')}@westhouse.com`;
        
        // Crear en Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email, password: 'WestHouse2026', email_confirm: true
        });

        if (authError && authError.message !== 'User already registered') {
            console.error(`Error Auth Profesor ${tName}:`, authError.message);
        }

        // Crear en Public.Users
        const { data: profile, error: profError } = await supabase
            .from('users')
            .upsert({ name: tName, email, role: 'teacher' }, { onConflict: 'email' })
            .select('id')
            .single();
        
        if (profError) console.error(`Error Perfil Profesor ${tName}:`, profError.message);
        else teacherIdMap[tName] = profile.id;
    }

    // 2. Crear Cursos únicos
    const courseGroups = [...new Set(studentsData.map(s => s.group))];
    const courseIdMap = {};

    for (const gName of courseGroups) {
        const studentRow = studentsData.find(s => s.group === gName);
        const tId = teacherIdMap[studentRow.teacher];

        const { data: course, error: cError } = await supabase
            .from('courses')
            .upsert({ name: gName, teacher_id: tId, level: gName.split(' ')[0] }, { onConflict: 'name' })
            .select('id')
            .single();

        if (cError) console.error(`Error Curso ${gName}:`, cError.message);
        else courseIdMap[gName] = course.id;
    }

    // 3. Crear Estudiantes y sus pagos
    for (const s of studentsData) {
        console.log(`--- Procesando Alumno: ${s.name} ${s.surname} ---`);

        // Crear en Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: s.email,
            password: 'WestHouse2026',
            email_confirm: true,
            user_metadata: { name: `${s.name} ${s.surname}` }
        });

        if (authError && authError.message !== 'User already registered') {
            console.error(`Error Auth Alumno ${s.name}:`, authError.message);
        }

        // Crear en Public.Users
        const { data: profile, error: profError } = await supabase
            .from('users')
            .upsert({ 
                name: `${s.name} ${s.surname}`, 
                email: s.email, 
                role: 'student',
                course_id: courseIdMap[s.group],
                teacher_id: teacherIdMap[s.teacher]
            }, { onConflict: 'email' })
            .select('id')
            .single();

        if (profError) {
            console.error(`Error Perfil Alumno ${s.name}:`, profError.message);
        } else if (profile) {
            // Crear Pago de Marzo
            const amount = parseFloat(s.payment.replace('$', '').replace(/\./g, '').replace(',', '.'));
            if (!isNaN(amount)) {
                await supabase.from('payments').insert({
                    student_id: profile.id,
                    amount: amount,
                    status: 'Pagado', // Asumimos pagado si figura el monto, o ajustar lógica
                    date: '2026-03-01'
                });
            }
        }
    }

    console.log("✅ Migración completada con éxito.");
}

migrate();
