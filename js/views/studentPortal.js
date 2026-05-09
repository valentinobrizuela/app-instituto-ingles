window.Views = window.Views || {};

Views.StudentPortal = {
    render() {
        const user = Auth.getUser();
        const payments = DB.getTable('payments').filter(p => p.student_id === user.id);
        const hasDebt = payments.some(p => p.status !== 'Pagado');
        const course = DB.getTable('courses').find(c => c.id == user.course_id);
        const teacher = DB.getTable('users').find(u => u.id === user.teacher_id);

        const container = document.getElementById('router-view');

        container.innerHTML = `
            <div class="hero-welcome">
                <div style="position:relative; z-index:2">
                    <span class="badge" style="background:var(--accent); color:white; margin-bottom:1rem">Estudiante Activo</span>
                    <h1 class="hero-title">¡Welcome to West House English School!</h1>
                    <p class="hero-subtitle">Hola <strong>${user.name}</strong>, nos alegra mucho tenerte de vuelta. Sigue practicando y alcanzando tus metas.</p>
                    
                    <div style="margin-top:2rem; display:flex; gap:1rem; align-items:center; flex-wrap:wrap">
                        <button class="btn btn-primary" onclick="window.location.hash='#/materials'">Ver mis materiales <i class="fa-solid fa-arrow-right"></i></button>
                        <button class="btn" style="background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.2)" onclick="window.location.hash='#/calendar'">Mi Horario</button>
                        
                        <!-- Mila Welcome -->
                        <div id="mila-welcome-student" style="margin-left:auto">
                             ${(() => {
                                 // Simple logic to show Mila welcome
                                 return `
                                    <div class="mila-wrapper" style="background:rgba(255,255,255,0.1); border:none; padding:0.5rem 1rem">
                                        <img src="mila_the_ai_cat_1778347273587.png" class="mila-avatar" style="width:40px; height:40px; border-color:white">
                                        <p style="color:white; font-size:0.8rem; margin:0">${UI.Mila.getSuggestion('welcome_student')}</p>
                                    </div>
                                 `;
                             })()}
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-4" style="background:var(--bg-card); border:1px solid var(--primary-light)">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
                    <h3 style="font-size:1rem; margin:0"><i class="fa-solid fa-bolt text-primary"></i> Mi Nivel de Aprendizaje</h3>
                    <span class="badge badge-primary">Nivel ${user.level || 1}</span>
                </div>
                <div style="background:var(--bg-main); height:12px; border-radius:10px; position:relative; overflow:hidden">
                    <div style="background:var(--primary); height:100%; width:${(user.xp % 100)}%; transition: width 1s ease-out"></div>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:0.5rem">
                    <span class="text-xs text-muted">${user.xp || 0} XP totales</span>
                    <span class="text-xs text-muted">Próximo nivel: ${100 - (user.xp % 100)} XP</span>
                </div>
            </div>

            <div class="responsive-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
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
                            </div>
                        ` : `
                            <div style="color:var(--success)">
                                <i class="fa-solid fa-circle-check fa-3x mb-2"></i>
                                <p style="font-weight:700">¡Estás al día!</p>
                            </div>
                        `}
                        
                        <div style="margin-top: 1.5rem; text-align: left; background: var(--bg-hover); padding: 1rem; border-radius: 8px;">
                            <p style="font-weight: bold; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-main);">Últimos Pagos</p>
                            ${payments.length > 0 ? payments.slice(-3).map(p => `
                                <div style="display:flex; justify-content:space-between; font-size: 0.85rem; padding: 0.25rem 0; border-bottom: 1px solid var(--border-color);">
                                    <span style="color:var(--text-muted)">${new Date(p.date).toLocaleDateString()}</span>
                                    <span style="font-weight:bold; color:${p.status === 'Pagado' ? 'var(--success)' : 'var(--danger)'}">$${Number(p.amount).toLocaleString('es-AR')}</span>
                                </div>
                            `).join('') : '<p class="text-xs text-muted">No hay pagos registrados aún.</p>'}
                        </div>

                        <button class="btn btn-secondary mt-4 w-full" onclick="window.location.hash='#/payments'">Ver Detalle Completo</button>
                    </div>
                </div>

                <div class="card" style="grid-column: 1 / -1;">
                    <h3 class="mb-4" style="color:var(--primary); display:flex; align-items:center; gap:0.5rem">
                        <i class="fa-solid fa-timeline"></i> Mi Camino de Aprendizaje
                    </h3>
                    <div id="learning-timeline">
                        Cargando progreso...
                    </div>
                </div>
            </div>
        `;
        
        this.renderTimeline(user);
    },

    renderTimeline(user) {
        const grades = DB.getTable('grades').filter(g => Number(g.studentId) === Number(user.id));
        const container = document.getElementById('learning-timeline');
        if (!container) return;
        
        if (grades.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:3rem; background:var(--bg-main); border-radius:12px; border:1px dashed var(--border-color)">
                    <i class="fa-solid fa-graduation-cap fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Aún no hay evaluaciones registradas. ¡Tu camino empieza pronto!</p>
                </div>
            `;
            return;
        }

        // Sort by date if available, or by entry
        const sortedGrades = [...grades].sort((a,b) => new Date(a.date) - new Date(b.date));

        container.innerHTML = `
            <div class="timeline-container" style="display:flex; overflow-x:auto; padding:1rem 0; gap:2rem; scrollbar-width:thin">
                ${sortedGrades.map((g, index) => `
                    <div class="timeline-item" style="min-width:250px; position:relative">
                        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem">
                            <div style="width:40px; height:40px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem; z-index:2">
                                ${g.score}
                            </div>
                            <div style="flex:1">
                                <p style="font-weight:700; font-size:0.9rem">${g.examType}</p>
                                <p style="font-size:0.75rem; color:var(--text-muted)">${new Date(g.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div style="background:var(--bg-main); padding:1rem; border-radius:12px; border-left:4px solid ${g.score >= 6 ? 'var(--success)' : 'var(--danger)'}; position:relative">
                            <p style="font-size:0.85rem; font-style:italic; color:var(--text-main)">"${g.observations || 'Sin comentarios adicionales.'}"</p>
                        </div>
                        ${index < sortedGrades.length - 1 ? `
                            <div style="position:absolute; top:20px; left:40px; right:-20px; height:2px; background:var(--border-color); z-index:1"></div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
};
