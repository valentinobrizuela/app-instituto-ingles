const UI = {
    // --- LOGIN RENDERER ---
    renderLogin() {
        document.body.innerHTML = `
            <div class="login-screen">
                <div class="login-card">
                    <div style="text-align:center; margin-bottom:2.5rem">
                        <div class="logo-icon" style="margin: 0 auto 1.5rem; width: 60px; height: 60px; font-size: 1.75rem;">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                        <h1 class="brand-name" style="font-size:1.75rem; color:var(--primary); margin-bottom:0.5rem">West House</h1>
                        <p class="text-muted">English School — Management System</p>
                    </div>
                    
                    <form id="login-form" onsubmit="UI.handleLogin(event)">
                        <div class="form-group">
                            <label><i class="fa-regular fa-envelope"></i> Correo Electrónico</label>
                            <input type="email" id="email" class="form-control" placeholder="nombre@ejemplo.com" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fa-solid fa-key"></i> Contraseña</label>
                            <input type="password" id="password" class="form-control" placeholder="••••••••" required>
                        </div>
                        <div style="margin-top:2rem">
                            <button type="submit" class="btn btn-primary w-full" style="padding:0.85rem; font-size:1rem">
                                <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
                            </button>
                        </div>
                    </form>
                    
                    <div style="margin-top:2rem; padding-top:1.5rem; border-top:1px solid #eee; text-align:center">
                        <p class="text-sm text-muted">¿Eres nuevo alumno? Contacta a administración para tu acceso.</p>
                    </div>
                </div>
            </div>
        `;
    },

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        this.showLoader();
        try {
            const success = await Auth.login(email, password);
            if (success) {
                this.showToast('¡Bienvenido de nuevo!', 'success');
                window.location.hash = '#/';
            } else {
                this.hideLoader();
                this.showToast('Credenciales incorrectas', 'danger');
            }
        } catch (err) {
            this.hideLoader();
            this.showToast('Error de conexión', 'danger');
        }
    },

    // --- MAIN LAYOUT ---
    renderLayout() {
        const user = Auth.getUser();

        document.body.innerHTML = `
            <div id="toast-container" class="toast-container"></div>
            <div id="global-loader" class="loader-overlay"><div class="loader"></div></div>

            <div class="app-layout">
                <div class="sidebar-overlay" onclick="UI.toggleSidebar()"></div>
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <div class="logo-icon"><i class="fa-solid fa-house-chimney-window"></i></div>
                        <span class="brand-name">West House</span>
                    </div>

                    <nav class="nav-links">
                        <div class="nav-item">
                            <a href="#/" class="nav-link" id="nav-home"><i class="fa-solid fa-chart-pie"></i> ${Auth.hasRole('student') ? 'Mi Portal' : 'Dashboard'}</a>
                        </div>
                        <div class="nav-item">
                            <a href="#/about" class="nav-link" id="nav-about"><i class="fa-solid fa-leaf"></i> Quiénes Somos</a>
                        </div>
                        
                        ${Auth.hasRole('admin') ? `
                        <div class="nav-item">
                            <a href="#/users" class="nav-link" id="nav-users"><i class="fa-solid fa-user-group"></i> Alumnos</a>
                        </div>
                        ` : ''}

                        ${!Auth.hasRole('student') ? `
                        <div class="nav-item">
                            <a href="#/courses" class="nav-link" id="nav-courses"><i class="fa-solid fa-graduation-cap"></i> Cursos</a>
                        </div>
                        <div class="nav-item">
                            <a href="#/attendance" class="nav-link" id="nav-attendance"><i class="fa-solid fa-calendar-check"></i> Asistencia</a>
                        </div>
                        <div class="nav-item">
                            <a href="#/payments" class="nav-link" id="nav-payments"><i class="fa-solid fa-file-invoice-dollar"></i> Pagos</a>
                        </div>
                        <div class="nav-item">
                            <a href="#/grades" class="nav-link" id="nav-grades"><i class="fa-solid fa-star"></i> Calificaciones</a>
                        </div>
                        ` : ''}

                        <div class="nav-item">
                            <a href="#/materials" class="nav-link" id="nav-materials"><i class="fa-solid fa-folder-open"></i> Materiales</a>
                        </div>
                        
                        <div class="nav-item">
                            <a href="#/calendar" class="nav-link" id="nav-calendar"><i class="fa-solid fa-calendar-days"></i> Calendario</a>
                        </div>
                    </nav>

                    <div class="sidebar-footer">
                        <div id="install-pwa-container" style="display:none; margin-bottom: 1rem;">
                            <button class="btn btn-primary w-full" onclick="UI.installApp()" style="background:var(--success); font-size:0.8rem; padding:0.5rem">
                                <i class="fa-solid fa-download"></i> Descargar App
                            </button>
                        </div>

                        <div class="user-profile-small">
                            <div class="avatar">${user.name[0]}</div>
                            <div style="flex:1; overflow:hidden">
                                <p style="font-weight:700; font-size:0.85rem; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${user.name}</p>
                                <p class="text-sm text-muted uppercase font-bold" style="font-size:0.65rem">${user.role}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <main class="main-content">
                    <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                        <div id="section-title-wrapper">
                             <button class="mobile-nav-toggle" onclick="UI.toggleSidebar()">
                                 <i class="fa-solid fa-bars"></i>
                             </button>
                             <!-- Dinámico -->
                        </div>
                        <div style="display:flex; gap:1rem; align-items:center">
                            <div style="position:relative">
                                <i class="fa-regular fa-bell" style="font-size:1.25rem; color:var(--text-muted)"></i>
                                <span style="position:absolute; top:-5px; right:-5px; width:8px; height:8px; background:var(--danger); border-radius:50%; border:2px solid #fff"></span>
                            </div>
                            <div style="width:1px; height:24px; background:var(--border-color)"></div>
                            <button class="btn" style="padding:0.4rem; background:transparent; border:none; color:var(--text-muted); font-size:1.2rem; cursor:pointer;" onclick="UI.toggleTheme()" title="Modo Oscuro/Claro">
                                <i class="fa-solid fa-moon"></i>
                            </button>
                            <div style="width:1px; height:24px; background:var(--border-color)"></div>
                            <p class="text-sm font-bold text-muted">${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                            
                            <div style="width:1px; height:24px; background:var(--border-color)"></div>
                            <button class="btn logout-btn-top" onclick="Auth.logout()" title="Cerrar Sesión">
                                <i class="fa-solid fa-power-off"></i>
                            </button>
                        </div>
                    </header>

                    <div id="router-view"></div>
                </main>
            </div>
        `;
        this.initTheme();
    },

    initTheme() {
        const theme = localStorage.getItem('westhouse_theme') || 'light';
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    },

    toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('westhouse_theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('westhouse_theme', 'dark');
        }
    },

    updateActiveNavLink() {
        const hash = window.location.hash || '#/';
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === hash) link.classList.add('active');
        });
        
        // Cierra la sidebar si estamos en móvil al navegar
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }
    },

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        }
    },

    // --- UTILS ---
    showLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('active');
    },

    hideLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.remove('active');
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = '<i class="fa-solid fa-circle-info"></i>';
        if (type === 'success') icon = '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i>';
        if (type === 'danger') icon = '<i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i>';

        toast.innerHTML = `${icon} <span style="font-weight:600">${message}</span>`;
        if (container) {
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
        }
    },

    openModal(title, content) {
        // Simple modal creator
        const modalId = 'modal-' + Date.now();
        const modalLayer = document.createElement('div');
        modalLayer.id = modalId;
        modalLayer.style = "position:fixed; inset:0; background:rgba(67, 20, 7, 0.4); backdrop-filter:blur(4px); z-index:1500; display:flex; align-items:center; justify-content:center; padding:1rem; opacity:0; transition:opacity 0.2s;";

        modalLayer.innerHTML = `
            <div class="card" style="width:100%; max-width:500px; margin:0; animation:slideUp 0.3s ease-out">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color)">
                    <h3 style="font-family:'Outfit'">${title}</h3>
                    <button class="btn" style="padding:0.4rem" onclick="UI.closeModal('${modalId}')"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div id="modal-body">${content}</div>
            </div>
        `;

        document.body.appendChild(modalLayer);
        setTimeout(() => modalLayer.style.opacity = "1", 10);
    },

    closeModal(id) {
        const modal = id ? document.getElementById(id) : document.querySelector('[id^="modal-"]');
        if (modal) {
            modal.style.opacity = "0";
            setTimeout(() => modal.remove(), 200);
        }
    },

    // --- PWA INSTALLATION ---
    showInstallButton() {
        const container = document.getElementById('install-pwa-container');
        if (container) container.style.display = 'block';
    },

    async installApp() {
        const promptEvent = window.deferredPrompt;
        if (!promptEvent) return;

        // Mostrar el prompt nativo
        promptEvent.prompt();

        // Ver qué eligió el usuario
        const { outcome } = await promptEvent.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // Limpiar
        window.deferredPrompt = null;
        document.getElementById('install-pwa-container').style.display = 'none';
    }
};
