const UI = {
    // --- LOGIN RENDERER ---
    renderLogin() {
        document.body.innerHTML = `
            <div id="toast-container" class="toast-container"></div>
            <div id="global-loader" class="loader-overlay" style="z-index: 9999;"><div class="loader"></div></div>
            
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
                            <a href="#/" class="nav-link active" id="nav-dashboard"><i class="fa-solid fa-house"></i> Dashboard</a>
                        </div>

                        ${(() => {
                            const user = Auth.getUser();
                            const siblings = DB.getTable('users').filter(u => u.email === user.email && u.role === 'student');
                            if (siblings.length > 1) {
                                return `
                                    <div style="margin:1rem; padding:0.75rem; background:var(--bg-hover); border-radius:10px; border:1px solid var(--border-color)">
                                        <p style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-bottom:0.5rem">Cambiar de Alumno</p>
                                        <select style="width:100%; padding:0.4rem; border-radius:6px; border:1px solid var(--border-color); font-size:0.8rem; background:white; cursor:pointer" onchange="Auth.switchProfile(this.value)">
                                            ${siblings.map(s => `<option value="${s.id}" ${String(s.id) === String(user.id) ? 'selected' : ''}>${s.name}</option>`).join('')}
                                        </select>
                                    </div>
                                `;
                            }
                            return '';
                        })()}

                        <div class="nav-item">
                            <a href="#/about" class="nav-link" id="nav-about"><i class="fa-solid fa-leaf"></i> Quiénes Somos</a>
                        </div>
                        
                        ${Auth.hasRole('admin') ? `
                        <div class="nav-item">
                            <a href="#/users" class="nav-link" id="nav-users"><i class="fa-solid fa-user-group"></i> Alumnos</a>
                        </div>
                        <div class="nav-item">
                            <a href="#/notifications" class="nav-link" id="nav-notifs"><i class="fa-solid fa-bullhorn"></i> Comunicados</a>
                        </div>
                        ` : ''}

                        ${Auth.hasRole('admin') || Auth.hasRole('teacher') ? `
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

                        <div class="user-profile-small" onclick="window.location.hash='#/settings'" style="cursor:pointer">
                            <div class="avatar">${user.name[0]}</div>
                            <div style="flex:1; overflow:hidden">
                                <p style="font-weight:700; font-size:0.85rem; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${user.name}</p>
                                <p class="text-sm text-muted uppercase font-bold" style="font-size:0.65rem">${user.role}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <main class="main-content">
                    <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; gap: 2rem;">
                        <div id="section-header-left" style="display:flex; flex-direction:column; gap:0.25rem; flex:1">
                             <div id="breadcrumbs" class="breadcrumbs"></div>
                             <div id="section-title-wrapper"></div>
                        </div>

                        <!-- Global Search Bar (Only for Admins/Teachers) -->
                        ${!Auth.hasRole('student') ? `
                        <div class="search-container">
                            <div class="search-input-wrapper">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input type="text" class="search-input" placeholder="Buscar alumnos, cursos..." onfocus="UI.showCommandPalette()" readonly>
                                <span class="search-shortcut">Ctrl K</span>
                            </div>
                        </div>
                        ` : '<div style="flex:1"></div>'}

                        <div style="display:flex; gap:1rem; align-items:center">
                            <button class="btn" style="padding:0.4rem; background:transparent; border:none; color:var(--text-muted); font-size:1.25rem; cursor:pointer;" onclick="UI.toggleTheme()" title="Cambiar Tema">
                                <i class="fa-solid ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
                            </button>
                            <div style="position:relative">
                                <button class="btn" style="padding:0.4rem; background:transparent; border:none; color:var(--text-muted); font-size:1.25rem; cursor:pointer;" onclick="UI.toggleNotifications()">
                                    <i class="fa-regular fa-bell"></i>
                                    <span id="notif-badge" style="position:absolute; top:2px; right:2px; width:8px; height:8px; background:var(--danger); border-radius:50%; border:2px solid var(--bg-card); display:none"></span>
                                </button>
                                
                                <!-- Popover de Notificaciones -->
                                <div id="notification-popover" class="notification-popover">
                                    <div class="notification-header">
                                        <span>Notificaciones</span>
                                        <button class="btn-text" style="font-size:0.7rem; color:var(--primary)" onclick="UI.clearNotifications()">Limpiar</button>
                                    </div>
                                    <div id="notification-list" style="max-height: 300px; overflow-y: auto;">
                                        <div style="padding:2rem; text-align:center; color:var(--text-muted); font-size:0.85rem">No tienes notificaciones nuevas</div>
                                    </div>
                                </div>
                            </div>

                            <div style="width:1px; height:24px; background:var(--border-color)"></div>
                            
                            <button class="btn" style="padding:0.4rem; background:transparent; border:none; color:var(--text-muted); font-size:1.2rem; cursor:pointer;" onclick="UI.toggleTheme()" title="Modo Oscuro/Claro">
                                <i class="fa-solid fa-moon"></i>
                            </button>

                            <div style="width:1px; height:24px; background:var(--border-color)"></div>
                            
                            <div class="user-menu-container">
                                <div class="avatar-wrapper" onclick="UI.toggleUserMenu()">
                                    <div class="avatar" style="width:32px; height:32px; font-size:0.8rem">${user.name[0]}</div>
                                    <i class="fa-solid fa-chevron-down" style="font-size:0.7rem; color:var(--text-muted)"></i>
                                </div>
                                
                                <div id="user-menu-dropdown" class="user-menu-dropdown">
                                    <div class="user-menu-header">
                                        <p style="font-weight:700; margin:0">${user.name}</p>
                                        <p style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase">${user.role}</p>
                                    </div>
                                    <div style="padding:0.5rem 0">
                                        <a href="#/settings" class="user-menu-item"><i class="fa-solid fa-user-gear"></i> Mi Perfil</a>
                                        ${user.role === 'admin' ? `<a href="#/settings" class="user-menu-item"><i class="fa-solid fa-building-columns"></i> Configuración</a>` : ''}
                                        <hr style="border:0; border-top:1px solid var(--border-color); margin:0.5rem 0">
                                        <a href="javascript:void(0)" onclick="Auth.logout()" class="user-menu-item" style="color:var(--danger)">
                                            <i class="fa-solid fa-power-off"></i> Cerrar Sesión
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div id="router-view"></div>

                    <!-- Menú de WhatsApp (Multi-contacto) -->
                    <div id="wa-menu" class="wa-menu">
                        <div class="wa-menu-header">¿Con quién quieres hablar?</div>
                        <a href="https://wa.me/5493804135270?text=Hola%20Directora%20Maricel,%20le%20escribo%20desde%20la%20App%20del%20Instituto." 
                           target="_blank" class="wa-menu-item">
                            <i class="fa-brands fa-whatsapp"></i>
                            <div class="contact-info">
                                <span class="contact-name">Maricel</span>
                                <span class="contact-role">Directora del Instituto</span>
                            </div>
                        </a>
                        <a href="https://wa.me/5491176086865?text=Hola%20Morena,%20tengo%20una%20consulta%20administrativa%20desde%20la%20App." 
                           target="_blank" class="wa-menu-item">
                            <i class="fa-brands fa-whatsapp"></i>
                            <div class="contact-info">
                                <span class="contact-name">Morena Brizuela</span>
                                <span class="contact-role">Secretaria</span>
                            </div>
                        </a>
                    </div>

                    <!-- Botón Flotante WhatsApp -->
                    <button class="wa-floating" onclick="UI.toggleWhatsAppMenu()" title="Consultas por WhatsApp">
                        <i class="fa-brands fa-whatsapp"></i>
                    </button>
                </main>

                <!-- Floating Mila -->
                <div class="mila-floating-btn" onclick="UI.toggleMilaChat()" title="Hablar con Mila">
                    <img src="img/mila.png" alt="Mila AI">
                </div>
                <div id="mila-floating-chat" class="mila-floating-chat">
                    <div class="mila-chat-header">
                        <img src="img/mila.png" style="width:30px; height:30px; border-radius:50%; background:white">
                        <div style="flex:1">
                            <p style="font-weight:700; font-size:0.9rem; margin:0">Mila — Tu Asistente</p>
                            <p id="mila-status" style="font-size:0.65rem; margin:0; opacity:0.8">En línea</p>
                        </div>
                        <i class="fa-solid fa-xmark" style="cursor:pointer" onclick="UI.toggleMilaChat()"></i>
                    </div>
                    <div class="mila-chat-body">
                        <div id="mila-messages" class="mila-messages-container">
                            <!-- Los mensajes aparecerán aquí -->
                        </div>
                        <div class="mila-chat-input-area">
                            <input type="text" id="mila-input" class="mila-chat-input" placeholder="Pregúntame algo..." onkeydown="if(event.key === 'Enter') UI.Mila.sendMessage()">
                            <button class="mila-send-btn" onclick="UI.Mila.sendMessage()">
                                <i class="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.initTheme();
    },

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

    showSkeleton(containerId, type = 'table', rows = 5) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = '';
        if (type === 'table') {
            html = `
                <div class="skeleton-title mb-4"></div>
                ${Array(rows).fill(0).map(() => `
                    <div style="display:flex; gap:1rem; margin-bottom:1rem">
                        <div class="skeleton" style="width:40px; height:40px; border-radius:50%"></div>
                        <div style="flex:1">
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton" style="width:50%"></div>
                        </div>
                    </div>
                `).join('')}
            `;
        } else if (type === 'cards') {
            html = `
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:1.5rem">
                    ${Array(rows).fill(0).map(() => `<div class="skeleton skeleton-card"></div>`).join('')}
                </div>
            `;
        }
        container.innerHTML = html;
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
        modalLayer.className = "modal-overlay";
        modalLayer.style = "position:fixed; inset:0; background:rgba(0, 0, 0, 0.4); backdrop-filter:blur(4px); z-index:1500; display:flex; align-items:center; justify-content:center; padding:1rem; opacity:0; transition:opacity 0.2s;";
        
        // Cierra al hacer clic fuera del card
        modalLayer.onclick = (e) => {
            if (e.target === modalLayer) UI.closeModal(modalId);
        };

        modalLayer.innerHTML = `
            <div class="card modal-content" style="width:100%; max-width:550px; margin:0; animation:slideUp 0.3s ease-out; max-height: 90vh; overflow-y: auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color); position: sticky; top: 0; background: var(--bg-card); z-index: 10;">
                    <h3 style="font-family:'Outfit'">${title}</h3>
                    <button class="btn" style="padding:0.4rem; background: var(--primary-light); color: var(--primary)" onclick="UI.closeModal('${modalId}')"><i class="fa-solid fa-xmark"></i></button>
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
    },

    downloadCSV(filename, data) {
        if (!data || !data.length) return;
        
        const csvRows = [];
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                let val = row[header] === null || row[header] === undefined ? '' : row[header];
                const escaped = ('' + val).replace(/"/g, '""'); // CSV escape double quotes
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },

    setSectionTitle(title, icon = '') {
        const wrapper = document.getElementById('section-title-wrapper');
        if (wrapper) {
            wrapper.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.75rem">
                    <button class="mobile-nav-toggle" onclick="UI.toggleSidebar()">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                    <h2 style="font-family:'Outfit'; font-size:1.25rem; margin:0; display:flex; align-items:center; gap:0.5rem">
                        ${icon ? `<i class="${icon}" style="color:var(--primary); font-size:1rem"></i>` : ''}
                        ${title}
                    </h2>
                </div>
            `;
        }
    },

    composeEmail(recipient, subject = '', body = '') {
        const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
    },

    toggleWhatsAppMenu() {
        const menu = document.getElementById('wa-menu');
        if (menu) {
            menu.classList.toggle('active');
            
            // Cerrar al hacer clic fuera
            if (menu.classList.contains('active')) {
                const closeHandler = (e) => {
                    if (!menu.contains(e.target) && !e.target.closest('.wa-floating')) {
                        menu.classList.remove('active');
                        document.removeEventListener('click', closeHandler);
                    }
                };
                setTimeout(() => document.addEventListener('click', closeHandler), 10);
            }
        }
    },

    // --- PROFESSIONAL UPGRADES ---
    renderBreadcrumbs() {
        const hash = window.location.hash || '#/';
        const container = document.getElementById('breadcrumbs');
        if (!container) return;

        const parts = hash.replace('#/', '').split('/').filter(p => p);
        let html = `<span class="breadcrumb-item"><a href="#/" style="color:inherit;text-decoration:none">Inicio</a></span>`;
        
        parts.forEach((part, index) => {
            const isLast = index === parts.length - 1;
            const label = part.charAt(0).toUpperCase() + part.slice(1);
            html += `<span class="breadcrumb-item ${isLast ? 'active' : ''}">${label}</span>`;
        });

        container.innerHTML = html;
    },

    showCommandPalette() {
        if (document.querySelector('.command-palette-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'command-palette-overlay';
        overlay.onclick = (e) => {
            if (e.target === overlay) UI.hideCommandPalette();
        };

        overlay.innerHTML = `
            <div class="command-palette">
                <div class="command-palette-search">
                    <i class="fa-solid fa-magnifying-glass text-muted"></i>
                    <input type="text" class="command-palette-input" placeholder="¿Qué estás buscando? (Esc para salir)" autofocus oninput="UI.handleSearch(this.value)">
                </div>
                <div id="command-results" class="command-palette-results">
                    <div style="padding:2rem; text-align:center; color:var(--text-muted)">
                        Escribe para buscar alumnos, cursos o materiales...
                    </div>
                </div>
                <div style="padding:0.75rem 1.5rem; background:var(--bg-main); border-top:1px solid var(--border-color); font-size:0.7rem; color:var(--text-muted); display:flex; gap:1.5rem">
                    <span><kbd style="background:#eee;padding:2px 4px;border-radius:4px">↑↓</kbd> Navegar</span>
                    <span><kbd style="background:#eee;padding:2px 4px;border-radius:4px">Enter</kbd> Seleccionar</span>
                    <span><kbd style="background:#eee;padding:2px 4px;border-radius:4px">Esc</kbd> Cerrar</span>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.querySelector('.command-palette-input').focus();

        // Esc listener
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                UI.hideCommandPalette();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    hideCommandPalette() {
        const overlay = document.querySelector('.command-palette-overlay');
        if (overlay) overlay.remove();
    },

    handleSearch(term) {
        const results = Search.query(term);
        const container = document.getElementById('command-results');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-muted)">No se encontraron resultados para "${term}"</div>`;
            return;
        }

        container.innerHTML = results.map((res, index) => `
            <div class="command-result-item" onclick="UI.navigateSearch('${res.link}')">
                <div class="command-result-icon">
                    <i class="${res.icon}"></i>
                </div>
                <div style="flex:1">
                    <div style="font-weight:600; color:var(--text-main)">${res.title}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted)">${res.subtitle}</div>
                </div>
                <div class="badge badge-info" style="font-size:0.6rem">${res.type}</div>
            </div>
        `).join('');
    },

    navigateSearch(link) {
        this.hideCommandPalette();
        window.location.hash = link;
    },

    toggleNotifications() {
        const popover = document.getElementById('notification-popover');
        if (popover) {
            popover.classList.toggle('active');
            
            if (popover.classList.contains('active')) {
                this.renderNotifications();
                const closeHandler = (e) => {
                    if (!popover.contains(e.target) && !e.target.closest('[onclick="UI.toggleNotifications()"]')) {
                        popover.classList.remove('active');
                        document.removeEventListener('click', closeHandler);
                    }
                };
                setTimeout(() => document.addEventListener('click', closeHandler), 10);
            }
        }
    },

    renderNotifications() {
        const user = Auth.getUser();
        const allNotifs = DB.getTable('notifications');
        const notifs = allNotifs.filter(n => n.target === 'all' || n.target === user.role).slice(-5).reverse();
        
        const container = document.getElementById('notification-list');
        const badge = document.getElementById('notif-badge');

        if (notifs.length === 0) {
            container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-muted); font-size:0.85rem">No hay comunicados oficiales</div>`;
            if (badge) badge.style.display = 'none';
            return;
        }

        if (badge) badge.style.display = 'block';

        container.innerHTML = notifs.map(n => `
            <div style="padding:1rem; border-bottom:1px solid var(--border-color); cursor:pointer" onclick="UI.showAnnouncementDetail('${n.id}')">
                <div style="display:flex; gap:0.75rem">
                    <div style="width:8px; height:8px; background:var(--primary); border-radius:50%; margin-top:5px"></div>
                    <div style="flex:1">
                        <p style="font-size:0.85rem; font-weight:700; margin-bottom:0.25rem">${n.title}</p>
                        <p style="font-size:0.7rem; color:var(--text-muted)">${new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showAnnouncementDetail(id) {
        const n = DB.getTable('notifications').find(notif => String(notif.id) === String(id));
        if (!n) return;

        UI.openModal(n.title, `
            <div style="padding:1rem">
                <div class="text-muted text-sm mb-4"><i class="fa-solid fa-calendar-day"></i> Fecha: ${new Date(n.created_at).toLocaleString()}</div>
                <div style="font-size:1.1rem; line-height:1.6; white-space:pre-wrap">${n.message}</div>
                <div class="mt-5 pt-3" style="border-top:1px solid var(--border-color); text-align:center">
                    <button class="btn btn-primary" onclick="UI.closeModal()">Entendido</button>
                </div>
            </div>
        `);
        
        // Track view (simple)
        if (n.views === undefined) n.views = 0;
        n.views++;
        DB.update('notifications', n.id, { views: n.views });
    },

    toggleUserMenu() {
        const menu = document.getElementById('user-menu-dropdown');
        if (menu) {
            menu.classList.toggle('active');
            
            if (menu.classList.contains('active')) {
                const closeHandler = (e) => {
                    if (!menu.contains(e.target) && !e.target.closest('.avatar-wrapper')) {
                        menu.classList.remove('active');
                        document.removeEventListener('click', closeHandler);
                    }
                };
                setTimeout(() => document.addEventListener('click', closeHandler), 10);
            }
        }
    },

    // --- MILA AI ASSISTANT ---
    Mila: {
        isInitialized: false,

        initChat() {
            if (this.isInitialized) return;
            const container = document.getElementById('mila-messages');
            if (!container) return;

            this.addMessage("¡Hola! Soy **Mila**, tu asistente de West House. Puedo decirte tus horarios, notas, estado de cuenta o responder dudas sobre el instituto. ¿En qué te ayudo hoy? 🐾", true);
            this.isInitialized = true;
        },

        async sendMessage() {
            const input = document.getElementById('mila-input');
            const text = input.value.trim();
            if (!text) return;

            input.value = '';
            this.addMessage(text, false);

            // Mostrar estado "Escribiendo..."
            const status = document.getElementById('mila-status');
            const originalStatus = status.innerText;
            status.innerText = "Escribiendo...";
            
            const typingId = 'typing-' + Date.now();
            this.showTyping(typingId);

            try {
                const response = await MilaAI.getResponse(text);
                
                // Simular delay natural
                setTimeout(() => {
                    this.removeTyping(typingId);
                    this.addMessage(response, true);
                    status.innerText = originalStatus;
                }, 1000);
            } catch (err) {
                this.removeTyping(typingId);
                this.addMessage("Miau... tuve un problema para procesar eso. ¿Podrías intentar de nuevo? 🐾", true);
                status.innerText = originalStatus;
            }
        },

        addMessage(text, isBot) {
            const container = document.getElementById('mila-messages');
            if (!container) return;

            const msgDiv = document.createElement('div');
            msgDiv.className = `mila-msg ${isBot ? 'mila-msg-bot' : 'mila-msg-user'}`;
            
            // Markdown básico (negritas y links)
            let formattedText = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:inherit; text-decoration:underline">$1</a>')
                .replace(/\n/g, '<br>');

            msgDiv.innerHTML = formattedText;
            container.appendChild(msgDiv);
            container.scrollTop = container.scrollHeight;
        },

        showTyping(id) {
            const container = document.getElementById('mila-messages');
            const typingDiv = document.createElement('div');
            typingDiv.id = id;
            typingDiv.className = 'mila-msg mila-msg-bot typing';
            typingDiv.innerHTML = '<span></span><span></span><span></span>';
            container.appendChild(typingDiv);
            container.scrollTop = container.scrollHeight;
        },

        removeTyping(id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        },

        getSuggestion(type, context = {}) {
            if (type === 'attendance_risk') {
                return `Mila notó que <strong>${context.name}</strong> ha faltado un par de veces. ¿Le mandamos un saludito para que no se pierda nada? 🐾`;
            }
            if (type === 'payment_reminder') {
                return `¡Hola! Mila sugiere recordarle amablemente a la familia de ${context.name} sobre la cuota pendiente. ¡Miau! 🐈`;
            }
            if (type === 'welcome_student') {
                return `¡Bienvenido de nuevo! Mila está feliz de verte. ¡Hoy es un gran día para aprender inglés! 🌟`;
            }
            return "¡Hola! Soy Mila, tu asistente. ¿En qué puedo ayudarte hoy?";
        },

        speak(message, containerId = 'mila-bubble-container') {
            const container = document.getElementById(containerId);
            if (!container) return;

            container.innerHTML = `
                <div class="mila-wrapper">
                    <img src="img/mila.png" class="mila-avatar" alt="Mila AI">
                    <div class="mila-bubble">
                        ${message}
                        <div class="mila-bubble-arrow"></div>
                    </div>
                </div>
            `;
        }
    },

    initTheme() {
        const savedTheme = localStorage.getItem('westhouse_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('westhouse_theme', next);
        UI.renderLayout(); // Re-render to update icon and styles
        UI.showToast(`Modo ${next === 'dark' ? 'Oscuro' : 'Claro'} activado`, 'info');
    },

    toggleMilaChat() {
        const chat = document.getElementById('mila-floating-chat');
        if (chat) {
            chat.classList.toggle('active');
            if (chat.classList.contains('active')) {
                this.Mila.initChat();
                setTimeout(() => document.getElementById('mila-input').focus(), 300);
            }
        }
    },

    clearNotifications() {
        const container = document.getElementById('notification-list');
        const badge = document.getElementById('notif-badge');
        container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-muted); font-size:0.85rem">No tienes notificaciones nuevas</div>`;
        if (badge) badge.style.display = 'none';
    }
};
