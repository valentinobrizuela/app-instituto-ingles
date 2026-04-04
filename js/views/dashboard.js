window.Views = window.Views || {};

Views.Dashboard = {
    render() {
        const user = Auth.getUser();
        let html = `<div class="dashboard-header mb-4">
                        <h1 class="text-primary" style="font-size:2.5rem; letter-spacing:-1px;">Hola, ${user.name} 👋</h1>
                        <p class="text-muted">Bienvenido al panel de control de West House English School.</p>
                    </div>`;

        const users = DB.getTable('users');
        const payments = DB.getTable('payments');
        const courses = DB.getTable('courses');
        const attendance = DB.getTable('attendance');
        
        if(user.role === 'admin') {
            const totalAlumnos = users.filter(u => u.role === 'student').length;
            const totalProfesores = users.filter(u => u.role === 'teacher').length;
            const deudas = payments.filter(p => p.status !== 'Pagado').length;
            const ingresos = payments.filter(p => p.status === 'Pagado').reduce((acc, p) => acc + p.amount, 0);

            const ausentes = attendance.filter(a => a.status === 'Ausente');
            
            html += `
                <div style="display:grid; grid-template-columns: 2.5fr 1fr; gap:1.5rem; margin-bottom:1rem">
                    <!-- Left Column: Metrics & Charts -->
                    <div style="display:flex; flex-direction:column; gap:1rem;">
                        
                        <!-- Mini Metrics Cards -->
                        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:1rem;">
                            <div class="card metric-card" style="padding:1rem; border-left: 4px solid var(--primary);">
                                <h3 class="text-muted uppercase" style="font-size:0.7rem; letter-spacing:1px"><i class="fa-solid fa-user-graduate"></i> Alumnos</h3>
                                <div style="font-size:1.8rem;font-weight:700;color:var(--text-main);margin-top:0.25rem;line-height:1">${totalAlumnos}</div>
                            </div>
                            <div class="card metric-card" style="padding:1rem; border-left: 4px solid var(--success);">
                                <h3 class="text-muted uppercase" style="font-size:0.7rem; letter-spacing:1px"><i class="fa-solid fa-money-bill-wave"></i> Ingresos ($)</h3>
                                <div style="font-size:1.8rem;font-weight:700;color:var(--success);margin-top:0.25rem;line-height:1">${ingresos.toFixed(2)}</div>
                            </div>
                            <div class="card metric-card" style="padding:1rem; border-left: 4px solid var(--danger);">
                                <h3 class="text-muted uppercase" style="font-size:0.7rem; letter-spacing:1px"><i class="fa-solid fa-triangle-exclamation"></i> Riesgo</h3>
                                <div style="font-size:1.8rem;font-weight:700;color:var(--danger);margin-top:0.25rem;line-height:1">${deudas} Deudas</div>
                            </div>
                            <div class="card metric-card" style="padding:1rem; border-left: 4px solid var(--info);">
                                <h3 class="text-muted uppercase" style="font-size:0.7rem; letter-spacing:1px"><i class="fa-solid fa-chalkboard-user"></i> Staff</h3>
                                <div style="font-size:1.8rem;font-weight:700;color:var(--info);margin-top:0.25rem;line-height:1">${totalProfesores}</div>
                            </div>
                        </div>
                        
                        <!-- Compact Charts Area -->
                        <div style="display:flex; gap:1rem;">
                            <div class="card" style="flex:2; padding:1.25rem; position: relative;">
                                <h3 class="mb-2" style="font-size:1.1rem; border-bottom:1px solid #eee; padding-bottom:0.5rem">Ingresos vs Deudas</h3>
                                <div style="height:180px;"><canvas id="financeChart"></canvas></div>
                            </div>
                            <div class="card" style="flex:1; padding:1.25rem; position:relative;">
                                <h3 class="mb-2" style="font-size:1.1rem; border-bottom:1px solid #eee; padding-bottom:0.5rem">Porcentaje Niveles</h3>
                                <div style="height:180px;"><canvas id="levelChart"></canvas></div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Actions & Alerts -->
                    <div style="display:flex; flex-direction:column; gap:1rem;">
                        <div class="card" style="padding:1.25rem; background: linear-gradient(135deg, rgba(37,99,235,0.05), rgba(255,255,255,0));">
                            <h2 style="font-size:1.1rem; margin-bottom:1rem; color:var(--primary)"><i class="fa-solid fa-bolt"></i> Acciones Rápidas</h2>
                            <div style="display:grid; grid-template-columns: 1fr; gap:0.5rem">
                                <a href="#/users" class="btn btn-secondary shadow-sm" style="text-align:left; font-size:0.9rem"><i class="fa-solid fa-user-plus w-5"></i> Crear Alumno</a>
                                <a href="#/payments" class="btn btn-secondary shadow-sm" style="text-align:left; font-size:0.9rem"><i class="fa-solid fa-file-invoice w-5"></i> Flujo de Pagos</a>
                                <button onclick="Views.Dashboard.sendMassEmail()" class="btn btn-primary shadow-sm" style="text-align:left; font-size:0.9rem; background:#28a745"><i class="fa-solid fa-envelope w-5"></i> Reporte Mensual</button>
                                
                                <hr style="margin:0.5rem 0; border:none; border-top:1px dashed #cbd5e1"/>
                                
                                <button onclick="Views.Dashboard.simulateTransfer()" class="btn btn-primary shadow-md" style="text-align:left; font-size:0.9rem; background:var(--text-main); color:white; border:none; position:relative; overflow:hidden">
                                    <i class="fa-solid fa-building-columns w-5" style="color:#fbbf24"></i> Simular Transferencia (API)
                                </button>
                                <small class="text-muted mt-1" style="font-size:0.75rem; line-height:1.2">Emula un Webhook bancario: Encontrará una deuda automática y la pagará instantáneamente.</small>
                            </div>
                        </div>

                        <div class="card" style="padding:1.25rem; border: 1px solid rgba(220,53,69,0.2);">
                            <h2 class="text-danger" style="font-size:1.1rem; margin-bottom:1rem;"><i class="fa-solid fa-bell"></i> Alertas de Sistema</h2>
                            <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem">
                                ${ausentes.length > 0 ? `
                                <li style="padding:0.75rem; background:#fff5f5; border-radius:6px; border-left:3px solid var(--danger); font-size:0.85rem">
                                    <strong>${ausentes.length} inasistencias</strong> registradas últimamente.
                                </li>` : ''}
                                ${deudas > 0 ? `
                                <li style="padding:0.75rem; background:#fff5f5; border-radius:6px; border-left:3px solid var(--danger); font-size:0.85rem">
                                    <strong>${deudas} cuotas</strong> en estado Crítico/Atrasado.
                                </li>` : ''}
                                ${ausentes.length===0 && deudas===0 ? `<li class="text-muted" style="font-size:0.85rem">Todo en orden ✅</li>` : ''}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        } 
        else if (user.role === 'teacher') {
            const misCursos = courses.filter(c => c.teacherId === user.id);
            html += `
                <div class="card mb-4 mt-4 border-left-info">
                    <h3 class="text-primary"><i class="fa-solid fa-graduation-cap"></i> Mis Cursos Asignados</h3>
                    <div class="grid-table mt-4" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:1rem;">
                        ${misCursos.map(c => `
                            <div class="card shadow-sm" style="background:#f9fafb">
                                <h4 class="mb-2" style="font-size:1.2rem; font-weight:700;">${c.name}</h4>
                                <p class="text-muted"><i class="fa-regular fa-clock"></i> ${c.schedule}</p>
                                <a href="#/attendance" class="btn btn-primary w-full mt-4"><i class="fa-solid fa-check-to-slot"></i> Tomar Asistencia</a>
                            </div>
                        `).join('')}
                    </div>
                    ${misCursos.length === 0 ? '<p class="text-muted">No tienes cursos asignados actualmente.</p>' : ''}
                </div>
            `;
        }
        else if (user.role === 'student') {
            const misCursos = courses.filter(c => c.id === user.courseId);
            html += `
                <div class="card mb-4 border-left-primary">
                    <h3 class="text-primary"><i class="fa-solid fa-book-open"></i> Mi Nivel Actual</h3>
                    ${misCursos.length > 0 ? `
                        <div class="mt-4 p-4" style="background:var(--bg-color); border-radius:var(--radius); border-left:4px solid var(--primary);">
                            <h4 style="font-size:1.5rem">${misCursos[0].name} <span class="badge badge-info">${misCursos[0].level}</span></h4>
                            <p class="mt-2 text-muted"><i class="fa-regular fa-calendar"></i> Horario: ${misCursos[0].schedule}</p>
                        </div>
                    ` : '<p>No estás asignado a ningún curso.</p>'}
                </div>
                <div class="card mb-4 border-left-warning">
                    <h3><i class="fa-solid fa-bullhorn text-warning"></i> Anuncios</h3>
                    <p style="margin-top:1rem" class="text-muted">Recuerda revisar el <strong>Calendario</strong> para las fechas de examen y la sección de <strong>Materiales</strong> para descargar tus guías de estudio.</p>
                </div>
            `;
        }

        document.getElementById('router-view').innerHTML = html;

        if(user.role === 'admin') {
            setTimeout(() => this.initCharts(), 50);
        }
    },

    initCharts() {
        const ctxFinance = document.getElementById('financeChart');
        const ctxLevel = document.getElementById('levelChart');
        if (!ctxFinance || !ctxLevel) return;

        const payments = DB.getTable('payments');
        const pagados = payments.filter(p => p.status === 'Pagado').reduce((a,b)=>a+b.amount,0);
        const deudas = payments.filter(p => p.status !== 'Pagado').reduce((a,b)=>a+b.amount,0);

        new Chart(ctxFinance, {
            type: 'bar',
            data: {
                labels: ['Ingresos Cobrados', 'Deuda Pendiente'],
                datasets: [{
                    label: 'Monto en $',
                    data: [pagados, deudas],
                    backgroundColor: ['rgba(40, 167, 69, 0.7)', 'rgba(220, 53, 69, 0.7)'],
                    borderColor: ['#28a745', '#dc3545'],
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins:{legend:{display:false}} }
        });

        const users = DB.getTable('users').filter(u=>u.role==='student');
        const levels = { Beginner: 0, Intermediate: 0, Advanced: 0 };
        users.forEach(u => { if(levels[u.level] !== undefined) levels[u.level]++; });

        new Chart(ctxLevel, {
            type: 'doughnut',
            data: {
                labels: ['Beginner', 'Intermediate', 'Advanced'],
                datasets: [{
                    data: [levels.Beginner, levels.Intermediate, levels.Advanced],
                    backgroundColor: ['#ffc107', '#0dcaf0', '#ff7a00'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%'}
        });
    },

    sendMassEmail() {
        const students = DB.getTable('users').filter(u => u.role === 'student');
        const parentEmails = students.map(s => s.parentEmail).filter(e => e).join(',');
        let body = `Estimados Padres/Tutores,\n\nAdjuntamos el resumen académico mensual de su hijo/a en West House English School.\n`;
        body += `Por favor, ingresen a la plataforma o comuníquense para el detalle de asistencias y calificaciones.\n\n`;
        body += `Mensaje Institucional:\n"Este mes hemos avanzado notablemente. ¡Felicitaciones a todos los alumnos!"\n`;
        window.location.href = `mailto:?bcc=${parentEmails}&subject=Reporte Mensual West House&body=${encodeURIComponent(body)}`;
        UI.showToast("Generando reporte mensual. Se abrirá tu cliente de correo predeterminado.", "success");
    },

    simulateTransfer() {
        const payments = DB.getTable('payments');
        const deudas = payments.filter(p => p.status !== 'Pagado');
        if (deudas.length === 0) {
            UI.showToast("¡Todo está al día! No hay deudas para simular pagos.", "info");
            return;
        }

        deudas.sort((a,b) => new Date(a.date) - new Date(b.date));
        const deudaPagar = deudas[0];

        const user = DB.getTable('users').find(u => u.id === deudaPagar.studentId);
        
        UI.showToast("⏳ Receptando Webhook bancario entrante...", "info");
        
        setTimeout(() => {
            DB.update('payments', deudaPagar.id, { status: 'Pagado' });
            UI.showToast(`🔥 PAGO ACREDITADO: $${deudaPagar.amount} de ${user ? user.name : 'Usuario'}. El sistema financiero se ha auto-actualizado.`, "success");
            this.render();
        }, 1500);
    }
}
