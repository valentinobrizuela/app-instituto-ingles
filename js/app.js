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

    router() {
        try {
            let path = window.location.hash.split('?')[0] || '#/';
            const authRequired = path !== '#/login';

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

        // Si es ruta interna, asegurarse que el Layout está renderizado
        if (!document.querySelector('.app-layout')) {
            UI.renderLayout();
        }

        // Actualizar UI
        UI.updateActiveNavLink();
        UI.renderBreadcrumbs();
        UI.renderNotifications();

        // Limpiar vista actual
        const viewContainer = document.getElementById('router-view');

        // Cargar la vista según ruta
        switch (path) {
            case '#/':
                if (Auth.hasRole('student')) {
                    UI.setSectionTitle('Mi Portal de Alumno', 'fa-solid fa-graduation-cap');
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
                    Views.Dashboard.render();
                }
                break;
            case '#/about':
                UI.setSectionTitle('Quiénes Somos', 'fa-solid fa-leaf');
                if (Views.About) Views.About.render();
                break;
            case '#/users':
                UI.setSectionTitle('Gestión de Alumnos', 'fa-solid fa-user-group');
                Views.Users.render();
                break;
            case '#/courses':
                UI.setSectionTitle('Cursos y Niveles', 'fa-solid fa-book');
                Views.Courses.render();
                break;
            case '#/attendance':
                UI.setSectionTitle('Control de Asistencia', 'fa-solid fa-calendar-check');
                Views.Attendance.render();
                break;
            case '#/payments':
                UI.setSectionTitle('Panel Financiero', 'fa-solid fa-file-invoice-dollar');
                Views.Payments.render();
                break;
            case '#/materials':
                UI.setSectionTitle('Materiales de Estudio', 'fa-solid fa-folder-open');
                Views.Materials.render();
                break;
            case '#/assignments':
                UI.setSectionTitle('Buzón de Tareas', 'fa-solid fa-file-pen');
                if (Views.Assignments) Views.Assignments.render();
                break;
            case '#/quizzes':
                UI.setSectionTitle('Evaluaciones Online', 'fa-solid fa-clipboard-question');
                if (Views.Quizzes) Views.Quizzes.render();
                break;
            case '#/calendar':
                UI.setSectionTitle('Calendario Institucional', 'fa-solid fa-calendar-days');
                if (Views.Calendar) Views.Calendar.render();
                break;
            case '#/notifications':
                UI.setSectionTitle('Notificaciones', 'fa-regular fa-bell');
                if (Views.Notifications) Views.Notifications.render();
                break;
            case '#/grades':
                if (Views.Grades && !Auth.hasRole('student')) {
                    UI.setSectionTitle('Calificaciones', 'fa-solid fa-star');
                    Views.Grades.render();
                } else window.location.hash = '#/';
                break;
            case '#/logs':
                if (Views.Logs && Auth.hasRole('admin')) {
                    UI.setSectionTitle('Auditoría de Sistema', 'fa-solid fa-shield-halved');
                    Views.Logs.render();
                } else window.location.hash = '#/';
                break;
            case '#/notifications':
                UI.setSectionTitle('Notificaciones', 'fa-regular fa-bell');
                if (Views.Notifications) Views.Notifications.render();
                break;
            case '#/settings':
            case '#/profile':
                UI.setSectionTitle('Configuración de Usuario', 'fa-solid fa-user-gear');
                if (Views.Settings) Views.Settings.render();
                break;
            case '#/rewards':
                UI.setSectionTitle('Tienda de Recompensas', 'fa-solid fa-store');
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
