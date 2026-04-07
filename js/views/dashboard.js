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

            <div class="card">
                <h3 class="mb-4"><i class="fa-solid fa-chart-line text-primary"></i> Actividad Reciente</h3>
                <canvas id="mainChart" style="max-height: 300px;"></canvas>
            </div>
        `;

        this.initAdminChart();
    },

    renderStudent(user, container) {
        const payments = DB.getTable('payments').filter(p => Number(p.studentId) === Number(user.id));
        const hasDebt = payments.some(p => p.status !== 'Pagado');
        const course = DB.getTable('courses').find(c => Number(c.id) === Number(user.courseId));
        const teacher = DB.getTable('users').find(u => Number(u.id) === Number(user.teacherId));

        container.innerHTML = `
            <div class="hero-welcome">
                <div style="position:relative; z-index:2">
                    <span class="badge" style="background:var(--accent); color:white; margin-bottom:1rem">Estudiante Activo</span>
                    <h1 class="hero-title">¡Welcome to West House English School!</h1>
                    <p class="hero-subtitle">Hola <strong>${user.name}</strong>, nos alegra mucho tenerte de vuelta. Sigue practicando y alcanzando tus metas.</p>
                    
                    <div style="margin-top:2rem; display:flex; gap:1rem">
                        <button class="btn btn-primary" onclick="window.location.hash='#/materials'">Ver mis materiales <i class="fa-solid fa-arrow-right"></i></button>
                        <button class="btn" style="background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.2)" onclick="window.location.hash='#/calendar'">Mi Horario</button>
                    </div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                <div class="card">
                    <h3 class="mb-4" style="color:var(--primary); display:flex; align-items:center; gap:0.5rem">
                        <i class="fa-solid fa-book-open-reader"></i> Mi Clase Actual
                    </h3>
                    <div style="background:var(--primary-light); padding:1.5rem; border-radius:12px; margin-bottom:1rem">
                        <h4 style="font-size:1.2rem; color:var(--primary-dark)">${course ? course.name : 'No asignado'}</h4>
                        <p class="text-muted mt-1"><i class="fa-regular fa-clock"></i> ${course ? course.schedule : '-'}</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.75rem">
                        <div class="avatar" style="background:var(--accent); color:white">${teacher ? teacher.name[0] : '?'}</div>
                        <div>
                            <p style="font-weight:700; font-size:0.9rem">${teacher ? teacher.name : 'Consultar en Recepción'}</p>
                            <p class="text-muted text-sm">Tu Profesor(a)</p>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="mb-4" style="color:var(--success); display:flex; align-items:center; gap:0.5rem">
                        <i class="fa-solid fa-circle-dollar-to-slot"></i> Mi Estado de Pagos
                    </h3>
                    <div style="text-align:center; padding:1rem">
                        ${hasDebt ? `
                            <div style="color:var(--danger)">
                                <i class="fa-solid fa-triangle-exclamation fa-3x mb-2"></i>
                                <p style="font-weight:700">Tienes cuotas pendientes</p>
                                <p class="text-muted text-sm">Por favor acude a administración para regularizar.</p>
                            </div>
                        ` : `
                            <div style="color:var(--success)">
                                <i class="fa-solid fa-circle-check fa-3x mb-2"></i>
                                <p style="font-weight:700">¡Estás al día!</p>
                                <p class="text-muted text-sm">Gracias por tu puntualidad en el pago.</p>
                            </div>
                        `}
                        <button class="btn btn-secondary mt-4 w-full" onclick="window.location.hash='#/payments'">Ver Historial de Pagos</button>
                    </div>
                </div>

                <div class="card" style="grid-column: span 1 md:span 2;">
                    <h3 class="mb-3">Nuestra Historia</h3>
                    <p class="text-muted" style="font-size:0.95rem; line-height:1.7">
                        En <strong>West House English School</strong>, creemos que aprender inglés es abrir puertas al futuro. 
                        Nacimos con la misión de brindar una educación de alta calidad, personalizada y dinámica. 
                        Desde nuestros inicios, hemos ayudado a cientos de alumnos a comunicarse con el mundo, usando 
                        tecnología de vanguardia y los mejores métodos pedagógicos. ¡Eres parte de una comunidad global!
                    </p>
                    <div style="display:flex; gap:1.5rem; margin-top:1.5rem">
                        <div style="text-align:center">
                            <div style="font-size:1.5rem; font-weight:800; color:var(--primary)">10+</div>
                            <div class="text-sm text-muted">Años de Exp.</div>
                        </div>
                        <div style="text-align:center">
                            <div style="font-size:1.5rem; font-weight:800; color:var(--primary)">500+</div>
                            <div class="text-sm text-muted">Egresados</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
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
            const ctx = document.getElementById('mainChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Cobros ($)',
                            data: [1200, 1900, 1750, 2500, 2100, 3200],
                            borderColor: '#f97316',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointRadius: 4,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#f97316',
                            pointBorderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } }
                    }
                });
            }
        }, 100);
    }
};
