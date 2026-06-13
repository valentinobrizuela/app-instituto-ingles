window.Views = window.Views || {};

Views.Settings = {
    render() {
        const user = Auth.getUser();
        const container = document.getElementById('router-view');
        
        container.innerHTML = `
            <div class="settings-layout">
                <aside class="settings-nav card">
                    <div class="settings-nav-item active" onclick="Views.Settings.switchTab('profile', this)">
                        <i class="fa-solid fa-user-gear"></i> Mi Perfil
                    </div>
                    ${user.role === 'admin' ? `
                    <div class="settings-nav-item" onclick="Views.Settings.switchTab('institute', this)">
                        <i class="fa-solid fa-building-columns"></i> Instituto
                    </div>
                    <div class="settings-nav-item" onclick="Views.Settings.switchTab('appearance', this)">
                        <i class="fa-solid fa-palette"></i> Apariencia
                    </div>
                    ` : ''}
                    <div style="margin-top:auto; padding-top:1rem; border-top:1px solid var(--border-color)">
                        <button class="btn w-full" style="color:var(--danger)" onclick="Auth.logout()">
                            <i class="fa-solid fa-power-off"></i> Cerrar Sesión
                        </button>
                    </div>
                </aside>

                <main id="settings-content">
                    ${this.renderProfileTab(user)}
                </main>
            </div>
        `;
    },

    switchTab(tab, el) {
        // Update nav
        document.querySelectorAll('.settings-nav-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');

        const content = document.getElementById('settings-content');
        const user = Auth.getUser();

        if (tab === 'profile') content.innerHTML = this.renderProfileTab(user);
        if (tab === 'institute') content.innerHTML = this.renderInstituteTab();
        if (tab === 'appearance') content.innerHTML = this.renderAppearanceTab();
    },

    renderProfileTab(user) {
        let studentStats = '';
        if (user.role === 'student') {
            const course = DB.getTable('courses').find(c => String(c.id) === String(user.course_id));
            studentStats = `
                <div class="card mb-4" style="background:var(--primary-light); border:1px solid var(--primary); margin-bottom:2rem">
                    <h4 style="color:var(--primary); margin-bottom:1rem"><i class="fa-solid fa-graduation-cap"></i> Resumen Académico</h4>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:1rem">
                        <div>
                            <p class="text-xs text-muted uppercase font-bold">Nivel Actual</p>
                            <p style="font-weight:800; font-size:1.25rem; color:var(--text-main)">${user.level || 'Beginner'}</p>
                        </div>
                        <div>
                            <p class="text-xs text-muted uppercase font-bold">Experiencia (XP)</p>
                            <p style="font-weight:800; font-size:1.25rem; color:var(--text-main)">${user.xp || 0} XP</p>
                        </div>
                        <div>
                            <p class="text-xs text-muted uppercase font-bold">Curso</p>
                            <p style="font-weight:800; font-size:1.25rem; color:var(--text-main)">${course ? course.name : 'Sin asignar'}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card fade-in-up">
                ${studentStats}
                
                <h3 class="mb-4">Información Personal</h3>
                <form onsubmit="event.preventDefault(); UI.showToast('Perfil actualizado (Demo)', 'success')">
                    <div style="display:flex; gap:2rem; margin-bottom:2rem; align-items:center">
                        <div class="avatar" style="width:100px; height:100px; font-size:3rem">${user.name[0]}</div>
                        <div>
                            <button class="btn btn-secondary btn-sm">Cambiar Foto</button>
                            <p class="text-sm text-muted mt-2">JPG, GIF o PNG. Máx 2MB.</p>
                        </div>
                    </div>
                    
                    <div class="responsive-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem">
                        <div class="form-group">
                            <label>Nombre Completo</label>
                            <input type="text" class="form-control" value="${user.name}">
                        </div>
                        <div class="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email" class="form-control" value="${user.email}" readonly>
                        </div>
                    </div>
                    
                    <div class="form-group mt-4">
                        <label>Biografía / Notas</label>
                        <textarea class="form-control" rows="3" placeholder="Cuéntanos algo sobre ti..."></textarea>
                    </div>

                    <div style="margin-top:2rem">
                        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                    </div>
                </form>

                <hr style="margin:2rem 0; border:0; border-top:1px solid var(--border-color)">
                
                <h3 class="mb-4">Seguridad</h3>
                <div class="form-group">
                    <label>Contraseña Actual</label>
                    <input type="password" class="form-control" placeholder="••••••••">
                </div>
                <div class="responsive-grid mt-4" style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem">
                    <div class="form-group">
                        <label>Nueva Contraseña</label>
                        <input type="password" class="form-control" placeholder="••••••••">
                    </div>
                    <div class="form-group">
                        <label>Confirmar Contraseña</label>
                        <input type="password" class="form-control" placeholder="••••••••">
                    </div>
                </div>
                <button class="btn btn-secondary mt-4">Actualizar Contraseña</button>
            </div>
        `;
    },

    renderInstituteTab() {
        return `
            <div class="card fade-in-up">
                <h3 class="mb-4">Configuración del Instituto</h3>
                <div class="form-group">
                    <label>Nombre Institucional</label>
                    <input type="text" class="form-control" value="West House English School">
                </div>
                <div class="form-group mt-4">
                    <label>Dirección</label>
                    <input type="text" class="form-control" value="Av. Principal 123, Ciudad">
                </div>
                
                <h4 class="mt-5 mb-3">Contactos de Soporte (WhatsApp)</h4>
                <div id="wa-contacts-config">
                    <div style="display:flex; gap:1rem; margin-bottom:1rem">
                        <input type="text" class="form-control" value="Maricel (Directora)" style="flex:1">
                        <input type="text" class="form-control" value="5493804135270" style="flex:1">
                        <button class="btn btn-danger"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <button class="btn btn-secondary btn-sm"><i class="fa-solid fa-plus"></i> Añadir Contacto</button>
                </div>

                <div style="margin-top:2rem">
                    <button class="btn btn-primary">Guardar Configuración</button>
                </div>
            </div>
        `;
    },

    renderAppearanceTab() {
        return `
            <div class="card fade-in-up">
                <h3 class="mb-4">Personalización Visual</h3>
                <p class="text-muted mb-4">Ajusta cómo se ve la plataforma para todos los usuarios.</p>
                
                <div class="form-group">
                    <label>Color Primario</label>
                    <div style="display:flex; gap:1rem; align-items:center">
                        <input type="color" value="#f97316" style="width:50px; height:50px; border:none; border-radius:8px; cursor:pointer">
                        <span class="text-muted">Naranja Institucional (Por defecto)</span>
                    </div>
                </div>

                <div class="form-group mt-4">
                    <label>Logo de la App (Dark Mode)</label>
                    <div class="skeleton" style="height:100px; width:100%; border-radius:12px; display:flex; align-items:center; justify-content:center; background:#eee">
                        <i class="fa-solid fa-image fa-2xl text-muted"></i>
                    </div>
                    <button class="btn btn-secondary btn-sm mt-2">Subir nuevo logo</button>
                </div>

                <div style="margin-top:2rem">
                    <button class="btn btn-primary" onclick="UI.showToast('Configuración guardada', 'success')">Aplicar Tematización</button>
                </div>
            </div>
        `;
    }
};
