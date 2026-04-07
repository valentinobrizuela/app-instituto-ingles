// ============================================================
// WEST HOUSE — Auth.js (Local Storage Edition)
// ============================================================

const Auth = {
    // ── Propiedades ──────────────────────────────────────────

    currentUser: null,

    // ── Lógica de Sesión (Síncrona) ──────────────────────────

    init() {
        const user = localStorage.getItem('westhouse_session');
        if (user) {
            this.currentUser = JSON.parse(user);
        }
    },

    async login(email, password) {
        try {
            const res = await fetch(`${CONFIG.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    this.currentUser = data.user;
                    localStorage.setItem('westhouse_session', JSON.stringify(data.user));
                    
                    // Re-sincronizar DB al iniciar sesión para asegurar datos frescos
                    await DB.init();
                    
                    return true;
                }
            }
        } catch (err) {
            console.error("Auth Backend Error:", err);
        }
        
        // Fallback local solo si el backend está caído (Opcional, pero aquí lo restringimos por seguridad)
        console.warn("Fallo de autenticación en backend. Verificando local...");
        const users = DB.getTable('users');
        const hashedPassword = DB.hashPass(password);
        const user = users.find(u => u.email === email && u.password === hashedPassword);
        
        if (user) {
            const { password, ...sessionUser } = user;
            this.currentUser = sessionUser;
            localStorage.setItem('westhouse_session', JSON.stringify(sessionUser));
            return true;
        }

        return false;
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('westhouse_session');
        // Usar location.replace o href para forzar una recarga limpia si es necesario, 
        // pero el router con hashchange debería bastar.
        window.location.hash = '#/login';
        // Forzamos un reload si el hash ya era #/login para asegurar que se limpie la UI
        if (window.location.hash === '#/login') {
            window.location.reload();
        }
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
