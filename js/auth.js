// ============================================================
// WEST HOUSE — Auth.js (Supabase Edition)
// ============================================================

const Auth = {
    // ── Propiedades ──────────────────────────────────────────

    currentUser: null,

    // ── Lógica de Sesión (Asíncrona) ─────────────────────────

    async init() {
        if (!sb) return;
        
        try {
            // Verificar si hay sesión activa en Supabase
            const { data: { session }, error: sessionError } = await sb.auth.getSession();
            
            if (sessionError) throw sessionError;

            if (session) {
                // Obtener datos del perfil desde la tabla pública
                const { data: profile, error } = await sb
                    .from('users')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();
                
                if (profile) {
                    this.currentUser = profile;
                    localStorage.setItem('westhouse_session', JSON.stringify(profile));
                } else {
                    console.warn("Sesión activa pero perfil no encontrado en public.users");
                    // Intentar recuperar de localStorage como último recurso si ya estaba logueado
                    const cachedUser = localStorage.getItem('westhouse_session');
                    if (cachedUser) this.currentUser = JSON.parse(cachedUser);
                }
            } else {
                // Si no hay sesión en Supabase, limpiar local
                localStorage.removeItem('westhouse_session');
                localStorage.removeItem('westhouse_token');
                this.currentUser = null;
            }
        } catch (err) {
            console.error("Auth Init Error:", err.message);
            // Fallback a caché local si falla la conexión
            const cachedUser = localStorage.getItem('westhouse_session');
            if (cachedUser) this.currentUser = JSON.parse(cachedUser);
        }
    },

    async login(email, password) {
        if (!sb) {
            console.error("Supabase no está inicializado.");
            return false;
        }

        try {
            console.log(`[AUTH] Intento de login para: ${email}`);
            
            // 1. Intentar Login en Supabase Auth
            const { data, error } = await sb.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            if (data.user) {
                // 2. Obtener el perfil extendido desde public.users
                const { data: profile, error: profileError } = await sb
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (profileError) {
                    console.warn("Sesión iniciada pero no se encontró perfil en public.users");
                    // Fallback: usar datos básicos del auth user
                    this.currentUser = { email: data.user.email, role: 'student', name: email.split('@')[0] };
                } else {
                    this.currentUser = profile;
                }

                localStorage.setItem('westhouse_session', JSON.stringify(this.currentUser));
                localStorage.setItem('westhouse_token', data.session.access_token);
                
                // Re-sincronizar DB local (caché)
                await DB.init();
                
                return true;
            }
        } catch (err) {
            console.error("Auth Supabase Error:", err.message);
            UI.showToast("Error de acceso: " + err.message, "error");
        }
        
        return false;
    },

    async logout() {
        if (sb) await sb.auth.signOut();
        
        this.currentUser = null;
        localStorage.removeItem('westhouse_session');
        localStorage.removeItem('westhouse_token');
        
        window.location.hash = '#/login';
        window.location.reload();
    },

    isAuthenticated() {
        return this.currentUser !== null;
    },

    hasRole(role) {
        if (!this.currentUser) return false;
        if (Array.isArray(role)) {
            return role.includes(this.currentUser.role);
        }
        return this.currentUser.role === role;
    },

    getUser() {
        return this.currentUser;
    }
};
