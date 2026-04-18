const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase config
const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function parseCSVLine(line) {
    const result = [];
    let curVal = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            result.push(curVal.trim());
            curVal = '';
        } else {
            curVal += line[i];
        }
    }
    result.push(curVal.trim());
    return result;
}

function parseCSV(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    return lines.map(parseCSVLine);
}

async function migrate() {
    console.log("🚀 Iniciando migración de todos los alumnos cruzando FORM y CAL26...");

    // 1. Leer FORM 2026 para obtener los emails
    const formRows = parseCSV('c:\\Users\\54380\\Downloads\\West House - FORM 2026.csv');
    // Remove headers
    formRows.shift();
    
    const formStudents = formRows.map(row => {
        // En tu CSV pegado, columna 1 es email, 2 es nombre, 3 es apellido
        // Ej: 2/3/2026 10:18:34,eugebazann@gmail.com,Evangelina ,Paz Bazan
        return {
            email: row[1]?.toLowerCase(),
            name: row[2]?.trim().toLowerCase(),
            surname: row[3]?.trim().toLowerCase()
        }
    }).filter(s => s.email && s.name && s.surname);

    console.log(`Leídos ${formStudents.length} alumnos del Formulario 2026.`);

    // 2. Leer CAL26 para obtener clases, pagos y docentes
    const calRows = parseCSV('c:\\Users\\54380\\Downloads\\West House - CAL26 (1).csv');
    
    // Find the starting row of data in CAL26 (where column 0 is a number like 1, 2, 3)
    const calStudents = [];
    for (let row of calRows) {
        if (row.length > 10 && !isNaN(parseInt(row[0]))) {
            calStudents.push({
                name: row[1]?.trim().toLowerCase(),
                surname: row[2]?.trim().toLowerCase(),
                group: row[9]?.trim(),
                teacher: row[10]?.trim(),
                payment: row[15]?.trim().replace('$', '').replace(/\./g, '').replace(',', '.')
            });
        }
    }
    
    console.log(`Leídos ${calStudents.length} alumnos de CAL26.`);

    // Join data: match by name and surname or just parts of it
    const mergedData = [];
    let usedEmails = new Set();
    
    // Admins and existing fixed users:
    usedEmails.add('morebrizuela26@gmail.com');
    usedEmails.add('admin@westhouse.com');
    usedEmails.add('brizuelavalen0@gmail.com');
    usedEmails.add('maricelandrealujan@gmail.com');
    usedEmails.add('oscararmandolujan@gmail.com');

    for (let c of calStudents) {
        if (!c.name || !c.surname) continue;
        
        // Find email from form
        let match = formStudents.find(f => 
            f.name.includes(c.name.split(' ')[0]) && 
            f.surname.includes(c.surname.split(' ')[0])
        );

        let email = "sin_email@westhouse.com";
        if (match) {
            email = match.email;
        } else {
            // Generate pseudo email if not found in Form
            email = `${c.name.replace(/\s/g, '')}.${c.surname.replace(/\s/g, '')}@westhouse.com`.toLowerCase();
        }

        // Handle duplicates (+1, +2, etc)
        let finalEmail = email;
        let counter = 1;
        while(usedEmails.has(finalEmail)) {
            let [user, domain] = email.split('@');
            finalEmail = `${user}+${counter++}@${domain}`;
        }
        usedEmails.add(finalEmail);

        mergedData.push({
            name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
            surname: c.surname.charAt(0).toUpperCase() + c.surname.slice(1),
            email: finalEmail,
            group: c.group,
            teacher: c.teacher,
            payment: parseFloat(c.payment) || 100000 
        });
    }

    console.log(`Listos para importar ${mergedData.length} perfiles combinados.`);

    // 0. Limpiar datos viejos
    console.log("🧹 Limpiando base de datos para los 62+ alumnos...");
    await supabase.from('logs').delete().neq('id', 0);
    await supabase.from('grades').delete().neq('id', 0);
    await supabase.from('notifications').delete().neq('id', 0);
    await supabase.from('materials').delete().neq('id', 0);
    await supabase.from('payments').delete().neq('id', 0);
    await supabase.from('attendance').delete().neq('id', 0);
    await supabase.from('courses').delete().neq('id', 0);
    await supabase.from('users').delete().eq('role', 'student'); 
    await supabase.from('users').delete().eq('role', 'teacher'); 

    // Re-crear profesores
    const teacherNames = [...new Set(mergedData.map(s => s.teacher).filter(Boolean))];
    const teacherIdMap = {};

    for (const tName of teacherNames) {
        const email = `${tName.toLowerCase().replace(/\\s/g, '')}@westhouse.com`;
        
        await supabase.auth.admin.createUser({
            email, password: 'WestHouse2026', email_confirm: true
        }).catch(e => {});

        const { data: profile } = await supabase
            .from('users')
            .upsert({ name: tName, email, role: 'teacher' }, { onConflict: 'email' })
            .select('id')
            .single();
        
        if (profile) teacherIdMap[tName] = profile.id;
    }

    // Re-crear Cursos manually ensuring uniqueness
    const courseGroups = [...new Set(mergedData.map(s => s.group).filter(Boolean))];
    const courseIdMap = {};

    for (const gName of courseGroups) {
        const studentRow = mergedData.find(s => s.group === gName);
        const tId = teacherIdMap[studentRow.teacher];

        // Ensure course doesn't exist
        let { data: existingCourse } = await supabase.from('courses').select('id').eq('name', gName).single();
        
        if (!existingCourse) {
             const { data: insertedCourse } = await supabase
                .from('courses')
                .insert({ name: gName, teacher_id: tId, level: gName.split(' ')[0] })
                .select('id')
                .single();
             existingCourse = insertedCourse;
        }

        if (existingCourse) courseIdMap[gName] = existingCourse.id;
    }

    // Insertar Estudiantes
    for (const s of mergedData) {
        console.log(`[+] Creando: ${s.name} ${s.surname} | Grupo: ${s.group} | Email: ${s.email}`);

        await supabase.auth.admin.createUser({
            email: s.email,
            password: 'WestHouse2026',
            email_confirm: true,
            user_metadata: { name: `${s.name} ${s.surname}` }
        }).catch(e => {});

        const { data: profile, error } = await supabase
            .from('users')
            .upsert({ 
                name: `${s.name} ${s.surname}`, 
                email: s.email, 
                role: 'student',
                course_id: courseIdMap[s.group] || null,
                teacher_id: teacherIdMap[s.teacher] || null
            }, { onConflict: 'email' })
            .select('id')
            .single();

        if (profile) {
            await supabase.from('payments').insert({
                student_id: profile.id,
                amount: s.payment,
                status: 'Pagado',
                date: '2026-03-01'
            });
        } else {
            console.error(`Error creando perfil para ${s.name}: ${error?.message}`);
        }
    }

    console.log("✅ MIGRA CIÓN COMPLETA. Revisa Vercel / Supabase.");
}

migrate();
