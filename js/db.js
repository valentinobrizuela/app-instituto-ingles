// ============================================================
// WEST HOUSE — DB.js (Supabase Client Edition)
// ============================================================

const DB = {
    tables: ['users', 'courses', 'attendance', 'payments', 'materials', 'notifications', 'events', 'grades', 'logs'],

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

    // ── OPERACIONES CON SUPABASE ──

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
                return newRecord;
            }
        } catch (err) {
            console.error("Supabase Insert Error:", err.message);
            UI.showToast("Error al guardar: " + err.message, "error");
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
                return updatedRecord;
            }
        } catch (err) {
            console.error("Supabase Update Error:", err.message);
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
        } catch (err) {
            console.error("Supabase Delete Error:", err.message);
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
                    console.warn(`Error al cargar ${table}:`, error.message);
                    continue;
                }

                if (data) {
                    this.saveTable(table, data);
                    console.log(`   ✓ ${table}: ${data.length} registros`);
                }
            }
            console.log("✅ Sincronización completada.");
        } catch (error) {
            console.error("Error crítico en DB.init:", error);
        } finally {
            UI.hideLoader();
        }
    }
};
