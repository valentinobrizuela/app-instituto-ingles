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

    login(email, password) {
        const users = DB.getTable('users');
        const hashedPassword = DB.hashPass(password);
        
        const user = users.find(u => u.email === email && u.password === hashedPassword);
        
        if (user) {
            // Guardar sesión (sin password por seguridad)
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
        window.location.hash = '#/login';
        this.init(); // Refresh state
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
