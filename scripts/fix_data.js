// script to fix user data and assignments
const fixData = async () => {
    console.log("Starting data cleanup...");
    const users = DB.getTable('users');
    const courses = DB.getTable('courses');
    const attendance = DB.getTable('attendance');
    const payments = DB.getTable('payments');

    // 1. Remove placeholder gmails
    const cleanedUsers = users.map(u => {
        if (u.email && (u.email.includes('westhouse.com') || u.email.includes('example.com') || u.email.includes('test.com'))) {
            u.email = ''; // Remove placeholder
        }
        return u;
    });

    // 2. Assign teachers to courses consistency check
    // Ensure each course's teacher_id matches the students teacher_id
    for (const course of courses) {
        if (course.teacher_id) {
            const courseStudents = cleanedUsers.filter(u => String(u.course_id) === String(course.id));
            for (const student of courseStudents) {
                if (String(student.teacher_id) !== String(course.teacher_id)) {
                    student.teacher_id = course.teacher_id;
                    console.log(`Updated teacher for student ${student.name} to match course ${course.name}`);
                }
            }
        }
    }

    // 3. Siblings logic (Simple implementation: same last name -> same email if one is missing)
    // This is a bit risky but let's try to group by last name if they have the same address or similar pattern.
    // For now, let's just ensure if we find two students with the same "parent_email" (if it exists) or similar name patterns.
    // The user said: "alumnos que son hermanos tengan el mismo gmail"
    // I'll look for students with the same last name and assign the first found email to the others if they lack one.
    const studentMap = {};
    cleanedUsers.forEach(u => {
        if (u.role === 'student' && u.name) {
            const lastName = u.name.split(' ').slice(-1)[0].toLowerCase();
            if (!studentMap[lastName]) studentMap[lastName] = [];
            studentMap[lastName].push(u);
        }
    });

    Object.keys(studentMap).forEach(lastName => {
        const family = studentMap[lastName];
        if (family.length > 1) {
            // Find a valid email in the family
            const familyEmail = family.find(member => member.email && member.email.includes('@'))?.email;
            if (familyEmail) {
                family.forEach(member => {
                    if (!member.email) {
                        member.email = familyEmail;
                        console.log(`Assigned family email ${familyEmail} to sibling ${member.name}`);
                    }
                });
            }
        }
    });

    // Save back
    DB.saveTable('users', cleanedUsers);
    
    // Sync to Supabase if possible (one by one for safety)
    for (const u of cleanedUsers) {
        await sb.from('users').update({ email: u.email, teacher_id: u.teacher_id }).eq('id', u.id);
    }

    console.log("Cleanup finished.");
};

// Execute
fixData();
