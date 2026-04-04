// ============================================================
// WEST HOUSE — DB.js (Local Storage Edition)
// ============================================================

const DB = {
    // ── Utilidades ──────────────────────────────────────────

    hashPass(password) {
        return CryptoJS.SHA256(password).toString();
    },

    // ── CRUD Básico (Síncrono) ───────────────────────────────

    getTable(tableName) {
        const data = localStorage.getItem(`westhouse_${tableName}`);
        return data ? JSON.parse(data) : [];
    },

    saveTable(tableName, data) {
        localStorage.setItem(`westhouse_${tableName}`, JSON.stringify(data));
    },

    insert(tableName, data) {
        const table = this.getTable(tableName);
        const newId = table.length > 0 ? Math.max(...table.map(t => t.id || 0)) + 1 : 1;
        const newRecord = { id: newId, ...data };
        table.push(newRecord);
        this.saveTable(tableName, table);
        return newRecord;
    },

    update(tableName, id, updatedFields) {
        const table = this.getTable(tableName);
        const idx = table.findIndex(t => t.id === Number(id));
        if (idx !== -1) {
            table[idx] = { ...table[idx], ...updatedFields };
            this.saveTable(tableName, table);
            return table[idx];
        }
        return null;
    },

    remove(tableName, id) {
        let table = this.getTable(tableName);
        table = table.filter(t => t.id !== Number(id));
        this.saveTable(tableName, table);
    },

    paginate(array, page, limit) {
        const index = (page - 1) * limit;
        return {
            data: array.slice(index, index + limit),
            totalPages: Math.ceil(array.length / limit),
            totalItems: array.length,
            currentPage: page
        };
    },

    // ── INIT ─────────────────────────────────────────────────

    init() {
        // Si no hay usuarios, cargar seed inicial
        if (this.getTable('users').length === 0) {
            this.seed();
        }
        console.log("Base de Datos Local (Storage) Inicializada ✓");
    },

    // ── SEED (Datos Iniciales) ───────────────────────────────

    seed() {
        const hp = (p) => this.hashPass(p);

        const users = [
            { id: 1, name: 'Morena Brizuela',  email: 'morebrizuela26@gmail.com',               password: hp('morewesthouse'),   role: 'admin' },
            { id: 2, name: 'Oscar Lujan',       email: 'oscararmandolujan@gmail.com',             password: hp('oscarwesthouse'),  role: 'admin' },
            { id: 3, name: 'Maricel Lujan',     email: 'maricelandrealujan@gmail.com',            password: hp('maricelwesthouse'), role: 'admin' },
            { id: 4, name: 'Valeria Brizuela',  email: 'valbrizuela@cef-sanfrancisco-lr.edu.ar',  password: hp('valenwesthouse'),  role: 'admin' },
            { id: 5, name: 'Profesor John Doe', email: 'john@teacher.com',  password: hp('teacher123'), role: 'teacher' },
            { id: 6, name: 'Profesora Mary Smith', email: 'mary@teacher.com', password: hp('teacher123'), role: 'teacher' },
            { id: 7, name: 'Alumno Carlos', email: 'carlos@student.com', password: hp('student123'), role: 'student', age: 15, level: 'Intermediate', courseId: 1, teacherId: 5, parentEmail: 'roberto@parent.com' },
            { id: 8, name: 'Alumna Sofia',  email: 'sofia@student.com',  password: hp('student123'), role: 'student', age: 14, level: 'Beginner',      courseId: 1, teacherId: 5, parentEmail: 'laura@parent.com' },
            { id: 9, name: 'Alumno Luis',   email: 'luis@student.com',   password: hp('student123'), role: 'student', age: 16, level: 'Advanced',      courseId: 2, teacherId: 6, parentEmail: 'carmen@parent.com' }
        ];

        const courses = [
            { id: 1, name: 'Inglés Beginner',      level: 'Beginner',      teacherId: 5, schedule: 'Lun-Mié 18:00' },
            { id: 2, name: 'Inglés Advanced',       level: 'Advanced',      teacherId: 6, schedule: 'Mar-Jue 19:00' },
            { id: 3, name: 'Inglés Intermediate',   level: 'Intermediate',  teacherId: 5, schedule: 'Vie 17:00' }
        ];

        const attendance = [
            { id: 1, courseId: 1, studentId: 7, date: '2026-03-25', status: 'Presente' },
            { id: 2, courseId: 1, studentId: 8, date: '2026-03-25', status: 'Ausente'  }
        ];

        const payments = [
            { id: 1, studentId: 7, amount: 50.00, date: '2026-03-01', status: 'Pagado'   },
            { id: 2, studentId: 8, amount: 50.00, date: '2026-03-01', status: 'Atrasado' },
            { id: 3, studentId: 9, amount: 60.00, date: '2026-03-01', status: 'Pendiente' }
        ];

        const materials = [
            { id: 1, courseId: 1, title: 'Class 1 PDF Drive Link',    type: 'link', url: 'https://drive.google.com/file/d/sample/view', addedBy: 1 },
            { id: 2, courseId: 1, title: 'Present Simple Video YT',   type: 'link', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', addedBy: 1 }
        ];

        const notifications = [
            { id: 1, senderId: 1, targetRole: 'all', message: '¡Bienvenidos al nuevo sistema de West House!', date: new Date().toISOString(), readBy: [] }
        ];

        const events = [
            { id: 1, title: 'Examen de Nivelación', start: '2026-03-28T10:00:00', end: '2026-03-28T12:00:00', type: 'Exam', courseId: 1 }
        ];

        this.saveTable('users', users);
        this.saveTable('courses', courses);
        this.saveTable('attendance', attendance);
        this.saveTable('payments', payments);
        this.saveTable('materials', materials);
        this.saveTable('notifications', notifications);
        this.saveTable('events', events);

        console.log("Seed Local completado ✓");
    }
};
