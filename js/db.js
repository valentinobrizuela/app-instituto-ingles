// ============================================================
// WEST HOUSE — DB.js (API + Cache Edition)
// ============================================================

const API_URL = CONFIG.API_URL;

const DB = {
    tables: ['users', 'courses', 'attendance', 'payments', 'materials', 'notifications', 'events', 'grades', 'logs'],

    async authFetch(url, options = {}) {
        const token = localStorage.getItem('westhouse_token');
        const defaultHeaders = { 'Content-Type': 'application/json' };
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const finalOptions = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            }
        };
        // For file uploads, don't set Content-Type header so browser sets boundary
        if (options.body instanceof FormData) {
             delete finalOptions.headers['Content-Type'];
        }
        
        return await fetch(url, finalOptions);
    },

    hashPass(password) {
         return CryptoJS.SHA256(password).toString();
    },

    getTable(tableName) {
        const data = localStorage.getItem(`westhouse_${tableName}`);
        return data ? JSON.parse(data) : [];
    },

    saveTable(tableName, data) {
        localStorage.setItem(`westhouse_${tableName}`, JSON.stringify(data));
    },

    // ── OPERACIONES HÍBRIDAS (Síncrono en UI, Asíncrono en API) ──

    async insert(tableName, data) {
        // Enviar a la API Real primero para obtener el ID real
        try {
            const res = await this.authFetch(`${API_URL}/${tableName}`, {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const newRecord = await res.json();
                
                // Actualizar cache local con el registro real (incluyendo el ID del backend)
                const table = this.getTable(tableName);
                table.push(newRecord);
                this.saveTable(tableName, table);
                
                console.log(`[DB] ${tableName} insertado con éxito (ID: ${newRecord.id})`);
                return newRecord;
            }
        } catch (err) {
            console.error("Backend Error - Fallback to Local:", err);
        }

        // Fallback local si el backend falla (No recomendado en producción real sin reconciliación)
        const table = this.getTable(tableName);
        const newId = table.length > 0 ? Math.max(...table.map(t => t.id || 0)) + 1 : 1000; // Offset para evitar colisiones
        const localRecord = { id: newId, ...data, _pending: true };
        table.push(localRecord);
        this.saveTable(tableName, table);
        return localRecord;
    },

    async update(tableName, id, updatedFields) {
        const table = this.getTable(tableName);
        const idx = table.findIndex(t => Number(t.id) === Number(id));
        
        if (idx !== -1) {
            table[idx] = { ...table[idx], ...updatedFields };
            this.saveTable(tableName, table);

            try {
                const res = await this.authFetch(`${API_URL}/${tableName}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedFields)
                });
                if (res.ok) console.log(`[DB] ${tableName} ${id} actualizado en backend`);
            } catch (err) {
                console.error("Error sincronizando update:", err);
            }
            return table[idx];
        }
        return null;
    },

    async remove(tableName, id) {
        let table = this.getTable(tableName);
        table = table.filter(t => Number(t.id) !== Number(id));
        this.saveTable(tableName, table);

        try {
            const res = await this.authFetch(`${API_URL}/${tableName}/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) console.log(`[DB] ${tableName} ${id} eliminado en backend`);
        } catch (err) {
            console.error("Error sincronizando delete:", err);
        }
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

    // ── INIT: Carga inicial asíncrona desde API ──
    async init() {
        console.log("🔄 Sincronizando con West House Backend...");
        try {
            for (let table of this.tables) {
                const res = await this.authFetch(`${API_URL}/${table}`);
                if (res.ok) {
                    const data = await res.json();
                    this.saveTable(table, data);
                    console.log(`   ✓ ${table}: ${data.length} registros`);
                }
            }
        } catch (error) {
            console.warn("⚠️ Backend no detectado. Modo Offline con caché local.", error);
            const currentUsers = this.getTable('users');
            if (currentUsers.length < 5) {
               console.log("Iniciando Seed local por falta de datos...");
               this.seed(); 
            }
        }
    },

    seed() {
        const hp = (p) => this.hashPass(p);
        
        // 1. Admins
        const users = [
            { id: 1, name: 'Morena Brizuela', email: 'morebrizuela26@gmail.com', password: hp('morewesthouse'), role: 'admin' },
            { id: 2, name: 'Admin Prueba', email: 'admin@westhouse.com', password: hp('admin123'), role: 'admin' }
        ];

        // 2. Teachers (8)
        const teachersNames = ["John Doe", "Mary Smith", "Alan Turing", "Ada Lovelace", "Nikola Tesla", "Marie Curie", "Isaac Newton", "Grace Hopper"];
        teachersNames.forEach((name, i) => {
            users.push({
                id: 3 + i,
                name: `Profesor ${name}`,
                email: `profesor${i+1}@westhouse.com`,
                password: hp('teacher123'),
                role: 'teacher'
            });
        });

        // 3. Courses (8)
        const courses = [
            { id: 1, name: 'Inglés Beginner A', level: 'Beginner', teacherId: 3, schedule: 'Lun-Mié 18:00' },
            { id: 2, name: 'Inglés Beginner B', level: 'Beginner', teacherId: 4, schedule: 'Mar-Jue 17:00' },
            { id: 3, name: 'Inglés Intermediate A', level: 'Intermediate', teacherId: 5, schedule: 'Lun-Mié 19:00' },
            { id: 4, name: 'Inglés Intermediate B', level: 'Intermediate', teacherId: 6, schedule: 'Mar-Jue 18:00' },
            { id: 5, name: 'Inglés Advanced A', level: 'Advanced', teacherId: 7, schedule: 'Lun-Mié 20:00' },
            { id: 6, name: 'Inglés Advanced B', level: 'Advanced', teacherId: 8, schedule: 'Mar-Jue 19:00' },
            { id: 7, name: 'Conversación Pro', level: 'Advanced', teacherId: 9, schedule: 'Vie 18:00' },
            { id: 8, name: 'Kids English', level: 'Beginner', teacherId: 10, schedule: 'Vie 17:00' }
        ];

        // 4. Students (100)
        const firstNames = ["Sofia", "Mateo", "Valentina", "Santiago", "Camila", "Matías", "Valeria", "Sebastián", "Emma", "Nicolás", "Lucía", "Alejandro", "Martina", "Diego", "Catalina", "Lucas", "Isabella", "Joaquín", "Mía", "Tomás"];
        const lastNames = ["García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz", "Álvarez", "Romero", "Alonso", "Gutiérrez"];
        const levels = ['Beginner', 'Intermediate', 'Advanced'];
        const payments = [];

        for (let i = 1; i <= 100; i++) {
            const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const courseId = Math.floor(Math.random() * 8) + 1;
            const level = levels[Math.floor((courseId - 1) / 3)] || 'Beginner';
            const studentId = 11 + i;
            
            users.push({
                id: studentId,
                name: `${fName} ${lName}`,
                email: `student${i}@westhouse.com`,
                password: hp('student123'),
                role: 'student',
                age: Math.floor(Math.random() * 12) + 8,
                level: level,
                courseId: courseId,
                teacherId: courseId + 2,
                parentEmail: `parent${i}@example.com`
            });

            // Generar un pago para cada alumno
            payments.push({
                id: i,
                studentId: studentId,
                amount: 50.00,
                date: '2026-04-01',
                status: Math.random() > 0.2 ? 'Pagado' : 'Pendiente'
            });
        }

        this.saveTable('users', users);
        this.saveTable('courses', courses);
        this.saveTable('payments', payments);
        this.saveTable('attendance', []);
        this.saveTable('materials', []);
        this.saveTable('notifications', []);
        this.saveTable('events', []);
        this.saveTable('grades', []);
        this.saveTable('logs', []);
        console.log("Seed Local de 100 alumnos completado ✓");
    }
};
