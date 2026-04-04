window.Views = window.Views || {};

Views.Notifications = {
    render() {
        const user = Auth.getUser();
        let notifs = DB.getTable('notifications');
        const canSend = ['admin', 'teacher'].includes(user.role);

        if(user.role === 'admin') {
            notifs = notifs.filter(n => true); 
        } else if (user.role === 'teacher') {
            notifs = notifs.filter(n => n.targetRole === 'all' || n.targetRole === 'teachers');
        } else if (user.role === 'student') {
            notifs = notifs.filter(n => n.targetRole === 'all' || n.targetRole === 'students');
        }

        notifs.sort((a,b) => new Date(b.date) - new Date(a.date));

        let html = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-bullhorn"></i> Centro de Notificaciones</h1>
                    <p class="text-muted mt-2">Avisos importantes del instituto e interactividad de plataforma.</p>
                </div>
                ${canSend ? `<button class="btn btn-primary shadow-md" onclick="Views.Notifications.openModal()"><i class="fa-solid fa-paper-plane"></i> Enviar Notificación</button>` : ''}
            </div>

            <div class="card mb-4" style="padding:1.5rem">
                <!-- Filters -->
                <div class="flex gap-2 mb-4">
                    <button class="btn btn-secondary filter-btn" onclick="Views.Notifications.filter('all')" style="border-radius:20px; font-weight:700">Todas</button>
                    ${canSend ? `
                        <button class="btn btn-secondary filter-btn" onclick="Views.Notifications.filter('students')" style="border-radius:20px">Solo Alumnos</button>
                        <button class="btn btn-secondary filter-btn" onclick="Views.Notifications.filter('teachers')" style="border-radius:20px">Solo Profesores</button>
                    ` : ''}
                </div>

                <div id="notifs-list" style="display:flex; flex-direction:column; gap:1rem;">
                    ${this.generateListHtml(notifs.slice(0, 15), user)}
                </div>
            </div>
        `;
        
        document.getElementById('router-view').innerHTML = html;
        
        const filterBtns = document.querySelectorAll('.filter-btn');
        if(filterBtns.length > 0) {
            filterBtns[0].style.border = "1px solid var(--primary)";
            filterBtns[0].style.color = "var(--primary)";
        }
    },

    generateListHtml(notifs, user) {
        if(notifs.length === 0) {
            return `<div style="padding:3rem; text-align:center; background:#f9fafb; border-radius:8px; border:2px dashed #e5e7eb; color:var(--text-muted)"><i class="fa-regular fa-bell-slash text-muted" style="font-size:3rem; margin-bottom:1rem; opacity:0.5"></i><br/>No tienes notificaciones pendientes.</div>`;
        }
        
        return notifs.map(n => {
            const isRead = n.readBy && n.readBy.includes(user.id);
            const dateStr = new Date(n.date).toLocaleString('es-ES', {dateStyle: 'medium', timeStyle: 'short'});
            
            let bgStyle = isRead ? "background:#fafafa; border-left:4px solid #ddd; opacity: 0.8" : "background:#fff; border-left:4px solid var(--primary); box-shadow:0 4px 6px rgba(0,0,0,0.05)";
            let targetLabel = n.targetRole === 'all' ? 'General' : n.targetRole === 'students' ? 'Alumnos' : 'Profesores';

            return `
                <div class="card" style="${bgStyle}; padding:1.25rem; transition: transform 0.2s;">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            ${!isRead ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--primary)"></span>` : ''}
                            <span class="badge" style="background:#f1f5f9; color:#475569; font-size:0.75rem"><i class="fa-solid fa-tag"></i> Aviso ${targetLabel}</span>
                            <span class="text-muted" style="font-size:0.8rem"><i class="fa-regular fa-clock"></i> ${dateStr}</span>
                        </div>
                        ${!isRead ? `<button class="btn" onclick="Views.Notifications.markRead(${n.id})" style="font-size:0.8rem; background:#eff6ff; color:#2563eb; border:none; padding:0.25rem 0.5rem">Marcar Leída</button>` : ''}
                    </div>
                    <p style="font-size:1.05rem; line-height:1.5; color:var(--text-main); margin-top:0.5rem; white-space:pre-wrap;">${n.message}</p>
                </div>
            `;
        }).join('');
    },

    filter(target) {
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.style.border = ''; b.style.color = '';
        });
        event.target.style.border = "1px solid var(--primary)";
        event.target.style.color = "var(--primary)";

        const user = Auth.getUser();
        const notifsBase = DB.getTable('notifications');
        let notifs = notifsBase;
        
        if(user.role === 'admin') {
            notifs = target === 'all' ? notifs : notifs.filter(n => n.targetRole === target);
        } else if (user.role === 'teacher') {
            const base = notifs.filter(n => n.targetRole === 'all' || n.targetRole === 'teachers');
            notifs = target === 'all' ? base : base.filter(n => n.targetRole === target);
        }

        notifs.sort((a,b) => new Date(b.date) - new Date(a.date));
        document.getElementById('notifs-list').innerHTML = this.generateListHtml(notifs, user);
    },

    markRead(id) {
        UI.showLoader();
        const notifs = DB.getTable('notifications');
        const nIdx = notifs.findIndex(n => Number(n.id) === Number(id));
        if(nIdx !== -1) {
            const user = Auth.getUser();
            let readBy = notifs[nIdx].readBy || [];
            if(!readBy.includes(user.id)) {
                readBy.push(user.id);
                DB.update('notifications', id, { readBy: readBy });
            }
            UI.showToast("Notificación marcada como leída");
            UI.renderLayout();
            this.render();
        }
        UI.hideLoader();
    },

    openModal() {
        UI.openModal('Crear Alerta / Notificación', `
            <form id="form-notif" onsubmit="Views.Notifications.save(event)">
                <div class="form-group">
                    <label>Destinatarios *</label>
                    <select id="n-target" class="form-control" required style="background:#f9fafb">
                        <option value="all">Envío General (Todos en el instituto)</option>
                        <option value="students">Solo Alumnos</option>
                        <option value="teachers">Solo Profesores</option>
                    </select>
                </div>
                <div class="form-group mt-4">
                    <label>Contenido del Mensaje *</label>
                    <textarea id="n-msg" class="form-control" rows="5" placeholder="Escribe tu aviso aquí..." required></textarea>
                </div>
                
                <div class="form-group mt-4 pt-4" style="border-top:1px solid #eee">
                    <button type="submit" class="btn btn-primary w-full shadow-md" style="padding:0.75rem;"><i class="fa-regular fa-paper-plane"></i> Publicar y Notificar</button>
                </div>
            </form>
        `);
    },

    save(e) {
        e.preventDefault();
        UI.showLoader();
        DB.insert('notifications', {
            senderId: Auth.getUser().id,
            targetRole: document.getElementById('n-target').value,
            message: document.getElementById('n-msg').value,
            date: new Date().toISOString(),
            readBy: []
        });
        UI.closeModal();
        UI.showToast('Aviso publicado a los destinatarios', 'success');
        UI.renderLayout();
        this.render();
        UI.hideLoader();
    }
};
