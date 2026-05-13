// ============================================================
// FIX: Asignar teacher_id correcto a cursos y alumnos
// Ejecutar con: node scripts/fix_teacher_assignments.js
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixTeacherAssignments() {
    console.log("🔧 Iniciando corrección de asignaciones docentes...\n");

    // 1. Traer todos los profesores
    const { data: teachers, error: tErr } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'teacher');

    if (tErr) { console.error("❌ Error al traer profesores:", tErr.message); return; }
    console.log(`👩‍🏫 Profesores encontrados: ${teachers.length}`);
    teachers.forEach(t => console.log(`   - [${t.id}] ${t.name} (${t.email})`));

    // 2. Traer todos los cursos
    const { data: courses, error: cErr } = await supabase
        .from('courses')
        .select('id, name, teacher_id');

    if (cErr) { console.error("❌ Error al traer cursos:", cErr.message); return; }
    console.log(`\n📚 Cursos encontrados: ${courses.length}`);

    // 3. Para cada curso, verificar si tiene teacher_id válido
    let fixedCourses = 0;
    for (const course of courses) {
        const assignedTeacher = teachers.find(t => t.id === course.teacher_id);

        if (!assignedTeacher) {
            console.log(`\n⚠️  Curso sin profesor válido: "${course.name}" (teacher_id: ${course.teacher_id})`);
            
            // Intentar asignar por nombre del curso (si el nombre del curso contiene el nombre del profe)
            const matched = teachers.find(t => 
                course.name.toLowerCase().includes(t.name.toLowerCase().split(' ')[0].toLowerCase())
            );
            
            if (matched) {
                const { error } = await supabase
                    .from('courses')
                    .update({ teacher_id: matched.id })
                    .eq('id', course.id);
                if (!error) {
                    console.log(`   ✅ Asignado a: ${matched.name}`);
                    course.teacher_id = matched.id; // actualizar referencia local
                    fixedCourses++;
                }
            } else {
                console.log(`   ❓ No se pudo auto-asignar. Asignale manualmente en el panel de Supabase.`);
            }
        } else {
            console.log(`   ✅ Curso "${course.name}" → ${assignedTeacher.name}`);
        }
    }

    // 4. Traer todos los alumnos y verificar que teacher_id sea consistente con su curso
    const { data: students, error: sErr } = await supabase
        .from('users')
        .select('id, name, course_id, teacher_id')
        .eq('role', 'student');

    if (sErr) { console.error("❌ Error al traer alumnos:", sErr.message); return; }
    console.log(`\n👨‍🎓 Verificando teacher_id de ${students.length} alumnos...`);

    let fixedStudents = 0;
    for (const student of students) {
        if (!student.course_id) continue;

        const course = courses.find(c => c.id === student.course_id);
        if (!course || !course.teacher_id) continue;

        if (String(student.teacher_id) !== String(course.teacher_id)) {
            const { error } = await supabase
                .from('users')
                .update({ teacher_id: course.teacher_id })
                .eq('id', student.id);

            if (!error) {
                const teacher = teachers.find(t => t.id === course.teacher_id);
                console.log(`   🔗 ${student.name} → ${teacher?.name || course.teacher_id}`);
                fixedStudents++;
            }
        }
    }

    console.log(`\n✅ CORRECCIÓN COMPLETADA:`);
    console.log(`   - Cursos corregidos:  ${fixedCourses}`);
    console.log(`   - Alumnos corregidos: ${fixedStudents}`);
    console.log(`\n👉 Recargá la app para ver los cambios.`);
}

fixTeacherAssignments().catch(console.error);
