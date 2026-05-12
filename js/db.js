// ============================================================
// WEST HOUSE — DB.js (Supabase Client Edition)
// ============================================================

const DB = {
    tables: ['users', 'courses', 'attendance', 'payments', 'materials', 'notifications', 'events', 'grades', 'rewards', 'user_rewards'],

    // Utility to get current session token if needed (Supabase JS handles this automatically usually)
    async getSession() {
        if (!sb) return null;
        const { data: { session } } = await sb.auth.getSession();
        return session;
    },

    getTable(tableName) {
        const data = localStorage.getItem(`westhouse_${tableName}`);
        return data ? JSON.parse(data) : [];
    },

    saveTable(tableName, data) {
        localStorage.setItem(`westhouse_${tableName}`, JSON.stringify(data));
    },

    async logAction(tableName, action, details) {
        // Auditoría desactivada por solicitud del usuario
        return;
    },

    // ── OPERACIONES CON SUPABASE ──

    // Custom fetch for authenticated API calls
    async authFetch(url, options = {}) {
        const session = await this.getSession();
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            'Authorization': session ? `Bearer ${session.access_token}` : ''
        };
        return fetch(url, { ...options, headers });
    },

    async insert(tableName, data) {
        if (!sb) return null;

        try {
            const { data: newRecord, error } = await sb
                .from(tableName)
                .insert([data])
                .select()
                .single();

            if (error) throw error;

            if (newRecord) {
                // Actualizar cache local
                const table = this.getTable(tableName);
                table.push(newRecord);
                this.saveTable(tableName, table);
                
                console.log(`[DB] ${tableName} insertado con éxito en Supabase`);
                this.logAction(tableName, 'INSERT', newRecord);
                return newRecord;
            }
        } catch (err) {
            console.error("Supabase Insert Error:", err.message);
            UI.showToast("Error al guardar: " + err.message, "danger");
        }
        return null;
    },

    async update(tableName, id, updatedFields) {
        if (!sb) return null;

        try {
            const { data: updatedRecord, error } = await sb
                .from(tableName)
                .update(updatedFields)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            if (updatedRecord) {
                const table = this.getTable(tableName);
                const idx = table.findIndex(t => t.id === id);
                if (idx !== -1) {
                    table[idx] = updatedRecord;
                    this.saveTable(tableName, table);
                }
                console.log(`[DB] ${tableName} ${id} actualizado en Supabase`);
                this.logAction(tableName, 'UPDATE', { id, ...updatedFields });
                return updatedRecord;
            }
        } catch (err) {
            console.error("Supabase Update Error:", err.message);
            UI.showToast("Error al actualizar: " + err.message, "danger");
        }
        return null;
    },

    async remove(tableName, id) {
        if (!sb) return;

        try {
            const { error } = await sb
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            let table = this.getTable(tableName);
            table = table.filter(t => t.id !== id);
            this.saveTable(tableName, table);
            console.log(`[DB] ${tableName} ${id} eliminado en Supabase`);
            this.logAction(tableName, 'DELETE', { id });
        } catch (err) {
            console.error("Supabase Delete Error:", err.message);
            UI.showToast("Error al eliminar: " + err.message, "danger");
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

    getStudentStatus(studentId) {
        const payments = this.getTable('payments').filter(p => String(p.student_id) === String(studentId));
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-11
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

        // Check if there is a payment for the current month
        const paidThisMonth = payments.some(p => {
            const pDate = new Date(p.date);
            return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear && p.status === 'Pagado';
        });

        if (paidThisMonth) return 'paid'; // Green

        // If not paid, check if we are past the 10th day
        if (currentDay <= 10) return 'pending'; // Yellow
        return 'overdue'; // Red
    },

    async cleanupData() {
        console.log("🛠️ Ejecutando limpieza de datos...");
        const users = this.getTable('users');
        const courses = this.getTable('courses');
        let hasChanges = false;

        // 1. Limpiar gmails temporales/placeholders
        const placeholders = ['westhouse.com', 'example.com', 'test.com', 'temp.com'];
        users.forEach(u => {
            if (u.email && placeholders.some(p => u.email.includes(p))) {
                u.email = '';
                hasChanges = true;
            }
        });

        // 2. Lógica de hermanos (Mismo apellido -> mismo gmail si falta uno)
        const families = {};
        users.forEach(u => {
            if (u.role === 'student' && u.name) {
                const parts = u.name.trim().split(' ');
                const lastName = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null;
                if (lastName) {
                    if (!families[lastName]) families[lastName] = [];
                    families[lastName].push(u);
                }
            }
        });

        Object.keys(families).forEach(name => {
            const family = families[name];
            if (family.length > 1) {
                const familyEmail = family.find(m => m.email && m.email.includes('@'))?.email;
                if (familyEmail) {
                    family.forEach(m => {
                        if (!m.email) {
                            m.email = familyEmail;
                            hasChanges = true;
                            console.log(`   🔗 Vinculando hermano: ${m.name} -> ${familyEmail}`);
                        }
                    });
                }
            }
        });

        // 3. Consistencia de profesores
        courses.forEach(c => {
            if (c.teacher_id) {
                users.forEach(u => {
                    if (String(u.course_id) === String(c.id) && String(u.teacher_id) !== String(c.teacher_id)) {
                        u.teacher_id = c.teacher_id;
                        hasChanges = true;
                    }
                });
            }
        });

        // 4. Inicializar campos de Gamificación si no existen
        users.forEach(u => {
            if (u.role === 'student') {
                if (u.xp === undefined) u.xp = 0;
                if (u.spendable_xp === undefined) u.spendable_xp = u.xp; // Inicia con su XP actual
                if (u.level === undefined) u.level = 1;
                if (!u.badges) u.badges = [];
                if (u.streak === undefined) u.streak = 0;
                if (u.last_login === undefined) u.last_login = null;
            }
        });

        if (hasChanges) {
            this.saveTable('users', users);
            console.log("   ✓ Datos saneados localmente.");
        }
    },

    // ── INIT: Sincronización completa con Supabase ──
    async init() {
        if (!sb) {
            console.warn("Supabase no inicializado. Usando caché local.");
            return;
        }

        console.log("🔄 Sincronizando con Supabase Cloud...");
        UI.showLoader();

        try {
            for (let table of this.tables) {
                const { data, error } = await sb
                    .from(table)
                    .select('*');

                if (error) {
                    // Ignorar errores de permisos (42501) si no es admin, es normal que no vea todo
                    if (error.code !== '42501') {
                        console.warn(`Error al cargar ${table}:`, error.message);
                    }
                    continue;
                }

                if (data) {
                    this.saveTable(table, data);
                    console.log(`   ✓ ${table}: ${data.length} registros`);
                }
            }
            
            await this.cleanupData();

            console.log("✅ Sincronización completada.");
        } catch (error) {
            console.error("Error crítico en DB.init:", error);
            UI.showToast("Error de sincronización con el servidor", "danger");
        } finally {
            UI.hideLoader();
        }
    }
};
