window.Views = window.Views || {};

Views.Dashboard = {
    render() {
        const user = Auth.getUser();
        const viewContainer = document.getElementById('router-view');

        if (user.role === 'admin') {
            this.renderAdmin(user, viewContainer);
        } else if (user.role === 'teacher') {
            this.renderTeacher(user, viewContainer);
        } else {
            this.renderStudent(user, viewContainer);
        }
    },

    renderAdmin(user, container) {
        const users = DB.getTable('users');
        const students = users.filter(u => u.role === 'student');
        const teachers = users.filter(u => u.role === 'teacher');
        const payments = DB.getTable('payments');
        
        const totalRevenue = payments.filter(p => p.status === 'Pagado').reduce((acc, p) => acc + p.amount, 0);
        const totalExpected = payments.reduce((acc, p) => acc + p.amount, 0);
        const efficiency = totalExpected > 0 ? (totalRevenue / totalExpected) * 100 : 0;

        const attendance = DB.getTable('attendance');
        const presentes = attendance.filter(a => a.status === 'Presente').length;
        const totalAsist = attendance.length;
        const attendanceRate = totalAsist > 0 ? Math.round((presentes / totalAsist) * 100) : 100;

        container.innerHTML = `
            <div class="header-section mb-5">
                <h1 class="hero-title" style="color:var(--text-main); margin-bottom: 0.5rem">Panel de Control</h1>
                <p class="text-muted">Bienvenido de nuevo, ${user.name}. Aquí tienes un resumen de la academia.</p>
            </div>

            <!-- Metric Cards -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
                <div class="card" style="border-bottom: 4px solid var(--primary); padding: 1.25rem;">
                    <div style="display:flex; justify-content:space-between; align-items:start">
                        <div>
                            <p class="text-muted text-sm uppercase font-bold" style="letter-spacing:0.5px; font-size:0.7rem">Alumnos Activos</p>
                            <h2 style="font-size:2rem; margin-top:0.5rem">${students.length}</h2>
                        </div>
                        <div style="background:var(--primary-light); color:var(--primary); padding:8px; border-radius:8px">
                            <i class="fa-solid fa-user-graduate fa-lg"></i>
                        </div>
                    </div>
                </div>
                <div class="card" style="border-bottom: 4px solid var(--success); padding: 1.25rem;">
                    <div style="display:flex; justify-content:space-between; align-items:start">
                        <div>
                            <p class="text-muted text-sm uppercase font-bold" style="letter-spacing:0.5px; font-size:0.7rem">Eficiencia Cobro</p>
                            <h2 style="font-size:2rem; margin-top:0.5rem">${efficiency.toFixed(1)}%</h2>
                        </div>
                        <div style="background:var(--badge-success-bg); color:var(--success); padding:8px; border-radius:8px">
                            <i class="fa-solid fa-hand-holding-dollar fa-lg"></i>
                        </div>
                    </div>
                    <div class="text-muted" style="font-size:0.75rem; margin-top:0.5rem">$${totalRevenue.toFixed(0)} cobrados</div>
                </div>
                <div class="card" style="border-bottom: 4px solid var(--info); padding: 1.25rem;">
                    <div style="display:flex; justify-content:space-between; align-items:start">
                        <div>
                            <p class="text-muted text-sm uppercase font-bold" style="letter-spacing:0.5px; font-size:0.7rem">Asistencia Prom.</p>
                            <h2 style="font-size:2rem; margin-top:0.5rem">${attendanceRate}%</h2>
                        </div>
                        <div style="background:var(--badge-info-bg); color:var(--info); padding:8px; border-radius:8px">
                            <i class="fa-solid fa-calendar-check fa-lg"></i>
                        </div>
                    </div>
                    <div class="text-muted" style="font-size:0.75rem; margin-top:0.5rem">Media institucional</div>
                </div>
                <div class="card" style="border-bottom: 4px solid var(--accent); padding: 1.25rem;">
                    <div style="display:flex; justify-content:space-between; align-items:start">
                        <div>
                            <p class="text-muted text-sm uppercase font-bold" style="letter-spacing:0.5px; font-size:0.7rem">Profesores</p>
                            <h2 style="font-size:2rem; margin-top:0.5rem">${teachers.length}</h2>
                        </div>
                        <div style="background:var(--badge-warning-bg); color:var(--accent); padding:8px; border-radius:8px">
                            <i class="fa-solid fa-chalkboard-user fa-lg"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Dashboard Grid -->
            <div style="display:grid; grid-template-columns: 240px 1fr; gap: 2rem;">
                
                <!-- Left: Quick Actions -->
                <div style="display:flex; flex-direction:column; gap:1rem;">
                    <h3 style="font-size:1.1rem; margin-bottom:0.5rem"><i class="fa-solid fa-bolt text-warning"></i> Acciones</h3>
                    <button class="btn btn-secondary w-full" style="justify-content:flex-start; padding:1rem" onclick="window.location.hash='#/users'">
                        <i class="fa-solid fa-user-plus"></i> Nuevo Alumno
                    </button>
                    <button class="btn btn-secondary w-full" style="justify-content:flex-start; padding:1rem" onclick="window.location.hash='#/payments'">
                        <i class="fa-solid fa-file-invoice"></i> Registrar Pago
                    </button>
                    <button class="btn btn-secondary w-full" style="justify-content:flex-start; padding:1rem" onclick="window.location.hash='#/attendance'">
                        <i class="fa-solid fa-calendar-plus"></i> Tomar Asistencia
                    </button>
                    <button class="btn btn-secondary w-full" style="justify-content:flex-start; padding:1rem" onclick="UI.showCommandPalette()">
                        <i class="fa-solid fa-magnifying-glass"></i> Búsqueda (Ctrl+K)
                    </button>

                    <div class="card" style="margin-top:1rem; border:1px solid var(--primary-light); background:var(--bg-main)">
                        <h4 style="font-size:0.85rem; margin-bottom:1rem; color:var(--primary); font-weight:700"><i class="fa-solid fa-paw"></i> Los Consejos de Mila</h4>
                        <div id="mila-insights">
                            ${this.renderMilaInsights()}
                        </div>
                    </div>
                </div>

                <!-- Right: Charts and Activity -->
                <div style="display:flex; flex-direction:column; gap:2rem;">
                    
                    <!-- Charts Row -->
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem">
                        <div class="card">
                            <h3 class="mb-4"><i class="fa-solid fa-chart-column text-primary"></i> Ingresos Mensuales</h3>
                            <canvas id="mainChart" style="max-height: 280px; width: 100%;"></canvas>
                        </div>
                        <div class="card">
                            <h3 class="mb-4"><i class="fa-solid fa-bullhorn text-warning"></i> Último Aviso</h3>
                            <div id="latest-announcement-admin">
                                ${this.renderLatestAnnouncement()}
                            </div>
                        </div>
                    </div>

                    <!-- Activity Row -->
                    <div class="card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem">
                            <h3 style="margin:0"><i class="fa-solid fa-clock-rotate-left text-primary"></i> Actividad Reciente</h3>
                        </div>
                        <div id="activity-feed-container">
                            ${this.renderActivityFeed()}
                        </div>
                    </div>

                </div>
            </div>
        `;

        this.initAdminChart();
    },

    renderTeacher(user, container) {
        const courses = DB.getTable('courses').filter(c => Number(c.teacher_id) === Number(user.id));
        const students = DB.getTable('users').filter(u => Number(u.teacher_id) === Number(user.id));

        container.innerHTML = `
            <div class="header-section mb-5">
                <h1 class="hero-title" style="color:var(--text-main); margin-bottom: 0.5rem">Panel del Profesor</h1>
                <p class="text-muted">Bienvenido, Prof. ${user.name.split(' ')[1] || user.name}. Tienes ${courses.length} cursos a cargo hoy.</p>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                <div class="card">
                    <h3 class="mb-4"><i class="fa-solid fa-chalkboard text-primary"></i> Mis Cursos</h3>
                    ${courses.length > 0 ? courses.map(c => `
                        <div style="padding:1rem; border:1px solid var(--border-color); border-radius:10px; margin-bottom:0.75rem">
                            <p style="font-weight:700">${c.name}</p>
                            <p class="text-muted text-sm">${c.schedule}</p>
                        </div>
                    `).join('') : '<p class="text-muted">No tienes cursos asignados.</p>'}
                </div>
                
                <div class="card">
                    <h3 class="mb-4"><i class="fa-solid fa-users-rectangle text-info"></i> Mis Alumnos</h3>
                    <div style="font-size:3rem; font-weight:800; color:var(--info)">${students.length}</div>
                    <p class="text-muted mb-4">Total de estudiantes bajo tu seguimiento.</p>
                    <button class="btn btn-primary w-full" onclick="window.location.hash='#/attendance'">Registrar Asistencia</button>
                </div>

                <div class="card">
                    <h3 class="mb-4"><i class="fa-solid fa-bullhorn text-warning"></i> Comunicados</h3>
                    <div id="latest-announcement-teacher">
                        ${this.renderLatestAnnouncement()}
                    </div>
                </div>
            </div>
        `;
    },

    renderLatestAnnouncement() {
        const user = Auth.getUser();
        const notifs = DB.getTable('notifications').filter(n => n.target === 'all' || n.target === user.role);
        const last = notifs.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];

        if (!last) return '<p class="text-muted text-sm">No hay avisos recientes.</p>';

        return `
            <div style="background:var(--bg-main); padding:1rem; border-radius:12px; cursor:pointer" onclick="UI.showAnnouncementDetail('${last.id}')">
                <p style="font-weight:700; color:var(--primary); margin-bottom:0.25rem">${last.title}</p>
                <p class="text-sm text-muted" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${last.message}</p>
                <div style="margin-top:0.75rem; font-size:0.7rem; color:var(--text-muted)">${new Date(last.created_at).toLocaleDateString()}</div>
            </div>
        `;
    },

    renderMilaInsights() {
        const users = DB.getTable('users').filter(u => u.role === 'student');
        const attendance = DB.getTable('attendance');
        
        // Find a student with "risk" (missing last 2 classes)
        let riskStudent = null;
        for (const s of users) {
            const history = attendance.filter(a => String(a.student_id) === String(s.id)).sort((a,b) => new Date(b.date) - new Date(a.date));
            if (history.length >= 2 && history[0].status === 'Ausente' && history[1].status === 'Ausente') {
                riskStudent = s;
                break;
            }
        }

        const message = riskStudent 
            ? UI.Mila.getSuggestion('attendance_risk', { name: riskStudent.name })
            : "¡Todo se ve excelente por aquí! Mila dice que tus alumnos están súper comprometidos hoy. 🐾";

        return `
            <div class="mila-wrapper" style="margin:0; padding:0.75rem; border:none; background:transparent">
                <img src="img/mila.png" class="mila-avatar" style="width:50px; height:50px">
                <div class="mila-bubble" style="font-size:0.8rem; padding:0.75rem">
                    ${message}
                    <div class="mila-bubble-arrow" style="top:15px"></div>
                </div>
            </div>
            ${riskStudent ? `
                <button class="btn btn-secondary w-full mt-3" style="font-size:0.8rem" onclick="window.location.hash='#/users'">
                    <i class="fa-solid fa-magnifying-glass"></i> Ver ficha de ${riskStudent.name.split(' ')[0]}
                </button>
            ` : ''}
        `;
    },

    initAdminChart() {
        setTimeout(() => {
            const payments = DB.getTable('payments');
            const users = DB.getTable('users').filter(u => u.role === 'student');
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            const levels = { Beginner: 0, Intermediate: 0, Advanced: 0 };
            users.forEach(u => { 
                const level = u.level ? u.level.charAt(0).toUpperCase() + u.level.slice(1).toLowerCase() : 'Beginner';
                if (levels[level] !== undefined) levels[level]++; 
                else levels['Beginner']++;
            });
            
            const currentMonthRevenue = payments.reduce((sum, p) => p.status === 'Pagado' ? sum + p.amount : sum, 0);
            
            // Group real payments by month
            const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const monthlyData = new Array(12).fill(0);
            
            payments.forEach(p => {
                if (p.status === 'Pagado' && p.date) {
                    const date = new Date(p.date);
                    if (!isNaN(date)) {
                        monthlyData[date.getMonth()] += p.amount;
                    }
                }
            });

            // Filter out months with 0 to only show months with activity, or just show last 6
            const currentMonth = new Date().getMonth();
            const displayMonths = [];
            const displayData = [];
            for (let i = 5; i >= 0; i--) {
                let m = currentMonth - i;
                if (m < 0) m += 12;
                displayMonths.push(monthLabels[m]);
                displayData.push(monthlyData[m]);
            }

            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
            
            Chart.defaults.color = textColor;
            Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

            const ctx = document.getElementById('mainChart');
            if (ctx) {
                const existingChart = Chart.getChart(ctx);
                if (existingChart) existingChart.destroy();

                if (payments.length === 0 || displayData.every(v => v === 0)) {
                    const container = ctx.parentElement;
                    container.innerHTML = `
                        <h3 class="mb-4"><i class="fa-solid fa-chart-column text-primary"></i> Ingresos Mensuales</h3>
                        <div style="height:280px; display:flex; align-items:center; justify-content:center; flex-direction:column; background:var(--bg-main); border-radius:12px; border:1px dashed var(--border-color)">
                            <i class="fa-solid fa-file-invoice-dollar fa-2xl text-muted mb-3"></i>
                            <p class="text-muted">Sin datos de cobros registrados</p>
                        </div>
                    `;
                } else {
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: displayMonths,
                            datasets: [{
                                label: 'Cobros ($)',
                                data: displayData,
                                backgroundColor: 'rgba(249, 115, 22, 0.8)',
                                hoverBackgroundColor: 'rgba(249, 115, 22, 1)',
                                borderRadius: 8
                            }]
                        },
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { 
                                legend: { display: false }
                            }, 
                            scales: { 
                                y: { beginAtZero: true, grid: { color: gridColor } },
                                x: { grid: { display: false } }
                            } 
                        }
                    });
                }
            }

            const ctxPie = document.getElementById('pieChart');
            if (ctxPie) {
                const existingChart = Chart.getChart(ctxPie);
                if (existingChart) existingChart.destroy();

                if (users.length === 0) {
                     const container = ctxPie.parentElement;
                     container.innerHTML = `
                        <h3 class="mb-4"><i class="fa-solid fa-chart-pie text-accent"></i> Alumnos por Nivel</h3>
                        <div style="height:280px; display:flex; align-items:center; justify-content:center; background:var(--bg-main); border-radius:12px; border:1px dashed var(--border-color)">
                            <p class="text-muted">Sin alumnos registrados</p>
                        </div>
                    `;
                } else {
                    new Chart(ctxPie, {
                        type: 'doughnut',
                        data: {
                            labels: ['Beginner', 'Intermediate', 'Advanced'],
                            datasets: [{
                                data: [levels.Beginner, levels.Intermediate, levels.Advanced],
                                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                                borderWidth: isDark ? 2 : 0,
                                borderColor: isDark ? '#1e293b' : '#ffffff'
                            }]
                        },
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false,
                            cutout: '75%',
                            plugins: {
                                legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, color: textColor } }
                            }
                        }
                    });
                }
            }
        }, 100);
    },

    renderActivityFeed() {
        // Aggregate recent actions from different tables
        const payments = DB.getTable('payments').slice(-3).map(p => ({
            action: `Pago de ${p.student_name}: $${p.amount}`,
            date: p.date,
            icon: 'fa-solid fa-money-bill-wave',
            color: 'var(--success)'
        }));
        
        const attendance = DB.getTable('attendance').slice(-3).map(a => ({
            action: `Asistencia tomada en ${a.course_name}`,
            date: a.date,
            icon: 'fa-solid fa-calendar-check',
            color: 'var(--warning)'
        }));

        const students = DB.getTable('users').filter(u => u.role === 'student').slice(-3).map(u => ({
            action: `Nuevo alumno inscrito: ${u.name}`,
            date: u.created_at || 'Reciente',
            icon: 'fa-solid fa-user-plus',
            color: 'var(--info)'
        }));

        const activities = [...payments, ...attendance, ...students].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

        if (activities.length === 0) return '<p class="text-muted">No hay actividad reciente.</p>';

        return `
            <ul class="activity-feed">
                ${activities.map(act => `
                    <li class="activity-item">
                        <div class="activity-icon" style="background:${act.color}22; color:${act.color}">
                            <i class="${act.icon}" style="font-size:0.8rem"></i>
                        </div>
                        <div class="activity-content">
                            <p style="font-size:0.9rem; margin:0">${act.action}</p>
                            <p class="activity-time">${act.date}</p>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }
};
