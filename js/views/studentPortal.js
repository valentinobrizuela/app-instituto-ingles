window.Views = window.Views || {};

Views.StudentPortal = {
    render() {
        const user = Auth.getUser();
        const payments = DB.getTable('payments').filter(p => Number(p.studentId) === Number(user.id));
        const hasDebt = payments.some(p => p.status !== 'Pagado');
        const course = DB.getTable('courses').find(c => Number(c.id) === Number(user.courseId));
        const teacher = DB.getTable('users').find(u => Number(u.id) === Number(user.teacherId));

        const container = document.getElementById('router-view');

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
                    <h3 class="mb-3">Tus Calificaciones (Promedios)</h3>
                    <div id="student-grades">
                        Cargando...
                    </div>
                    <button class="btn btn-secondary mt-4" onclick="window.location.hash='#/grades'">Ver Detalle Completo</button>
                </div>
            </div>
        `;
        
        this.renderGradesSummary(user);
    },

    renderGradesSummary(user) {
        // Obtenemos calificaciones del estudiante logueado
        const grades = DB.getTable('grades').filter(g => Number(g.studentId) === Number(user.id));
        const div = document.getElementById('student-grades');
        if (!div) return;
        
        if (grades.length === 0) {
            div.innerHTML = '<p class="text-muted">Aún no tienes calificaciones registradas.</p>';
            return;
        }

        const avg = grades.reduce((acc, g) => acc + parseFloat(g.score), 0) / grades.length;
        
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap: 2rem;">
                <div style="text-align:center; border: 4px solid ${avg >= 6 ? 'var(--success)' : 'var(--danger)'}; border-radius:50%; width: 100px; height: 100px; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:800; color:${avg >= 6 ? 'var(--success)' : 'var(--danger)'}">
                    ${avg.toFixed(1)}
                </div>
                <div>
                    <h4 style="font-size:1.2rem; color:var(--text-main)">Promedio General</h4>
                    <p class="text-muted">${grades.length} evaluaciones rendidas</p>
                    ${avg >= 8 ? '<p style="color:var(--primary); font-weight:bold"><i class="fa-solid fa-star"></i> ¡Excelente rendimiento!</p>' : ''}
                </div>
            </div>
        `;
    }
};
