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

        const recaudado = payments.filter(p => p.status === 'Pagado').reduce((acc, p) => acc + Number(p.amount || 0), 0);
        const deuda = payments.filter(p => p.status !== 'Pagado').reduce((acc, p) => acc + Number(p.amount || 0), 0);
        
        const limit = 10;
        const pagedData = DB.paginate(payments, page, limit);

        document.getElementById('router-view').innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-money-check-dollar"></i> Panel Financiero</h1>
                    <p class="text-muted mt-2">Control de cobros, cuotas pendientes y reportes económicos.</p>
                <div>
                    <button class="btn btn-secondary shadow-sm" onclick="Views.Payments.exportAll()" style="margin-right:0.5rem"><i class="fa-solid fa-file-csv"></i> Exportar CSV</button>
                    <button class="btn btn-primary shadow-md" onclick="Views.Payments.openModal()"><i class="fa-solid fa-file-invoice-dollar"></i> Registrar Nuevo Pago</button>
                </div>
            </div>
            
            <div class="responsive-grid" style="display:flex; gap:1rem; mb-4">
                <div class="card metric-card" style="flex:1; border-left: 4px solid var(--success); min-width: 200px;">
                    <h3 class="text-muted text-sm uppercase"><i class="fa-solid fa-vault"></i> Recaudado</h3>
                    <div style="font-size:2.5rem;font-weight:700;color:var(--success);margin-top:0.5rem">$${recaudado.toFixed(2)}</div>
                </div>
                <div class="card metric-card" style="flex:1; border-left: 4px solid var(--danger); min-width: 200px;">
                    <h3 class="text-muted text-sm uppercase"><i class="fa-solid fa-triangle-exclamation"></i> Deuda Activa</h3>
                    <div style="font-size:2.5rem;font-weight:700;color:var(--danger);margin-top:0.5rem">$${deuda.toFixed(2)}</div>
                </div>
                <div class="card metric-card" style="flex:1; border-left: 4px solid var(--info); min-width: 200px;">
                    <h3 class="text-muted text-sm uppercase"><i class="fa-solid fa-file-lines"></i> Transacciones</h3>
                    <div style="font-size:2.5rem;font-weight:700;color:var(--info);margin-top:0.5rem">${payments.length}</div>
                </div>
            </div>

            <div class="card p-0 shadow-sm overflow-hidden" style="background:#fff">
                <div style="padding:1.25rem 1.5rem; border-bottom:1px solid #e2e8f0; background:#f8fafc; display:flex; justify-content:space-between; align-items:center">
                    <h3 style="font-size:1.1rem" class="text-main"><i class="fa-solid fa-clock-rotate-left text-primary"></i> Historial de Movimientos</h3>
                </div>
                <div class="table-container">
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
        const payments = allPayments.filter(p => String(p.student_id) === String(student.id));
        payments.sort((a,b) => new Date(b.date) - new Date(a.date));

        const deuda = payments.filter(p => p.status !== 'Pagado').reduce((acc, p) => acc + Number(p.amount || 0), 0);

        if (payments.length === 0) {
            document.getElementById('router-view').innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-file-invoice"></i> Mi Estado de Pagos</h1>
                        <p class="text-muted mt-2">No tienes pagos registrados actualmente.</p>
                    </div>
                </div>
                <div class="card" style="text-align:center; padding: 4rem;">
                    <i class="fa-solid fa-circle-check text-success" style="font-size:3.5rem;"></i>
                    <h2 class="mt-4">¡Todo en orden!</h2>
                    <p class="text-muted">No se registran deudas ni historial de pagos a tu nombre en el sistema.</p>
                </div>
            `;
            return;
        }

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
                <div class="table-container">
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
            </div>
        `;
    },

    getBadge(status) {
        return status === 'Pagado' ? '<span class="badge badge-success" style="background:#dcfce7; color:#166534"><i class="fa-solid fa-check"></i> Pagado</span>' 
             : status === 'Atrasado' ? '<span class="badge badge-danger" style="background:#fee2e2; color:#991b1b; animation:pulse 2s infinite"><i class="fa-solid fa-triangle-exclamation"></i> Atrasado</span>'
             : '<span class="badge badge-warning" style="background:#fef3c7; color:#92400e"><i class="fa-regular fa-clock"></i> Pendiente</span>';
    },

    row(p) {
        const student = DB.getTable('users').find(u => String(u.id) === String(p.student_id));
        return `
            <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s">
                <td style="padding:1.25rem 1rem;">
                    <div style="font-weight:600; color:var(--text-main)"><i class="fa-solid fa-user-graduate text-primary" style="margin-right:0.5rem"></i> ${student ? student.name : 'Usuario Eliminado'}</div>
                    ${student && student.parent_email ? `<div style="font-size:0.8rem; margin-top:0.25rem" class="text-muted">Tutor: ${student.parent_email}</div>` : ''}
                    ${student && student.parent_phone ? `<div style="margin-top:0.25rem; font-size:0.8rem;"><a href="https://wa.me/${student.parent_phone.replace(/\\D/g,'')}?text=Hola,%20contacto%20desde%20administracion%20de%20West%20House." target="_blank" style="color:#10b981; text-decoration:none; font-weight:bold"><i class="fa-brands fa-whatsapp"></i> Contactar</a></div>` : ''}
                </td>
                <td><i class="fa-regular fa-calendar-days text-muted"></i> ${new Date(p.date).toLocaleDateString('es-ES', {month:'short', day:'numeric', year:'numeric'})}</td>
                <td style="font-weight:700; color:var(--success); font-size:1.1rem">$${Number(p.amount).toFixed(2)}</td>
                <td>
                    ${this.getBadge(p.status)}
                </td>
                <td style="text-align:center">
                    <div style="display:flex; justify-content:center; gap:0.25rem; flex-wrap:wrap">
                        <button class="btn btn-secondary" style="font-size:0.75rem; padding:0.4rem" onclick="Views.Payments.printReceipt(${p.id})" title="Ver Recibo Digital">
                            <i class="fa-solid fa-receipt"></i> Recibo
                        </button>
                        <button class="btn btn-primary" style="font-size:0.75rem; padding:0.4rem" onclick="Views.Payments.sendInvoice(${p.id})" title="Enviar Factura por Email">
                            <i class="fa-solid fa-envelope"></i>
                        </button>
                        <button class="btn btn-secondary" style="font-size:0.75rem; padding:0.4rem" onclick="Views.Payments.toggleStatus(${p.id})" title="Cambiar Estado">
                            <i class="fa-solid fa-rotate"></i>
                        </button>
                        ${p.status !== 'Pagado' && student && student.parent_phone ? `
                        <a class="btn" style="background:#dcfce7; color:#166534; padding:0.4rem" href="https://wa.me/${student.parent_phone.replace(/\D/g,'')}?text=Hola%20${student.name},%20te%20recordamos%20que%20tienes%20una%20cuota%20pendiente%20de%20$${p.amount}%20con%20vencimiento%20el%20${p.date}.%20Saludos%20West%20House." target="_blank" title="Recordatorio WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                        </a>
                        ` : ''}
                        <button class="btn" style="background:#fee2e2; color:#b91c1c; border:none; padding:0.4rem; border-radius:6px; cursor:pointer;" onclick="Views.Payments.delete(${p.id})" title="Eliminar">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    openModal() {
        const students = DB.getTable('users').filter(u => u.role === 'student');
        students.sort((a,b) => a.name.localeCompare(b.name));
        
        UI.openModal('Registrar Cobro / Deuda', `
            <form id="form-payment" onsubmit="Views.Payments.save(event)">
                <div class="form-group">
                    <label>Alumno Pagador *</label>
                    <select id="p-student" class="form-control" required style="background:#f9fafb; font-weight:600">
                        ${students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                
                <div class="responsive-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
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
                student_id: document.getElementById('p-student').value,
                amount: parseFloat(document.getElementById('p-amount').value),
                date: document.getElementById('p-date').value,
                status: document.getElementById('p-status').value
            });

            UI.closeModal();
            UI.showToast('Transacción registrada con éxito', 'success');
            
            // Si está pagado, notificar al admin con un toast
            if (newPayment.status === 'Pagado') {
                UI.showToast('Pago registrado. Usa el botón ✉ en la tabla para enviar la factura.', 'info');
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
        const payment = payments.find(p => String(p.id) === Number(id));
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

    sendInvoice(id) {
        const payments = DB.getTable('payments');
        const p = payments.find(item => String(item.id) === String(id));
        if (!p) { UI.showToast('Pago no encontrado', 'danger'); return; }

        const student = DB.getTable('users').find(u => String(u.id) === String(p.student_id));
        const recipientEmail = (student && student.parent_email) || (student && student.email);

        if (!recipientEmail) {
            UI.showToast('Este alumno no tiene email registrado (ni propio ni de tutor).', 'danger');
            return;
        }

        if (!confirm(`¿Enviar la factura de $${Number(p.amount).toFixed(2)} al email: ${recipientEmail}?`)) return;

        const studentName = student ? student.name : 'Alumno';
        const settings = JSON.parse(localStorage.getItem('wh_settings') || '{}');
        const instituteName = settings.instituteName || 'West House English School';
        const invId = `WH-${String(p.date).replace(/-/g,'').slice(0,8)}-${String(p.id).padStart(4,'0')}`;

        const subject = encodeURIComponent(`Factura de Pago [${invId}] - ${instituteName}`);
        const body = encodeURIComponent(
`Estimado/a Tutor/a de ${studentName},

Le informamos que hemos registrado el siguiente pago:

  Factura N°: ${invId}
  Alumno: ${studentName}
  Monto: $${Number(p.amount).toFixed(2)}
  Fecha: ${p.date}
  Estado: ${p.status}

Gracias por confiar en ${instituteName}.

Saludos,
Administración West House`
        );

        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
        UI.showToast(`Abriendo cliente de email para: ${recipientEmail}`, 'success');
    },

    exportAll() {
        const data = DB.getTable('payments');
        const users = DB.getTable('users');
        
        const report = data.map(p => {
            const s = users.find(u => u.id === p.student_id) || {name: '?'};
            return {
                Fecha: p.date,
                Alumno: s.name,
                Monto: p.amount,
                Estado: p.status
            };
        });
        
        UI.downloadCSV('pagos_westhouse.csv', report);
    },

    printReceipt(id) {
        const p = DB.getTable('payments').find(item => String(item.id) === String(id));
        const s = DB.getTable('users').find(u => String(u.id) === String(p.student_id));
        const settings = JSON.parse(localStorage.getItem('wh_settings') || '{}');
        
        const modalContent = `
            <div id="printable-receipt" style="padding:2rem; font-family:'Courier New', Courier, monospace; background:#fff; color:#000; border:1px solid #ccc; max-width:500px; margin:0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)">
                <div style="text-align:center; border-bottom:2px dashed #000; padding-bottom:1rem; margin-bottom:1rem">
                    <h2 style="margin:0; font-size:1.5rem">${settings.instituteName || 'West House English School'}</h2>
                    <p style="margin:5px 0; font-size:0.8rem">Recibo de Pago Oficial</p>
                    <p style="margin:0; font-size:0.7rem">Fecha: ${new Date(p.date).toLocaleString()}</p>
                </div>
                
                <div style="margin-bottom:1rem">
                    <p><strong>Nro. de Operación:</strong> #${p.id.toString().padStart(6, '0')}</p>
                    <p><strong>Alumno:</strong> ${s ? s.name : 'N/A'}</p>
                    <p><strong>Concepto:</strong> Cuota Mensual de Inglés</p>
                </div>
                
                <div style="border-top:1px solid #000; border-bottom:1px solid #000; padding:1rem 0; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center">
                    <span style="font-size:1.2rem; font-weight:700">TOTAL</span>
                    <span style="font-size:1.5rem; font-weight:900">$${Number(p.amount).toFixed(2)}</span>
                </div>
                
                <div style="text-align:center; font-size:0.8rem">
                    <p style="margin-bottom:2rem">Estado: <strong>${p.status.toUpperCase()}</strong></p>
                    <div style="border-top:1px solid #ccc; width:150px; margin:0 auto; padding-top:0.5rem">
                        Firma Autorizada
                    </div>
                    <p style="margin-top:2rem; font-style:italic">¡Gracias por confiar en West House!</p>
                </div>
            </div>
            <div style="text-align:center; margin-top:2rem" class="no-print">
                <button class="btn btn-primary" onclick="window.print()"><i class="fa-solid fa-print"></i> Imprimir o Guardar PDF</button>
            </div>
        `;
        
        UI.openModal('Recibo Digital', modalContent);
    }
};
