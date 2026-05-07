window.Views = window.Views || {};

Views.Logs = {
    render(page = 1) {
        if (!Auth.hasRole('admin')) {
            document.getElementById('router-view').innerHTML = `
                <div class="card" style="text-align:center; padding: 4rem;">
                    <i class="fa-solid fa-lock text-danger" style="font-size:3rem;"></i>
                    <h2 class="mt-4">Acceso Restringido</h2>
                    <p class="text-muted">Solo los administradores pueden ver la auditoría.</p>
                </div>
            `;
            return;
        }

        const logsList = DB.getTable('logs');
        logsList.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        
        const limit = 25;
        const pagedData = DB.paginate(logsList, page, limit);

        document.getElementById('router-view').innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-shield-halved"></i> Auditoría del Sistema</h1>
                    <p class="text-muted mt-2">Historial detallado de todas las acciones realizadas en la plataforma.</p>
                </div>
                <button class="btn btn-secondary" onclick="DB.init().then(() => Views.Logs.render())"><i class="fa-solid fa-sync"></i> Sincronizar</button>
            </div>
            
            <div class="card" style="padding:0; overflow:hidden;">
                <div class="table-container">
                    <table id="logs-table" style="width:100%">
                        <thead style="background:var(--bg-color)">
                            <tr>
                                <th style="padding:1rem">Fecha y Hora</th>
                                <th>Usuario</th>
                                <th>Acción</th>
                                <th>Tabla</th>
                                <th>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pagedData.data.map(log => {
                                let actionBadge = log.action === 'INSERT' ? 'success' : log.action === 'UPDATE' ? 'warning' : 'danger';
                                let date = new Date(log.created_at).toLocaleString('es-AR');
                                
                                return `
                                <tr style="border-bottom: 1px solid var(--border-color); font-size:0.9rem">
                                    <td style="padding:1rem; white-space:nowrap" class="text-muted">${date}</td>
                                    <td>
                                        <div style="font-weight:600">${log.user_name || 'Desconocido'}</div>
                                        <div style="font-size:0.75rem; color:#888">${log.user_id || '-'}</div>
                                    </td>
                                    <td><span class="badge badge-${actionBadge}">${log.action}</span></td>
                                    <td style="font-weight:600; color:var(--primary)">${log.table_name}</td>
                                    <td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer" onclick="UI.openModal('Detalles de Acción', '<pre style=\\'background:#f8fafc; padding:1rem; border-radius:8px; font-size:0.8rem; overflow-x:auto;\\'>' + JSON.stringify(${JSON.stringify(log.details)}, null, 2) + '</pre>')">
                                        <code>${log.details}</code>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                            ${pagedData.data.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:2rem" class="text-muted">No hay registros de auditoría</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>

                ${pagedData.totalPages > 1 ? `
                <div style="padding:1rem; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                    <button class="btn btn-secondary" ${page === 1 ? 'disabled' : ''} onclick="Views.Logs.render(${page - 1})">Anterior</button>
                    <span class="text-muted">Página ${page} de ${pagedData.totalPages}</span>
                    <button class="btn btn-secondary" ${page === pagedData.totalPages ? 'disabled' : ''} onclick="Views.Logs.render(${page + 1})">Siguiente</button>
                </div>` : ''}
            </div>
        `;
    }
};
