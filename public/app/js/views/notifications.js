window.Views = window.Views || {};

Views.Notifications = {
    render() {
        const user = Auth.getUser();
        const notifications = DB.getTable('notifications').sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

        if (!Auth.hasRole('admin')) {
            // Vista de Comunicados para Alumnos y Profesores
            const myNotifs = notifications.filter(n => n.target === 'all' || n.target === user.role);
            
            let html = `
                <div class="mb-4">
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-regular fa-bell"></i> Comunicados Oficiales</h1>
                    <p class="text-muted mt-2">Novedades, anuncios y avisos importantes del instituto.</p>
                </div>
                
                <div id="notif-feed-container" style="display:flex; flex-direction:column; gap:1.25rem;">
            `;

            if (myNotifs.length === 0) {
                html += `</div>`; // Close container
                document.getElementById('router-view').innerHTML = html;
                UI.showEmptyState('notif-feed-container', 'Sin comunicados', 'No hay avisos oficiales para ti en este momento.', 'fa-regular fa-bell-slash');
                return;
            }

            html += myNotifs.map(n => `
                <div class="card shadow-sm hover-card" style="padding:1.5rem; border-left:4px solid var(--primary); cursor:pointer; transition: transform 0.2s, box-shadow 0.2s" onclick="UI.showAnnouncementDetail('${n.id}')">
                    <div class="flex justify-between items-start mb-2" style="gap:1rem">
                        <h3 style="font-size:1.25rem; font-weight:700; margin:0; color:var(--text-main)">${n.title}</h3>
                        <span class="text-muted text-sm" style="white-space:nowrap"><i class="fa-regular fa-calendar"></i> ${new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style="color:var(--text-muted); line-height:1.5; margin:0">${n.message.substring(0, 160)}${n.message.length > 160 ? '...' : ''}</p>
                    <div style="margin-top:1rem; font-size:0.8rem; color:var(--primary); font-weight:600; display:flex; align-items:center; gap:0.25rem">
                        <span>Leer más</span> <i class="fa-solid fa-arrow-right-long"></i>
                    </div>
                </div>
            `).join('');

            html += `</div>`;
            document.getElementById('router-view').innerHTML = html;
            return;
        }

        // Vista de Administración (solo para admin)
        document.getElementById('router-view').innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-bullhorn"></i> Centro de Comunicados</h1>
                    <p class="text-muted mt-2">Envía avisos oficiales a alumnos y profesores.</p>
                </div>
                <button class="btn btn-primary shadow-md" onclick="Views.Notifications.openModal()"><i class="fa-solid fa-plus"></i> Nuevo Aviso</button>
            </div>

            <div class="card" style="padding:0; overflow:hidden">
                <div class="table-container">
                    <table style="width:100%">
                        <thead style="background:var(--bg-main)">
                            <tr>
                                <th style="padding:1rem">Fecha</th>
                                <th>Título</th>
                                <th>Dirigido a</th>
                                <th>Visto por</th>
                                <th style="text-align:center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${notifications.map(n => `
                                <tr style="border-bottom:1px solid var(--border-color)">
                                    <td style="padding:1rem; font-size:0.85rem">${new Date(n.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div style="font-weight:700">${n.title}</div>
                                        <div class="text-muted text-sm">${n.message.substring(0, 50)}...</div>
                                    </td>
                                    <td>
                                        <span class="badge ${n.target === 'all' ? 'badge-primary' : n.target === 'student' ? 'badge-success' : 'badge-info'}">
                                            ${n.target === 'all' ? 'Todos' : n.target === 'student' ? 'Alumnos' : 'Profesores'}
                                        </span>
                                    </td>
                                    <td><i class="fa-regular fa-eye"></i> ${n.views || 0}</td>
                                    <td style="text-align:center">
                                        <button class="btn" style="color:var(--danger)" onclick="Views.Notifications.delete('${n.id}')"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                            ${notifications.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:3rem" class="text-muted">No has enviado comunicados todavía.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    openModal() {
        UI.openModal('Nuevo Comunicado Oficial', `
            <form id="form-notif" onsubmit="Views.Notifications.send(event)">
                <div class="form-group">
                    <label>Título del Aviso</label>
                    <input type="text" id="n-title" class="form-control" placeholder="Ej: Cambio de horario por feriado" required>
                </div>
                <div class="form-group mt-3">
                    <label>Mensaje</label>
                    <textarea id="n-message" class="form-control" rows="4" placeholder="Escribe aquí el contenido del aviso..." required></textarea>
                </div>
                <div class="form-group mt-3">
                    <label>¿Quién debe ver esto?</label>
                    <select id="n-target" class="form-control">
                        <option value="all">Todos los usuarios</option>
                        <option value="student">Solo Alumnos</option>
                        <option value="teacher">Solo Profesores</option>
                    </select>
                </div>
                <div class="mt-4 pt-3" style="border-top:1px solid #eee">
                    <button type="submit" class="btn btn-primary w-full"><i class="fa-solid fa-paper-plane"></i> Publicar Comunicado</button>
                </div>
            </form>
        `);
    },

    async send(e) {
        e.preventDefault();
        UI.showLoader();
        
        const data = {
            title: document.getElementById('n-title').value,
            message: document.getElementById('n-message').value,
            target: document.getElementById('n-target').value,
            created_at: new Date().toISOString(),
            views: 0
        };

        try {
            await DB.insert('notifications', data);
            UI.showToast('Comunicado enviado con éxito', 'success');
            UI.closeModal();
            this.render();
        } catch (err) {
            UI.showToast('Error al enviar comunicado', 'danger');
        }
        UI.hideLoader();
    },

    async delete(id) {
        if (confirm('¿Eliminar este comunicado?')) {
            UI.showLoader();
            await DB.remove('notifications', id);
            this.render();
            UI.hideLoader();
        }
    }
};
