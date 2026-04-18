// Bootstrapper y Router
const App = {
    async init() {
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
            // Prevenir que el navegador muestre el prompt automático
            e.preventDefault();
            // Guardar el evento para dispararlo luego
            window.deferredPrompt = e;
            // Mostrar botón de instalación en la UI
            UI.showInstallButton();
        });

        // Sincronización de Datos (Backend unificado)
        await DB.init();
        await Auth.init();

        console.log("✓ Sistema sincronizado con backend.");

        // Listener de rutas
        window.addEventListener('hashchange', () => {
            requestAnimationFrame(() => this.router());
        });

        // Ejecuta ruta inicial con RAF
        requestAnimationFrame(() => this.router());
    },

    router() {
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

        // Actualizar activo en la barra lateral
        UI.updateActiveNavLink();

        // Limpiar vista actual
        const viewContainer = document.getElementById('router-view');

        // Cargar la vista según ruta
        switch (path) {
            case '#/':
                if (Auth.hasRole('student')) {
                    if (Views.StudentPortal) Views.StudentPortal.render();
                } else {
                    Views.Dashboard.render();
                }
                break;
            case '#/about':
                if (Views.About) Views.About.render();
                break;
            case '#/users':
                Views.Users.render();
                break;
            case '#/courses':
                Views.Courses.render();
                break;
            case '#/attendance':
                Views.Attendance.render();
                break;
            case '#/payments':
                Views.Payments.render();
                break;
            case '#/materials':
                Views.Materials.render();
                break;
            case '#/calendar':
                if (Views.Calendar) Views.Calendar.render();
                break;
            case '#/notifications':
                if (Views.Notifications) Views.Notifications.render();
                break;
            case '#/grades':
                if (Views.Grades && !Auth.hasRole('student')) Views.Grades.render();
                else window.location.hash = '#/';
                break;
            default:
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
    }
};

// Arrancar App cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
