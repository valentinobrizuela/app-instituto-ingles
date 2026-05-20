window.Views = window.Views || {};

Views.Waitlist = {
    renderPublicForm() {
        const app = document.getElementById('app');
        if (!app) return;

        // Cargar variables CSS y tema para que luzca espectacular
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        
        app.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-main) 100%); padding: 2rem; font-family: 'Outfit', sans-serif;">
                <div class="card" style="width: 100%; max-width: 500px; padding: 2.5rem; margin: 0; box-shadow: var(--shadow-lg); border-top: 5px solid var(--primary); animation: slideUp 0.4s ease-out; position: relative;">
                    
                    <!-- Botón para volver al login -->
                    <a href="#/login" style="position: absolute; top: 1.5rem; left: 1.5rem; color: var(--text-muted); text-decoration: none; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-arrow-left"></i> Volver al Login
                    </a>

                    <!-- Logo & Header -->
                    <div style="text-align: center; margin-top: 1rem; margin-bottom: 2rem;">
                        <div style="width: 70px; height: 70px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 2rem; box-shadow: var(--shadow-md)">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem;">West House English School</h1>
                        <p style="color: var(--text-muted); font-size: 0.95rem;">Lista de Espera e Inscripciones</p>
                    </div>

                    <!-- Formulario -->
                    <form id="form-waitlist-join" onsubmit="Views.Waitlist.submitForm(event)">
                        <div class="form-group mb-4">
                            <label style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted);">Nombre Completo *</label>
                            <input type="text" id="wl-name" class="form-control" placeholder="Ej: Valentina Pérez" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-main);">
                        </div>

                        <div class="form-group mb-4">
                            <label style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted);">Correo Electrónico *</label>
                            <input type="email" id="wl-email" class="form-control" placeholder="valentina@ejemplo.com" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-main);">
                        </div>

                        <div class="form-group mb-4">
                            <label style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted);">WhatsApp de Contacto (con prefijo) *</label>
                            <input type="tel" id="wl-phone" class="form-control" placeholder="Ej: 5493416778899" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-main);">
                            <small style="color:var(--text-muted); font-size: 0.75rem; display:block; margin-top: 0.25rem;">Por favor, ingresa número completo sin símbolos (código de país + número).</small>
                        </div>

                        <div class="form-group mb-4">
                            <label style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted);">Nivel de Interés *</label>
                            <select id="wl-level" class="form-control" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-main); font-weight: 600;">
                                <option value="A1">Principiante (A1 - Starter)</option>
                                <option value="A2">Básico (A2 - Elementary)</option>
                                <option value="B1">Intermedio (B1 - Intermediate)</option>
                                <option value="B2">Intermedio Alto (B2 - Upper-Intermediate)</option>
                                <option value="C1">Avanzado (C1/C2 - Advanced)</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary w-full" style="padding: 0.8rem; font-size: 1.1rem; font-weight: 700; border-radius: 8px; margin-top: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer;">
                            <i class="fa-solid fa-paper-plane"></i> Enviar Solicitud de Ingreso
                        </button>
                    </form>
                    
                    <div id="waitlist-success-container" style="display: none; text-align: center; padding: 1rem 0;">
                        <div style="font-size: 4rem; color: var(--success); margin-bottom: 1.5rem; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 1rem;">¡Registro Completado!</h2>
                        <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 2rem;">
                            Hola <strong id="wl-success-name" style="color: var(--primary);"></strong>, tu solicitud para ingresar a la lista de espera del nivel <strong id="wl-success-level"></strong> fue recibida con éxito. 
                            Próximamente nos comunicaremos contigo vía WhatsApp o correo electrónico para coordinar tu ingreso.
                        </p>
                        <a href="#/login" class="btn btn-primary w-full" style="padding: 0.75rem; text-decoration: none; display: block; font-weight: bold; border-radius: 8px;">Entendido</a>
                    </div>

                </div>
            </div>
        `;
    },

    async submitForm(e) {
        e.preventDefault();
        
        const name = document.getElementById('wl-name').value;
        const email = document.getElementById('wl-email').value;
        const phone = document.getElementById('wl-phone').value;
        const level = document.getElementById('wl-level').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
        }

        try {
            const data = {
                name: name,
                email: email,
                phone: phone.replace(/\D/g, ''), // Limpiar símbolos
                level_requested: level,
                status: 'pending'
            };

            const record = await DB.insert('waitlist', data);

            if (record) {
                // Ocultar formulario y mostrar éxito
                document.getElementById('form-waitlist-join').style.display = 'none';
                document.getElementById('wl-success-name').textContent = name;
                document.getElementById('wl-success-level').textContent = level;
                document.getElementById('waitlist-success-container').style.display = 'block';
                UI.showToast('¡Registro de lista de espera completado!', 'success');
            } else {
                throw new Error("No se pudo insertar el registro. Es posible que el correo ya esté registrado.");
            }
        } catch (err) {
            UI.showToast(err.message || 'Error al enviar registro.', 'danger');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Solicitud de Ingreso';
            }
        }
    },

    // --- VISTA ADMINISTRATIVA ---
    renderAdminView(tab = 'pending', search = '') {
        const viewContainer = document.getElementById('router-view');
        if (!viewContainer) return;

        const rawWaitlist = DB.getTable('waitlist');
        
        // Filtrar y buscar
        const filtered = rawWaitlist.filter(w => {
            const matchesTab = w.status === tab;
            const matchesSearch = search === '' || 
                w.name.toLowerCase().includes(search.toLowerCase()) || 
                w.email.toLowerCase().includes(search.toLowerCase());
            return matchesTab && matchesSearch;
        });

        // Ordenar más recientes primero
        filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

        viewContainer.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-clock-rotate-left"></i> Lista de Espera Pública</h1>
                    <p class="text-muted mt-2">Gestiona las solicitudes de inscripción de nuevos alumnos.</p>
                </div>
                <div style="font-size:0.9rem; background:var(--primary-light); color:var(--primary); padding:0.5rem 1rem; border-radius:20px; font-weight:700;">
                    ${rawWaitlist.filter(w => w.status === 'pending').length} Solicitudes Pendientes
                </div>
            </div>

            <!-- Panel de Control/Filtros -->
            <div class="card mb-4" style="padding: 1.25rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                    
                    <!-- Tabs -->
                    <div style="display:flex; gap:0.5rem; background:var(--bg-main); padding:0.25rem; border-radius:8px;">
                        <button class="btn btn-sm ${tab === 'pending' ? 'btn-primary' : 'btn-secondary'}" onclick="Views.Waitlist.renderAdminView('pending', '${search}')" style="border:none;">
                            <i class="fa-solid fa-hourglass-half"></i> Pendientes
                        </button>
                        <button class="btn btn-sm ${tab === 'approved' ? 'btn-primary' : 'btn-secondary'}" onclick="Views.Waitlist.renderAdminView('approved', '${search}')" style="border:none;">
                            <i class="fa-solid fa-circle-check"></i> Aprobados/Inscritos
                        </button>
                        <button class="btn btn-sm ${tab === 'rejected' ? 'btn-primary' : 'btn-secondary'}" onclick="Views.Waitlist.renderAdminView('rejected', '${search}')" style="border:none;">
                            <i class="fa-solid fa-box-archive"></i> Archivados
                        </button>
                    </div>

                    <!-- Buscador -->
                    <div style="position:relative; width:100%; max-width:300px;">
                        <input type="text" id="waitlist-search-input" class="form-control" placeholder="Buscar por nombre o email..." value="${search}" oninput="Views.Waitlist.handleSearch(event, '${tab}')" style="padding-left:2.5rem; width:100%;">
                        <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:var(--text-muted)"></i>
                    </div>

                </div>
            </div>

            <!-- Tabla de datos -->
            <div class="card" style="padding:0; overflow:hidden;">
                <div class="table-container">
                    <table style="width:100%">
                        <thead style="background:var(--bg-hover);">
                            <tr>
                                <th style="padding:1rem;">Solicitante</th>
                                <th>WhatsApp / E-mail</th>
                                <th>Nivel Solicitado</th>
                                <th>Fecha Registro</th>
                                <th style="text-align:right; padding-right:1.5rem;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(w => `
                                <tr style="border-bottom: 1px solid var(--border-color)">
                                    <td style="padding: 1rem;">
                                        <div style="font-weight: 700; color:var(--text-main); font-size:0.95rem;">${w.name}</div>
                                        <span class="badge ${w.status === 'pending' ? 'badge-primary' : w.status === 'approved' ? 'badge-success' : 'badge-danger'}" style="font-size:0.7rem; margin-top:0.25rem;">
                                            ${w.status === 'pending' ? 'Pendiente' : w.status === 'approved' ? 'Aprobado' : 'Archivado'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style="margin-bottom:0.25rem;">
                                            <a href="https://wa.me/${w.phone}?text=Hola%20${encodeURIComponent(w.name.split(' ')[0])}!%20Nos%20comunicamos%20de%20West%20House%20English%20School%20respecto%20a%20tu%20solicitud%20de%20inscripción." target="_blank" style="color:#10b981; text-decoration:none; font-weight:bold; font-size:0.85rem; display:flex; align-items:center; gap:0.4rem;">
                                                <i class="fa-brands fa-whatsapp"></i> +${w.phone}
                                            </a>
                                        </div>
                                        <div style="font-size:0.85rem; color:var(--text-muted); display:flex; align-items:center; gap:0.4rem;">
                                            <i class="fa-regular fa-envelope"></i> ${w.email}
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge" style="background:var(--accent); color:white; font-weight:700;">Nivel ${w.level_requested}</span>
                                    </td>
                                    <td style="font-size:0.85rem; color:var(--text-muted);">
                                        ${new Date(w.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    <td style="text-align:right; padding-right:1.5rem;">
                                        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                                            ${w.status === 'pending' ? `
                                                <button class="btn btn-sm" style="background:var(--success); color:white; border:none; border-radius:6px;" onclick="Views.Waitlist.approveApplicant(${w.id})" title="Aprobar e Inscribir">
                                                    <i class="fa-solid fa-user-plus"></i> Inscribir
                                                </button>
                                                <button class="btn btn-sm" style="background:var(--danger); color:white; border:none; border-radius:6px;" onclick="Views.Waitlist.rejectApplicant(${w.id})" title="Archivar/Rechazar">
                                                    <i class="fa-solid fa-box-archive"></i> Archivar
                                                </button>
                                            ` : ''}
                                            <button class="btn btn-sm" style="background:transparent; color:var(--text-muted); border:1px solid var(--border-color); border-radius:6px;" onclick="Views.Waitlist.deleteEntry(${w.id})" title="Eliminar Registro">
                                                <i class="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="5" style="text-align:center; padding:3rem;" class="text-muted">
                                        <i class="fa-regular fa-folder-open fa-3x mb-3" style="color:var(--text-muted)"></i>
                                        <p>No se encontraron solicitudes en esta categoría.</p>
                                    </td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    handleSearch(e, tab) {
        const searchVal = e.target.value;
        // Debounce simple o recarga instantánea para SPA veloz
        Views.Waitlist.renderAdminView(tab, searchVal);
        
        // Re-enfocar buscador y mover cursor al final
        setTimeout(() => {
            const input = document.getElementById('waitlist-search-input');
            if (input) {
                input.focus();
                input.setSelectionRange(input.value.length, input.value.length);
            }
        }, 10);
    },

    async approveApplicant(id) {
        const applicant = DB.getTable('waitlist').find(w => String(w.id) === String(id));
        if (!applicant) return;

        // 1. Preguntar confirmación
        if (confirm(`¿Deseas pre-aprobar a ${applicant.name} y abrir el formulario de creación de usuario?`)) {
            // Actualizar estado en lista de espera
            UI.showLoader();
            try {
                await DB.update('waitlist', id, { status: 'approved' });
                
                // Prefilar los campos correspondientes para la creación de usuario
                const levelMapping = applicant.level_requested === 'A1' || applicant.level_requested === 'A2' ? 'Beginner' 
                                   : applicant.level_requested === 'B1' || applicant.level_requested === 'B2' ? 'Intermediate' 
                                   : 'Advanced';

                const prefilledData = {
                    name: applicant.name,
                    email: applicant.email,
                    parent_email: applicant.email, // Por defecto el mismo si es mayor, o modificable
                    parent_phone: applicant.phone,
                    level: levelMapping
                };

                UI.hideLoader();
                UI.showToast('Solicitud aprobada. Redirigiendo a registro de alumno.', 'success');
                
                // Abrir el modal de usuarios prefilado
                if (Views.Users && Views.Users.openModal) {
                    Views.Users.openModal(null, prefilledData);
                } else {
                    window.location.hash = '#/users';
                }
                
                // Recargar vista administrativa
                this.renderAdminView('pending');
            } catch (err) {
                UI.hideLoader();
                UI.showToast('Error al aprobar: ' + err.message, 'danger');
            }
        }
    },

    async rejectApplicant(id) {
        if (confirm('¿Seguro que deseas archivar esta solicitud?')) {
            UI.showLoader();
            try {
                await DB.update('waitlist', id, { status: 'rejected' });
                UI.hideLoader();
                UI.showToast('Solicitud archivada.', 'info');
                this.renderAdminView('pending');
            } catch (err) {
                UI.hideLoader();
                UI.showToast('Error al archivar: ' + err.message, 'danger');
            }
        }
    },

    async deleteEntry(id) {
        if (confirm('¿Deseas eliminar permanentemente esta solicitud de la lista de espera?')) {
            UI.showLoader();
            try {
                await DB.remove('waitlist', id);
                UI.hideLoader();
                UI.showToast('Solicitud eliminada.', 'success');
                // Mantener el estado en la pestaña actual
                const activeTabBtn = document.querySelector('.btn-primary');
                const activeTab = activeTabBtn ? activeTabBtn.textContent.trim().toLowerCase() : 'pending';
                let tabKey = 'pending';
                if (activeTab.includes('aprobados')) tabKey = 'approved';
                if (activeTab.includes('archivados')) tabKey = 'rejected';
                
                this.renderAdminView(tabKey);
            } catch (err) {
                UI.hideLoader();
                UI.showToast('Error al eliminar: ' + err.message, 'danger');
            }
        }
    }
};
