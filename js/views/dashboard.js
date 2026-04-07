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

        container.innerHTML = `
            <div class="header-section mb-5">
                <h1 class="hero-title" style="color:var(--text-main); margin-bottom: 0.5rem">Panel de Control</h1>
                <p class="text-muted">Bienvenido de nuevo, ${user.name}. Aquí tienes un resumen de la academia.</p>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div class="card" style="border-bottom: 4px solid var(--primary)">
                    <div style="display:flex; justify-content:space-between; align-items:start">
                        <div>
                            <p class="text-muted text-sm uppercase font-bold" style="letter-spacing:1px">Alumnos</p>
                            <h2 style="font-size:2.5rem; margin-top:0.5rem">${students.length}</h2>
                        </div>
                        <div style="background:var(--primary-light); color:var(--primary); padding:10px; border-radius:10px">
                            <i class="fa-solid fa-user-graduate fa-xl"></i>
                        </div>
                    </div>
                </div>
                <div class="card" style="border-bottom: 4px solid var(--success)">
                    <div style="display:flex; justify-content:space-between; align-items:start">
                        <div>
                            <p class="text-muted text-sm uppercase font-bold" style="letter-spacing:1px">Recaudación</p>
                            <h2 style="font-size:2.5rem; margin-top:0.5rem">$${totalRevenue.toFixed(0)}</h2>
                        </div>
                        <div style="background:#dcfce7; color:var(--success); padding:10px; border-radius:10px">
                            <i class="fa-solid fa-wallet fa-xl"></i>
                        </div>
                    </div>
                </div>
                <div class="card" style="border-bottom: 4px solid var(--accent)">
                    <div style="display:flex; justify-content:space-between; align-items:start">
                        <div>
                            <p class="text-muted text-sm uppercase font-bold" style="letter-spacing:1px">Profesores</p>
                            <h2 style="font-size:2.5rem; margin-top:0.5rem">${teachers.length}</h2>
                        </div>
                        <div style="background:#fef3c7; color:var(--accent); padding:10px; border-radius:10px">
                            <i class="fa-solid fa-chalkboard-user fa-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                <div class="card">
                    <h3 class="mb-4"><i class="fa-solid fa-chart-column text-primary"></i> Ingresos Mensuales</h3>
                    <canvas id="mainChart" style="max-height: 300px; width: 100%;"></canvas>
                </div>
                <div class="card">
                    <h3 class="mb-4"><i class="fa-solid fa-chart-pie text-accent"></i> Alumnos por Nivel</h3>
                    <canvas id="pieChart" style="max-height: 300px; width: 100%;"></canvas>
                </div>
            </div>
        `;

        this.initAdminChart();
    },

    renderTeacher(user, container) {
        const courses = DB.getTable('courses').filter(c => Number(c.teacherId) === Number(user.id));
        const students = DB.getTable('users').filter(u => Number(u.teacherId) === Number(user.id));

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
            </div>
        `;
    },

    initAdminChart() {
        setTimeout(() => {
            const payments = DB.getTable('payments');
            const users = DB.getTable('users').filter(u => u.role === 'student');
            
            const levels = { Beginner: 0, Intermediate: 0, Advanced: 0 };
            users.forEach(u => { if (levels[u.level] !== undefined) levels[u.level]++; });
            
            const currentMonthRevenue = payments.reduce((sum, p) => p.status === 'Pagado' ? sum + p.amount : sum, 0);

            Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#7c2d12';

            const ctx = document.getElementById('mainChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Mes Actual'],
                        datasets: [{
                            label: 'Cobros ($)',
                            data: [1200, 1900, 1750, 2500, 2100, currentMonthRevenue],
                            backgroundColor: 'rgba(249, 115, 22, 0.8)',
                            borderRadius: 6
                        }]
                    },
                    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
                });
            }

            const ctxPie = document.getElementById('pieChart');
            if (ctxPie) {
                new Chart(ctxPie, {
                    type: 'doughnut',
                    data: {
                        labels: ['Beginner', 'Intermediate', 'Advanced'],
                        datasets: [{
                            data: [levels.Beginner, levels.Intermediate, levels.Advanced],
                            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                            borderWidth: 0
                        }]
                    },
                    options: { responsive: true, cutout: '70%'}
                });
            }
        }, 100);
    }
};
