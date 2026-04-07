window.Views = window.Views || {};

Views.Payments = {
    render(page = 1) {
        const user = Auth.getUser();

        if (!Auth.hasRole(['admin', 'student'])) {
            document.getElementById('router-view').innerHTML = `
                <div class="card" style="text-align:center; padding: 4rem;">
                    <i class="fa-solid fa-lock text-danger" style="font-size:3rem;"></i>
                    <h2 class="mt-4">Acceso Restringido</h2>
                    <p class="text-muted">El área financiera es exclusiva para administradores y alumnos.</p>
                </div>
            `;
            return;
        }

        const allPayments = DB.getTable('payments');

        if (user.role === 'student') {
            this.renderStudentView(user);
            return;
        }

        const payments = [...allPayments];
        payments.sort((a,b) => new Date(b.date) - new Date(a.date));

        const recaudado = payments.filter(p => p.status === 'Pagado').reduce((acc, p) => acc + p.amount, 0);
        const deuda = payments.filter(p => p.status !== 'Pagado').reduce((acc, p) => acc + p.amount, 0);
        
        const limit = 10;
        const pagedData = DB.paginate(payments, page, limit);

        document.getElementById('router-view').innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-money-check-dollar"></i> Panel Financiero</h1>
                    <p class="text-muted mt-2">Control de cobros, cuotas pendientes y reportes económicos.</p>
                </div>
                <button class="btn btn-primary shadow-md" onclick="Views.Payments.openModal()"><i class="fa-solid fa-file-invoice-dollar"></i> Registrar Nuevo Pago</button>
            </div>
            
            <div class="flex gap-4 mb-4">
                <div class="card metric-card" style="flex:1; border-left: 4px solid var(--success);">
                    <h3 class="text-muted text-sm uppercase"><i class="fa-solid fa-vault"></i> Recaudado</h3>
                    <div style="font-size:2.5rem;font-weight:700;color:var(--success);margin-top:0.5rem">$${recaudado.toFixed(2)}</div>
                </div>
                <div class="card metric-card" style="flex:1; border-left: 4px solid var(--danger);">
                    <h3 class="text-muted text-sm uppercase"><i class="fa-solid fa-triangle-exclamation"></i> Deuda Activa</h3>
                    <div style="font-size:2.5rem;font-weight:700;color:var(--danger);margin-top:0.5rem">$${deuda.toFixed(2)}</div>
                </div>
                <div class="card metric-card" style="flex:1; border-left: 4px solid var(--info);">
                    <h3 class="text-muted text-sm uppercase"><i class="fa-solid fa-file-lines"></i> Transacciones</h3>
                    <div style="font-size:2.5rem;font-weight:700;color:var(--info);margin-top:0.5rem">${payments.length}</div>
                </div>
            </div>

            <div class="card p-0 shadow-sm overflow-hidden" style="background:#fff">
                <div style="padding:1.25rem 1.5rem; border-bottom:1px solid #e2e8f0; background:#f8fafc; display:flex; justify-content:space-between; align-items:center">
                    <h3 style="font-size:1.1rem" class="text-main"><i class="fa-solid fa-clock-rotate-left text-primary"></i> Historial de Movimientos</h3>
                </div>
                <div class="table-responsive">
                    <table id="payments-table" class="w-full">
                        <thead style="background:#f1f5f9">
                            <tr>
                                <th>Referencia Alumno</th>
                                <th>Fecha Vencimiento</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th style="text-align:center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pagedData.data.map(p => this.row(p)).join('')}
                            ${pagedData.data.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:3rem; color:var(--text-muted)">No hay movimientos registrados.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
                
                ${pagedData.totalPages > 1 ? `
                <div style="padding:1rem; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                    <button class="btn btn-secondary shadow-sm" ${page === 1 ? 'disabled' : ''} onclick="Views.Payments.render(${page - 1})">
                        <i class="fa-solid fa-angle-left"></i> Anterior
                    </button>
                    <span class="text-muted text-sm font-weight-bold">Página ${page} de ${pagedData.totalPages}</span>
                    <button class="btn btn-secondary shadow-sm" ${page === pagedData.totalPages ? 'disabled' : ''} onclick="Views.Payments.render(${page + 1})">
                        Siguiente <i class="fa-solid fa-angle-right"></i>
                    </button>
                </div>` : ''}
            </div>
        `;
    },

    renderStudentView(student) {
        const allPayments = DB.getTable('payments');
        const payments = allPayments.filter(p => Number(p.studentId) === Number(student.id));
        payments.sort((a,b) => new Date(b.date) - new Date(a.date));

        const deuda = payments.filter(p => p.status !== 'Pagado').reduce((acc, p) => acc + p.amount, 0);

        document.getElementById('router-view').innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-file-invoice"></i> Mi Estado de Pagos</h1>
                    <p class="text-muted mt-2">Revisa tus próximas cuotas y vencimientos.</p>
                </div>
            </div>

            ${deuda > 0 ? `
                <div class="card mb-4" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(255,255,255,0)); border-left:4px solid var(--danger);">
                    <h2 class="text-danger"><i class="fa-solid fa-triangle-exclamation"></i> Tienes Cuotas Pendientes</h2>
                    <p class="text-muted mt-2" style="font-size:1.1rem">Tu balance actual refleja un atraso de <strong style="color:var(--danger); font-size:1.2rem">$${deuda.toFixed(2)}</strong>. Por favor regulariza tu situación en administración.</p>
                </div>
            ` : `
                <div class="card mb-4" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(255,255,255,0)); border-left:4px solid var(--success);">
                    <h2 class="text-success"><i class="fa-solid fa-circle-check"></i> Al Día</h2>
                    <p class="text-muted mt-2" style="font-size:1.1rem">No tienes ninguna cuota pendiente. ¡Gracias por tu puntualidad!</p>
                </div>
            `}

            <div class="card p-0 shadow-sm" style="overflow:hidden">
                <table class="w-full">
                    <thead style="background:#f8fafc">
                        <tr>
                            <th style="padding:1rem">Mes / Fecha</th>
                            <th style="padding:1rem">Monto</th>
                            <th style="padding:1rem">Estado Actual</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(p => {
                            const dateStr = new Date(p.date).toLocaleDateString('es-ES', {month: 'long', year: 'numeric'});
                            return `
                            <tr>
                                <td style="padding:1rem"><strong>${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</strong><br/><span style="font-size:0.8rem; color:var(--text-muted)">Venc. ${p.date}</span></td>
                                <td style="padding:1rem; font-size:1.1rem; color:var(--primary); font-weight:700">$${Number(p.amount).toFixed(2)}</td>
                                <td style="padding:1rem">${this.getBadge(p.status)}</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    getBadge(status) {
        return status === 'Pagado' ? '<span class="badge badge-success" style="background:#dcfce7; color:#166534"><i class="fa-solid fa-check"></i> Pagado</span>' 
             : status === 'Atrasado' ? '<span class="badge badge-danger" style="background:#fee2e2; color:#991b1b; animation:pulse 2s infinite"><i class="fa-solid fa-triangle-exclamation"></i> Atrasado</span>'
             : '<span class="badge badge-warning" style="background:#fef3c7; color:#92400e"><i class="fa-regular fa-clock"></i> Pendiente</span>';
    },

    row(p) {
        const student = DB.getTable('users').find(u => Number(u.id) === Number(p.studentId));
        return `
            <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s">
                <td style="padding:1.25rem 1rem;">
                    <div style="font-weight:600; color:var(--text-main)"><i class="fa-solid fa-user-graduate text-primary" style="margin-right:0.5rem"></i> ${student ? student.name : 'Usuario Eliminado'}</div>
                    ${student && student.parentEmail ? `<div style="font-size:0.8rem; margin-top:0.25rem" class="text-muted">Tutor: ${student.parentEmail}</div>` : ''}
                    ${student && student.parentPhone ? `<div style="margin-top:0.25rem; font-size:0.8rem;"><a href="https://wa.me/${student.parentPhone.replace(/\D/g,'')}?text=Hola,%20contacto%20desde%20administracion%20de%20West%20House." target="_blank" style="color:#10b981; text-decoration:none; font-weight:bold"><i class="fa-brands fa-whatsapp"></i> Contactar</a></div>` : ''}
                </td>
                <td><i class="fa-regular fa-calendar-days text-muted"></i> ${new Date(p.date).toLocaleDateString('es-ES', {month:'short', day:'numeric', year:'numeric'})}</td>
                <td style="font-weight:700; color:var(--success); font-size:1.1rem">$${Number(p.amount).toFixed(2)}</td>
                <td>
                    ${this.getBadge(p.status)}
                </td>
                <td style="text-align:center">
                    <button class="btn btn-primary shadow-sm" style="font-size:0.8rem; padding:0.4rem 0.6rem; margin-right:4px;" onclick="Views.Payments.sendInvoice(${p.id})" title="Enviar Factura por Email">
                        <i class="fa-solid fa-envelope"></i> Factura
                    </button>
                    <button class="btn btn-secondary shadow-sm" style="font-size:0.8rem; padding:0.4rem 0.6rem" onclick="Views.Payments.toggleStatus(${p.id})">
                        <i class="fa-solid fa-rotate"></i> Estado
                    </button>
                    <button class="btn" style="background:#fee2e2; color:#b91c1c; border:none; padding:0.4rem 0.6rem; border-radius:6px; cursor:pointer;" onclick="Views.Payments.delete(${p.id})" title="Eliminar">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    },

    openModal() {
        const students = DB.getTable('users').filter(u => u.role === 'student');
        UI.openModal('Registrar Cobro / Deuda', `
            <form id="form-payment" onsubmit="Views.Payments.save(event)">
                <div class="form-group">
                    <label>Alumno Pagador *</label>
                    <select id="p-student" class="form-control" required style="background:#f9fafb; font-weight:600">
                        ${students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>Monto a Cobrar ($) *</label>
                        <input type="number" step="0.01" id="p-amount" class="form-control" required placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Estado Inicial *</label>
                        <select id="p-status" class="form-control" required>
                            <option value="Pagado">Facturado / Pagado</option>
                            <option value="Pendiente">Cuota Pendiente</option>
                            <option value="Atrasado">Cuota Atrasada</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Fecha del Movimiento / Vencimiento *</label>
                    <input type="date" id="p-date" class="form-control" required value="${new Date().toISOString().split('T')[0]}">
                </div>

                <div class="form-group mt-4 pt-4" style="border-top:1px solid #eee">
                    <button type="submit" class="btn btn-primary w-full shadow-md" style="padding:0.75rem;"><i class="fa-solid fa-cash-register"></i> Ingresar Transacción</button>
                </div>
            </form>
        `);
    },

    async save(e) {
        e.preventDefault();
        UI.showLoader();
        try {
            const newPayment = await DB.insert('payments', {
                studentId: parseInt(document.getElementById('p-student').value),
                amount: parseFloat(document.getElementById('p-amount').value),
                date: document.getElementById('p-date').value,
                status: document.getElementById('p-status').value
            });

            UI.closeModal();
            UI.showToast('Transacción registrada con éxito', 'success');
            
            // AUTOMACIÓN: Si está pagado, enviar factura inmediatamente
            if (newPayment.status === 'Pagado') {
                this.sendInvoice(newPayment.id, true); // true = silent mode
            }

            this.render();
        } catch (err) {
            UI.showToast('Error al registrar pago', 'danger');
        }
        UI.hideLoader();
    },

    async toggleStatus(id) {
        UI.showLoader();
        const payments = DB.getTable('payments');
        const payment = payments.find(p => Number(p.id) === Number(id));
        if (payment) {
            const nextStatus = payment.status === 'Pagado' ? 'Pendiente' : payment.status === 'Pendiente' ? 'Atrasado' : 'Pagado';
            await DB.update('payments', id, { status: nextStatus });
            UI.showToast('Estado de cobro actualizado a: ' + nextStatus);
            this.render();
        }
        UI.hideLoader();
    },

    async delete(id) {
        if(confirm('¿Seguro que deseas ELIMINAR este registro financiero de forma permanente?')) {
            UI.showLoader();
            await DB.remove('payments', id);
            UI.showToast('Registro financiero eliminado', 'success');
            this.render();
            UI.hideLoader();
        }
    },

    async sendInvoice(id, silent = false) {
        if(!silent && !confirm('¿Deseas enviar la factura electrónica al email del alumno por esta transacción?')) return;
        
        if(!silent) UI.showLoader();
        try {
            const res = await DB.authFetch(`${CONFIG.API_URL}/payments/invoice/${id}`, { method: 'POST' });
            const data = await res.json();
            if(data.success) {
                UI.showToast('Factura enviada correctamente (' + data.data.invoiceId + ')', 'success');
            } else {
                UI.showToast('Error al enviar factura automática', 'danger');
            }
        } catch (err) {
            console.error(err);
            if(!silent) UI.showToast('Error de conexión con el servidor de correos', 'danger');
        }
        if(!silent) UI.hideLoader();
    }
};
