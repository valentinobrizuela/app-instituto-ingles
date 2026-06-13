// Bootstrapper y Router
const App = {
    async init() {
        try {
            UI.initTheme();
            console.log("Iniciando West House OS (Backend Ready)...");

            // PWA Service Worker Registration
            if ('serviceWorker' in navigator) {
                try {
                    const reg = await navigator.serviceWorker.register('./sw.js');
                    console.log('Service Worker Registered:', reg.scope);
                } catch (err) {
                    console.warn('Service Worker Registration Failed:', err);
                }
            }

            // PWA Install Prompt Handling
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
                UI.showInstallButton();
            });

            // Sincronización de Datos (Backend unificado)
            await DB.init();
            await Auth.init();
            
            // Command Palette Shortcut
            window.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    if (Auth.hasRole('student')) return;
                    e.preventDefault();
                    UI.showCommandPalette();
                }
            });

            console.log("✓ Sistema sincronizado con backend.");

            // Listener de rutas
            window.addEventListener('hashchange', () => {
                requestAnimationFrame(() => this.router());
            });

            // Ejecuta ruta inicial con RAF
            requestAnimationFrame(() => this.router());
        } catch (error) {
            document.body.innerHTML = `<div style="padding:4rem;text-align:center;color:red;font-family:sans-serif"><h1>Error Crítico de Inicialización</h1><p>${error.message}</p><pre style="text-align:left;background:#eee;padding:1rem">${error.stack}</pre></div>`;
            console.error("Critical Init Error:", error);
        }
    },

    async loadView(viewName) {
        if (window.Views && window.Views[viewName]) return;
        
        let fileName = viewName.charAt(0).toLowerCase() + viewName.slice(1);
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `js/views/${fileName}.js?v=6`;
            script.async = true;
            script.onload = () => {
                console.log(`[LazyLoad] Loaded: ${viewName}`);
                resolve();
            };
            script.onerror = (err) => {
                console.error(`[LazyLoad] Failed to load: ${viewName}`);
                reject(new Error(`Failed to load view: ${viewName}`));
            };
            document.body.appendChild(script);
        });
    },

    async router() {
        try {
            let path = window.location.hash.split('?')[0] || '#/';
            const authRequired = path !== '#/login' && path !== '#/waitlist-join';

            // Redirigir si no hay sesión
            if (authRequired && !Auth.isAuthenticated()) {
                window.location.hash = '#/login';
                return;
            }

            // Redirigir si ya hay sesión pero trata de ir a Login
            if (path === '#/login' && Auth.isAuthenticated()) {
                window.location.hash = '#/';
                return;
            }

            // Cargar vista
            if (path === '#/login') {
                document.getElementById('app').innerHTML = ''; // Clear
                UI.renderLogin();
                UI.hideLoader();
                return;
            }

            if (path === '#/waitlist-join') {
                document.getElementById('app').innerHTML = ''; // Clear
                UI.showLoader();
                try {
                    await this.loadView('Waitlist');
                    if (Views.Waitlist) {
                        Views.Waitlist.renderPublicForm();
                    } else {
                        console.error("Views.Waitlist not loaded.");
                        document.body.innerHTML = `<p style="padding:2rem;color:red">Error: Módulo de Lista de Espera no cargado.</p>`;
                    }
                } catch (e) {
                    document.body.innerHTML = `<p style="padding:2rem;color:red">Error de carga: ${e.message}</p>`;
                }
                UI.hideLoader();
                return;
            }

            // Si es ruta interna, asegurarse que el Layout está renderizado
            if (!document.querySelector('.app-layout')) {
                UI.renderLayout();
            }

            // Actualizar UI
            UI.updateActiveNavLink();
            UI.renderBreadcrumbs();
            UI.renderNotifications();

            // Limpiar vista actual y forzar reinicio de animación
            const viewContainer = document.getElementById('router-view');
            if (viewContainer) {
                viewContainer.style.animation = 'none';
                viewContainer.offsetHeight; // trigger reflow
                viewContainer.style.animation = '';
                viewContainer.innerHTML = `<div style="padding:4rem; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:var(--primary);"></i></div>`;
            }

            UI.showLoader();

            // Cargar la vista según ruta
            switch (path) {
                case '#/':
                    if (Auth.hasRole('student')) {
                        UI.setSectionTitle('Mi Portal de Alumno', 'fa-solid fa-graduation-cap');
                        await this.loadView('StudentPortal');
                        if (Views.StudentPortal) {
                            Views.StudentPortal.render();
                            // Verificar racha diaria
                            const currentUser = Auth.getUser();
                            if (currentUser && Gamification) {
                                Gamification.checkDailyStreak(currentUser.id);
                                // Mostrar splash de bienvenida de Mila (solo 1 vez por sesión)
                                setTimeout(() => UI.showWelcomeSplash(currentUser), 300);
                            }
                        }
                    } else {
                        UI.setSectionTitle('Panel de Control', 'fa-solid fa-chart-pie');
                        await this.loadView('Dashboard');
                        if (Views.Dashboard) Views.Dashboard.render();
                    }
                    break;
                case '#/about':
                    UI.setSectionTitle('Quiénes Somos', 'fa-solid fa-leaf');
                    await this.loadView('About');
                    if (Views.About) Views.About.render();
                    break;
                case '#/users':
                    UI.setSectionTitle('Gestión de Alumnos', 'fa-solid fa-user-group');
                    await this.loadView('Users');
                    if (Views.Users) Views.Users.render();
                    break;
                case '#/courses':
                    UI.setSectionTitle('Cursos y Niveles', 'fa-solid fa-book');
                    await this.loadView('Courses');
                    if (Views.Courses) Views.Courses.render();
                    break;
                case '#/attendance':
                    UI.setSectionTitle('Control de Asistencia', 'fa-solid fa-calendar-check');
                    await this.loadView('Attendance');
                    if (Views.Attendance) Views.Attendance.render();
                    break;
                case '#/payments':
                    UI.setSectionTitle('Panel Financiero', 'fa-solid fa-file-invoice-dollar');
                    await this.loadView('Payments');
                    if (Views.Payments) Views.Payments.render();
                    break;
                case '#/materials':
                    UI.setSectionTitle('Materiales de Estudio', 'fa-solid fa-folder-open');
                    await this.loadView('Materials');
                    if (Views.Materials) Views.Materials.render();
                    break;
                case '#/assignments':
                    UI.setSectionTitle('Buzón de Tareas', 'fa-solid fa-file-pen');
                    await this.loadView('Assignments');
                    if (Views.Assignments) Views.Assignments.render();
                    break;
                case '#/quizzes':
                    UI.setSectionTitle('Evaluaciones Online', 'fa-solid fa-clipboard-question');
                    await this.loadView('Quizzes');
                    if (Views.Quizzes) Views.Quizzes.render();
                    break;
                case '#/calendar':
                    UI.setSectionTitle('Calendario Institucional', 'fa-solid fa-calendar-days');
                    await this.loadView('Calendar');
                    if (Views.Calendar) Views.Calendar.render();
                    break;
                case '#/notifications':
                    UI.setSectionTitle('Notificaciones', 'fa-regular fa-bell');
                    await this.loadView('Notifications');
                    if (Views.Notifications) Views.Notifications.render();
                    break;
                case '#/conversations':
                    UI.setSectionTitle('Conversaciones 1-a-1', 'fa-solid fa-comments');
                    await this.loadView('Conversations');
                    if (Views.Conversations) Views.Conversations.render();
                    break;
                case '#/waitlist':
                    if (Auth.hasRole('admin')) {
                        UI.setSectionTitle('Lista de Espera Pública', 'fa-solid fa-clock-rotate-left');
                        await this.loadView('Waitlist');
                        if (Views.Waitlist) Views.Waitlist.renderAdminView();
                    } else {
                        window.location.hash = '#/';
                    }
                    break;
                case '#/grades':
                    if (!Auth.hasRole('student')) {
                        UI.setSectionTitle('Calificaciones', 'fa-solid fa-star');
                        await this.loadView('Grades');
                        if (Views.Grades) Views.Grades.render();
                    } else window.location.hash = '#/';
                    break;
                case '#/logs':
                    if (Auth.hasRole('admin')) {
                        UI.setSectionTitle('Auditoría de Sistema', 'fa-solid fa-shield-halved');
                        await this.loadView('Logs');
                        if (Views.Logs) Views.Logs.render();
                    } else window.location.hash = '#/';
                    break;
                case '#/settings':
                case '#/profile':
                    UI.setSectionTitle('Configuración de Usuario', 'fa-solid fa-user-gear');
                    await this.loadView('Settings');
                    if (Views.Settings) Views.Settings.render();
                    break;
                case '#/rewards':
                    UI.setSectionTitle('Tienda de Recompensas', 'fa-solid fa-store');
                    await this.loadView('Rewards');
                    if (Views.Rewards) Views.Rewards.render();
                    break;
                default:
                    UI.setSectionTitle('Error 404', 'fa-solid fa-triangle-exclamation');
                    viewContainer.innerHTML = `
                        <div style="text-align:center;margin-top:50px;">
                            <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;color:var(--warning);margin-bottom:1rem"></i>
                            <h2>Página no encontrada</h2>
                            <a href="#/" class="btn btn-primary mt-4">Ir al inicio</a>
                        </div>
                    `;
            }

            // Auto-wrap any tables in table-container dynamically for perfect mobile responsiveness
            setTimeout(() => {
                const tables = document.querySelectorAll('table');
                tables.forEach(table => {
                    if (!table.parentElement.classList.contains('table-container')) {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'table-container';
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);
                    }
                });
            }, 50);

            // Finalizar carga
            UI.hideLoader();
        } catch (error) {
            document.body.innerHTML = `<div style="padding:4rem;text-align:center;color:red;font-family:sans-serif"><h1>Error Crítico en Vista</h1><p>${error.message}</p><pre style="text-align:left;background:#eee;padding:1rem">${error.stack}</pre></div>`;
            console.error("Critical Router Error:", error);
            UI.hideLoader();
        }
    }
};

// Arrancar App cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
