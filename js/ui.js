// UI Component Management
const UI = {
    showLoader() {
        document.getElementById('global-loader').style.display = 'flex';
    },

    hideLoader() {
        setTimeout(() => {
            document.getElementById('global-loader').style.display = 'none';
        }, 500); 
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = type === 'success' ? '<i class="fa-solid fa-check-circle text-success"></i>' : '<i class="fa-solid fa-circle-exclamation text-danger"></i>';
        
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                ${icon}
                <span>${message}</span>
            </div>
            <button class="btn" onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted)"><i class="fa-solid fa-times"></i></button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            if(container.contains(toast)) {
                toast.style.animation = 'slideLeft 0.3s reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
    },

    renderLayout() {
        const user = Auth.getUser();
        if(!user) return; 

        const app = document.getElementById('app');
        
        let sidebarLinks = '';
        if(user.role === 'admin') {
            sidebarLinks = `
                <a href="#/" class="nav-item"><i class="fa-solid fa-table-columns"></i> Dashboard</a>
                <a href="#/users" class="nav-item"><i class="fa-solid fa-users-gear"></i> Gestión Usuarios</a>
                <a href="#/courses" class="nav-item"><i class="fa-solid fa-graduation-cap"></i> Cursos Académicos</a>
                <a href="#/attendance" class="nav-item"><i class="fa-regular fa-calendar-check"></i> Asistencia Global</a>
                <a href="#/payments" class="nav-item"><i class="fa-solid fa-money-check-dollar"></i> Finanzas</a>
                <a href="#/materials" class="nav-item"><i class="fa-solid fa-folder-open"></i> Materiales</a>
                <a href="#/calendar" class="nav-item"><i class="fa-regular fa-calendar-days"></i> Calendario</a>
                <a href="#/notifications" class="nav-item"><i class="fa-solid fa-bullhorn"></i> Avisos Institucionales</a>
            `;
        } else if (user.role === 'teacher') {
            sidebarLinks = `
                <a href="#/" class="nav-item"><i class="fa-solid fa-table-columns"></i> Dashboard Principal</a>
                <a href="#/courses" class="nav-item"><i class="fa-solid fa-book"></i> Mis Cursos</a>
                <a href="#/attendance" class="nav-item"><i class="fa-regular fa-calendar-check"></i> Lista de Asistencia</a>
                <a href="#/materials" class="nav-item"><i class="fa-solid fa-cloud-arrow-down"></i> Mis Materiales</a>
                <a href="#/calendar" class="nav-item"><i class="fa-regular fa-calendar-days"></i> Calendario</a>
            `;
        } else if (user.role === 'student') {
            sidebarLinks = `
                <a href="#/" class="nav-item"><i class="fa-solid fa-table-columns"></i> Panel Estudiante</a>
                <a href="#/courses" class="nav-item"><i class="fa-solid fa-book-open"></i> Mi Programa</a>
                <a href="#/attendance" class="nav-item"><i class="fa-regular fa-calendar-check"></i> Registro de Asistencia</a>
                <a href="#/materials" class="nav-item"><i class="fa-solid fa-folder-open"></i> Material Complementario</a>
                <a href="#/calendar" class="nav-item"><i class="fa-regular fa-calendar-days"></i> Calendario de Clases</a>
            `;
        }

        const unreadNotifs = DB.getTable('notifications').filter(n => !n.readBy || !n.readBy.includes(user.id)).length;
        
        app.innerHTML = `
            <div class="app-layout">
                <aside class="sidebar" id="sidebar">
                    <div class="sidebar-header" style="justify-content:center">
                        <i class="fa-solid fa-building-columns text-primary" style="font-size:1.5rem"></i> 
                        <span style="margin-left:8px; font-family:'Outfit',sans-serif; letter-spacing:-0.5px" class="side-text">WEST HOUSE</span>
                    </div>
                    <nav class="sidebar-nav">
                        ${sidebarLinks}
                    </nav>
                </aside>
                
                <div class="main-wrapper">
                    <header class="navbar">
                        <div class="flex items-center gap-4">
                            <button id="toggle-sidebar" class="btn" style="background:none;border:none;font-size:1.2rem;color:var(--text-muted)"><i class="fa-solid fa-bars-staggered"></i></button>
                            <div class="navbar-search" style="box-shadow:inset var(--shadow-sm)">
                                <i class="fa-solid fa-magnifying-glass text-muted"></i>
                                <input type="text" placeholder="Buscar alumnos, cursos o materiales...">
                            </div>
                        </div>
                        
                        <div class="navbar-right">
                            <div class="notification-bell" id="bell-icon" style="transition:0.2s; padding:0.5rem; border-radius:50%; background:var(--bg-color)">
                                <i class="fa-regular fa-bell"></i>
                                ${unreadNotifs > 0 ? `<span class="notification-badge" style="animation: pulse 2s infinite">${unreadNotifs}</span>` : ''}
                            </div>
                            <div class="user-profile" id="user-menu-btn" style="padding:0.4rem; border-radius:30px; border:1px solid var(--border-color); background:#fff">
                                <div class="user-avatar" style="background:var(--primary); font-size:1.1rem">${user.name.charAt(0)}</div>
                                <div style="padding-right:0.5rem">
                                    <div style="font-weight:700;font-size:0.9rem;color:var(--text-main)">${user.name.split(' ')[0]}</div>
                                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:capitalize;font-weight:500;">${user.role === 'student' ? 'Alumno' : user.role === 'teacher' ? 'Profesor' : 'Administrador'}</div>
                                </div>
                                <i class="fa-solid fa-angle-down text-muted" style="margin-right:0.5rem; font-size:0.8rem"></i>
                                
                                <div class="dropdown-menu" id="user-dropdown">
                                    <div class="dropdown-item" style="color:var(--primary)"><i class="fa-regular fa-id-badge"></i> Mi Perfil</div>
                                    <div class="dropdown-item" id="logout-btn" style="color:var(--danger)"><i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión</div>
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    <main class="main-content" id="router-view" style="position:relative">
                        <!-- Vistas inyectadas aqui -->
                    </main>
                </div>
            </div>
        `;

        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
            document.querySelectorAll('.side-text').forEach(el => el.style.display = document.getElementById('sidebar').classList.contains('collapsed') ? 'none' : 'inline');
        });

        const userDropdownBtn = document.getElementById('user-menu-btn');
        userDropdownBtn.addEventListener('click', () => {
            document.getElementById('user-dropdown').classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if(!userDropdownBtn.contains(e.target)) {
                document.getElementById('user-dropdown').classList.remove('show');
            }
        });

        // Evento Campanita
        document.getElementById('bell-icon').addEventListener('click', () => {
            window.location.hash = '#/notifications';
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            Auth.logout();
            UI.showToast("Sesión cerrada", "success");
        });

        this.updateActiveNavLink();
    },

    updateActiveNavLink() {
        const hash = window.location.hash || '#/';
        document.querySelectorAll('.nav-item').forEach(el => {
            if (el.getAttribute('href') === hash) el.classList.add('active');
            else el.classList.remove('active');
        });
    },

    renderLogin() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="login-screen">
                <div class="card login-card shadow-lg" style="border-top:6px solid var(--primary); padding:3rem">
                    <div class="login-logo mb-2" style="font-family:'Outfit', sans-serif">
                        <i class="fa-solid fa-building-columns" style="font-size:2.5rem; color:var(--primary); margin-bottom:1rem"></i><br/>
                        WEST HOUSE
                    </div>
                    <p class="text-muted" style="margin-bottom:2.5rem; letter-spacing:1px; font-weight:500">ENGLISH SCHOOL</p>
                    
                    <form id="login-form">
                        <div class="form-group text-left" style="text-align:left;">
                            <label style="color:var(--text-muted); font-size:0.8rem; text-transform:uppercase">Correo Electrónico</label>
                            <div style="position:relative">
                                <i class="fa-solid fa-envelope" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:#aaa"></i>
                                <input type="email" id="login-email" class="form-control" placeholder="ejemplo@westhouse.com" required style="padding-left:2.5rem">
                            </div>
                        </div>
                        <div class="form-group text-left" style="text-align:left; margin-bottom:2rem; margin-top:1rem">
                            <label style="color:var(--text-muted); font-size:0.8rem; text-transform:uppercase">Contraseña</label>
                            <div style="position:relative">
                                <i class="fa-solid fa-lock" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:#aaa"></i>
                                <input type="password" id="login-password" class="form-control" placeholder="••••••••" required style="padding-left:2.5rem">
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-full" style="padding:1rem; font-size:1.1rem; border-radius:8px; box-shadow:0 4px 14px rgba(255,122,0,0.4)"><i class="fa-solid fa-arrow-right-to-bracket"></i> Ingresar de Forma Segura</button>
                    </form>

                    <div style="margin-top:2.5rem;font-size:0.85rem;color:var(--text-muted);text-align:left;background:#f8fafc;padding:1.2rem;border-radius:8px;border:1px solid #e2e8f0;line-height:1.6">
                        <strong><i class="fa-solid fa-key"></i> Administradores Disponibles:</strong><br/>
                        <code style="color:var(--primary)">morebrizuela26@gmail.com</code> (pass: morewesthouse)<br/>
                        <code style="color:var(--primary)">maricelandrealujan@gmail.com</code> (pass: maricelwesthouse)<br/><br/>
                        <strong>Roles Base:</strong><br/>
                        Profesor: <code>john@teacher.com</code> (teacher123)<br/>
                        Alumno: <code>carlos@student.com</code> (student123)
                    </div>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            UI.showLoader();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            
            const success = Auth.login(email, pass);
            if(success) {
                window.location.hash = '#/';
                UI.showToast('Acceso Correcto. Iniciando Sistema', 'success');
            } else {
                document.getElementById('login-email').classList.add('invalid');
                document.getElementById('login-password').classList.add('invalid');
                UI.showToast('Email o Contraseña inválidos', 'error');
            }
            UI.hideLoader();
        });
    },

    openModal(title, htmlContent) {
        let modalOverlay = document.getElementById('global-modal');
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'global-modal';
            modalOverlay.className = 'modal-overlay';
            document.body.appendChild(modalOverlay);
        }
        
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 style="font-size:1.5rem; color:var(--text-main)">${title}</h2>
                    <button class="modal-close" onclick="UI.closeModal()">&times;</button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y:auto; padding-right:1rem">
                    ${htmlContent}
                </div>
            </div>
        `;
        
        modalOverlay.classList.add('show');
    },

    closeModal() {
        const modalOverlay = document.getElementById('global-modal');
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
            setTimeout(() => modalOverlay.remove(), 200);
        }
    },

    getSkeletonHTML(type = 'table', count = 5) {
        if (type === 'table') {
            return `
                <div class="card p-0 shadow-sm" style="overflow:hidden">
                    <div style="padding:1.25rem; border-bottom:1px solid #e2e8f0; background:#f8fafc;">
                        <div class="skeleton-box skeleton-title" style="width:200px"></div>
                    </div>
                    ${Array(count).fill(0).map(() => `
                        <div style="padding:1rem 1.5rem; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between">
                            <div style="flex:1"><div class="skeleton-box skeleton-text short"></div><div class="skeleton-box skeleton-text" style="width:30%"></div></div>
                            <div style="flex:1" class="hidden-mobile"><div class="skeleton-box skeleton-text"></div></div>
                            <div style="flex:1" class="hidden-mobile"><div class="skeleton-box skeleton-text short"></div></div>
                            <div style="width:100px"><div class="skeleton-box skeleton-text"></div></div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (type === 'cards') {
            return `
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:1.5rem;">
                    ${Array(count).fill(0).map(() => `
                        <div class="card shadow-md skeleton-box" style="height:250px;"></div>
                    `).join('')}
                </div>
            `;
        }
        return ``;
    }
};
