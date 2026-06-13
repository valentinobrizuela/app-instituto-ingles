// ============================================================
// WEST HOUSE — DB.js (Supabase Client Edition)
// ============================================================

const DB = {
    tables: ['users', 'courses', 'attendance', 'payments', 'materials', 'notifications', 'events', 'grades', 'conversation_slots', 'bookings', 'waitlist', 'rewards', 'user_rewards', 'quizzes', 'quiz_questions', 'quiz_results', 'assignments', 'assignment_submissions'],
    _memoryCache: new Map(),
    _channels: {},

    // Utility to get current session token if needed
    async getSession() {
        if (!sb) return null;
        const { data: { session } } = await sb.auth.getSession();
        return session;
    },

    getTable(tableName) {
        return this._memoryCache.get(tableName) || [];
    },

    saveTable(tableName, data) {
        this._memoryCache.set(tableName, data);
        // Despachar evento global para reactividad en la UI
        window.dispatchEvent(new CustomEvent(`db_update_${tableName}`, { detail: data }));
    },

    async logAction(tableName, action, details) {
        if (!sb) return;
        try {
            const session = await this.getSession();
            const email = session?.user?.email || 'sistema';
            await sb.from('logs').insert([{
                user_id: null, // Asignado por trigger de Postgres usando el email de la sesión si es necesario
                action: action,
                table_name: tableName,
                details: JSON.stringify(details)
            }]);
        } catch (err) {
            console.error("Error al registrar auditoría:", err.message);
        }
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
                // Actualizar cache local en memoria
                const table = this.getTable(tableName);
                table.push(newRecord);
                this.saveTable(tableName, table);
                
                console.log(`[DB] ${tableName} insertado con éxito en Supabase`);
                await this.logAction(tableName, 'INSERT', newRecord);
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
                await this.logAction(tableName, 'UPDATE', { id, ...updatedFields });
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
            await this.logAction(tableName, 'DELETE', { id });
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
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

        // Verificar pago para el mes actual
        const paidThisMonth = payments.some(p => {
            const pDate = new Date(p.date);
            return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear && p.status === 'Pagado';
        });

        if (paidThisMonth) return 'paid'; // Verde

        // Si no está pagado, verificar si estamos antes del día 10
        if (currentDay <= 10) return 'pending'; // Amarillo
        return 'overdue'; // Rojo
    },

    async cleanupData() {
        console.log("🛠️ Ejecutando limpieza de datos...");
        const users = this.getTable('users');
        const courses = this.getTable('courses');
        let hasChanges = false;

        const placeholders = ['example.com', 'test.com', 'temp.com'];
        users.forEach(u => {
            if (u.email && placeholders.some(p => u.email.includes(p))) {
                u.email = '';
                hasChanges = true;
            }
        });

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

        users.forEach(u => {
            if (u.role === 'student') {
                if (u.xp === undefined) u.xp = 0;
                if (u.spendable_xp === undefined) u.spendable_xp = u.xp;
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

    // Suscribir tablas a realtime de Supabase para mantener el caché en memoria actualizado
    subscribeRealtime() {
        if (!sb) return;

        this.tables.forEach(table => {
            if (this._channels[table]) {
                sb.removeChannel(this._channels[table]);
            }

            this._channels[table] = sb.channel(`public:${table}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: table }, (payload) => {
                    let currentData = this.getTable(table);
                    
                    if (payload.eventType === 'INSERT') {
                        // Evitar duplicados si ya fue insertado localmente de forma optimista
                        if (!currentData.some(item => item.id === payload.new.id)) {
                            currentData.push(payload.new);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const idx = currentData.findIndex(item => item.id === payload.new.id);
                        if (idx !== -1) {
                            currentData[idx] = payload.new;
                        } else {
                            currentData.push(payload.new);
                        }
                    } else if (payload.eventType === 'DELETE') {
                        currentData = currentData.filter(item => item.id !== payload.old.id);
                    }

                    this.saveTable(table, currentData);
                })
                .subscribe();
        });
        console.log("📡 Suscripciones Supabase Realtime activadas para todas las tablas.");
    },

    // ── INIT: Sincronización completa con Supabase ──
    async init() {
        if (!sb) {
            console.warn("Supabase no inicializado. Usando caché local vacío.");
            return;
        }

        console.log("🔄 Sincronizando con Supabase Cloud...");
        UI.showLoader();

        try {
            // Limpiar caché en RAM antes de repoblar
            this._memoryCache.clear();

            for (let table of this.tables) {
                const { data, error } = await sb
                    .from(table)
                    .select('*');

                if (error) {
                    if (error.code !== '42501') {
                        console.warn(`Error al cargar ${table}:`, error.message);
                    }
                    continue;
                }

                if (data) {
                    this.saveTable(table, data);
                    console.log(`   ✓ ${table}: ${data.length} registros cargados en RAM`);
                }
            }
            
            await this.cleanupData();
            this.subscribeRealtime();

            console.log("✅ Sincronización completada.");
        } catch (error) {
            console.error("Error crítico en DB.init:", error);
            UI.showToast("Error de sincronización con el servidor", "danger");
        } finally {
            UI.hideLoader();
        }
    }
};
