// ============================================================
// WEST HOUSE — Auth.js (Supabase Edition)
// ============================================================

// Initialize Supabase Client
const supabase = window.supabase ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY) : null;

const Auth = {
    // ── Propiedades ──────────────────────────────────────────

    currentUser: null,

    // ── Lógica de Sesión (Asíncrona) ─────────────────────────

    async init() {
        if (!supabase) return;
        
        // Verificar si hay sesión activa en Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // Obtener datos del perfil desde la tabla pública
            const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', session.user.email)
                .single();
            
            if (profile) {
                this.currentUser = profile;
                localStorage.setItem('westhouse_session', JSON.stringify(profile));
            }
        } else {
            // Intentar recuperar de localStorage si no hay sesión (opcional, mejor confiar en Supabase)
            const user = localStorage.getItem('westhouse_session');
            if (user) {
                this.currentUser = JSON.parse(user);
            }
        }
    },

    async login(email, password) {
        if (!supabase) {
            console.error("Supabase no está inicializado.");
            return false;
        }

        try {
            console.log(`[AUTH] Intento de login para: ${email}`);
            
            // 1. Intentar Login en Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            if (data.user) {
                // 2. Obtener el perfil extendido desde public.users
                const { data: profile, error: profileError } = await supabase
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
        if (supabase) await supabase.auth.signOut();
        
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
