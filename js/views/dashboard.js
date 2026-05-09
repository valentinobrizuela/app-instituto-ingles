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

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
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
                        <div style="background:#dcfce7; color:var(--success); padding:8px; border-radius:8px">
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
                        <div style="background:#e0f2fe; color:var(--info); padding:8px; border-radius:8px">
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
                        <div style="background:#fef3c7; color:var(--accent); padding:8px; border-radius:8px">
                            <i class="fa-solid fa-chalkboard-user fa-lg"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div id="dashboard-charts" style="min-height:300px">
                <div class="responsive-grid" style="display:grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                    <div class="card">
                        <h3 class="mb-4"><i class="fa-solid fa-chart-column text-primary"></i> Ingresos Mensuales</h3>
                        <canvas id="mainChart" style="max-height: 300px; width: 100%;"></canvas>
                    </div>
                    <div class="card">
                        <h3 class="mb-4"><i class="fa-solid fa-chart-pie text-accent"></i> Alumnos por Nivel</h3>
                        <canvas id="pieChart" style="max-height: 300px; width: 100%;"></canvas>
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
            </div>
        `;
    },

    initAdminChart() {
        setTimeout(() => {
            const payments = DB.getTable('payments');
            const users = DB.getTable('users').filter(u => u.role === 'student');
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            // Normalize levels to handle different casings or missing values
            const levels = { Beginner: 0, Intermediate: 0, Advanced: 0 };
            users.forEach(u => { 
                const level = u.level ? u.level.charAt(0).toUpperCase() + u.level.slice(1).toLowerCase() : 'Beginner';
                if (levels[level] !== undefined) {
                    levels[level]++; 
                } else {
                    levels['Beginner']++; // Fallback
                }
            });
            
            const currentMonthRevenue = payments.reduce((sum, p) => p.status === 'Pagado' ? sum + p.amount : sum, 0);

            // Chart configuration based on theme
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
            
            Chart.defaults.color = textColor;
            Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

            const ctx = document.getElementById('mainChart');
            if (ctx) {
                // Destroy existing chart if it exists to avoid overlap on re-render
                const existingChart = Chart.getChart(ctx);
                if (existingChart) existingChart.destroy();

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Mes Actual'],
                        datasets: [{
                            label: 'Cobros ($)',
                            data: [1200, 1900, 1750, 2500, 2100, currentMonthRevenue],
                            backgroundColor: 'rgba(249, 115, 22, 0.8)',
                            hoverBackgroundColor: 'rgba(249, 115, 22, 1)',
                            borderRadius: 8
                        }]
                    },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false,
                        plugins: { 
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                titleColor: isDark ? '#f8fafc' : '#0f172a',
                                bodyColor: isDark ? '#f8fafc' : '#0f172a',
                                borderColor: 'var(--border-color)',
                                borderWidth: 1
                            }
                        }, 
                        scales: { 
                            y: { 
                                beginAtZero: true,
                                grid: { color: gridColor },
                                ticks: { color: textColor }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: textColor }
                            }
                        } 
                    }
                });
            }

            const ctxPie = document.getElementById('pieChart');
            if (ctxPie) {
                const existingChart = Chart.getChart(ctxPie);
                if (existingChart) existingChart.destroy();

                new Chart(ctxPie, {
                    type: 'doughnut',
                    data: {
                        labels: ['Beginner', 'Intermediate', 'Advanced'],
                        datasets: [{
                            data: [levels.Beginner, levels.Intermediate, levels.Advanced],
                            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                            hoverOffset: 10,
                            borderWidth: isDark ? 2 : 0,
                            borderColor: isDark ? '#1e293b' : '#ffffff'
                        }]
                    },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false,
                        cutout: '75%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    usePointStyle: true,
                                    color: textColor
                                }
                            }
                        }
                    }
                });
            }
        }, 100);
    }
};
