const Search = {
    query(term) {
        if (!term || term.length < 2) return [];
        
        const normalizedTerm = term.toLowerCase().trim();
        const results = [];

        // Search Users (Students/Teachers)
        const users = DB.getTable('users');
        users.forEach(u => {
            if (u.name.toLowerCase().includes(normalizedTerm) || u.email.toLowerCase().includes(normalizedTerm)) {
                results.push({
                    id: u.id,
                    title: u.name,
                    subtitle: u.role.charAt(0).toUpperCase() + u.role.slice(1),
                    icon: u.role === 'teacher' ? 'fa-solid fa-chalkboard-user' : 'fa-solid fa-user-graduate',
                    type: 'user',
                    link: u.role === 'student' ? '#/users' : '#/dashboard' // Adjust link if teacher view exists
                });
            }
        });

        // Search Courses
        const courses = DB.getTable('courses');
        courses.forEach(c => {
            if (c.name.toLowerCase().includes(normalizedTerm)) {
                results.push({
                    id: c.id,
                    title: c.name,
                    subtitle: c.schedule,
                    icon: 'fa-solid fa-book',
                    type: 'course',
                    link: '#/courses'
                });
            }
        });

        // Search Materials
        const materials = DB.getTable('materials');
        materials.forEach(m => {
            if (m.title.toLowerCase().includes(normalizedTerm)) {
                results.push({
                    id: m.id,
                    title: m.title,
                    subtitle: m.level || 'General',
                    icon: 'fa-solid fa-file-lines',
                    type: 'material',
                    link: '#/materials'
                });
            }
        });

        // Limit results
        return results.slice(0, 10);
    }
};
