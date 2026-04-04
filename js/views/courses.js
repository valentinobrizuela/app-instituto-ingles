window.Views = window.Views || {};

Views.Courses = {
    render() {
        const user = Auth.getUser();
        let courses = DB.getTable('courses');
        
        if (user.role === 'teacher') {
            courses = courses.filter(c => Number(c.teacherId) === Number(user.id));
        } else if (user.role === 'student') {
            courses = courses.filter(c => Number(c.id) === Number(user.courseId));
        }

        const isAdmin = user.role === 'admin';
        
        document.getElementById('router-view').innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-graduation-cap"></i> ${isAdmin ? 'Gestión de Cursos' : 'Mis Cursos'}</h1>
                    <p class="text-muted mt-2">${isAdmin ? 'Crea y administra niveles, horarios y profesores.' : 'Información sobre tu cursada actual.'}</p>
                </div>
                ${isAdmin ? `<button class="btn btn-primary shadow-md" onclick="Views.Courses.openModal()"><i class="fa-solid fa-folder-plus"></i> Nuevo Curso</button>` : ''}
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:1.5rem;">
                ${courses.map(c => this.renderCourseCard(c, isAdmin)).join('')}
                ${courses.length === 0 ? '<div class="card" style="grid-column: 1 / -1"><p class="text-muted text-center py-4">No hay cursos disponibles actualmente.</p></div>' : ''}
            </div>
        `;
    },

    renderCourseCard(c, isAdmin) {
        const allUsers = DB.getTable('users');
        const teacher = allUsers.find(u => Number(u.id) === Number(c.teacherId)) || { name: 'Sin asignar' };
        const studentsCount = allUsers.filter(u => u.role === 'student' && Number(u.courseId) === Number(c.id)).length;
        
        let badgeColor = c.level === 'Beginner' ? 'warning' : c.level === 'Intermediate' ? 'info' : 'primary';

        return `
            <div class="card shadow-md" style="display:flex; flex-direction:column; padding:0; overflow:hidden; border:1px solid #e2e8f0; transition: transform 0.2s">
                <div style="background: linear-gradient(135deg, var(--${badgeColor}), #fb923c); height: 6px;"></div>
                <div style="padding: 1.5rem;">
                    <div class="flex justify-between items-start mb-4">
                        <h2 style="font-size:1.35rem; color:var(--text-main); font-weight:800; line-height:1.3; margin:0">
                            ${c.name}
                        </h2>
                        <span class="badge badge-${badgeColor} shadow-sm" style="font-size:0.75rem">${c.level}</span>
                    </div>
                    
                    <div style="flex:1; background:#f8fafc; padding:1rem; border-radius:8px; display:flex; flex-direction:column; gap:0.5rem">
                        <div class="text-muted" style="font-size:0.95rem">
                            <i class="fa-solid fa-chalkboard-user text-info" style="width:20px"></i> <strong>Prof:</strong> ${teacher.name}
                        </div>
                        <div class="text-muted" style="font-size:0.95rem">
                            <i class="fa-solid fa-users text-primary" style="width:20px"></i> <strong>Alumnos:</strong> ${studentsCount} inscritos
                        </div>
                        ${c.schedule ? `
                        <div class="text-muted" style="font-size:0.95rem">
                            <i class="fa-regular fa-clock text-warning" style="width:20px"></i> <strong>Horario:</strong> ${c.schedule}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div style="margin-top:1.5rem; display:flex; gap:0.5rem; justify-content:space-between">
                        <button class="btn btn-secondary shadow-sm" style="flex:1" onclick="window.location.hash='#/materials'">
                            <i class="fa-solid fa-folder-open"></i> Ir a Materiales
                        </button>
                        ${isAdmin ? `
                        <button class="btn" style="background:#fee2e2; color:#b91c1c; border:none; padding:0.6rem 0.8rem; border-radius:8px; cursor:pointer;" onclick="Views.Courses.delete(${c.id})" title="Eliminar Curso">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    openModal() {
        const teachers = DB.getTable('users').filter(u => u.role === 'teacher');
        UI.openModal('Crear Nuevo Curso', `
            <form id="form-course" onsubmit="Views.Courses.save(event)">
                <div class="form-group">
                    <label>Nombre del Curso / Nomenclatura *</label>
                    <input type="text" id="c-name" class="form-control" required placeholder="Ej: Inglés Kids Nivel 2">
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>Nivel General *</label>
                        <select id="c-level" class="form-control" required style="background:#f9fafb">
                            <option value="Beginner">Beginner (A1-A2)</option>
                            <option value="Intermediate">Intermediate (B1-B2)</option>
                            <option value="Advanced">Advanced (C1-C2)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Horario Base (Opcional)</label>
                        <input type="text" id="c-schedule" class="form-control" placeholder="Ej: Lun-Mié 18hs">
                    </div>
                </div>

                <div class="form-group mt-2">
                    <label>Profesor Asignado *</label>
                    <select id="c-teacher" class="form-control" required style="background:#f9fafb">
                        <option value="">-- Selecciona profesor --</option>
                        ${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group mt-4 pt-4" style="border-top:1px solid #eee">
                    <button type="submit" class="btn btn-primary w-full shadow-md" style="padding:0.75rem;"><i class="fa-solid fa-layer-group"></i> Crear Curso Oficial</button>
                </div>
            </form>
        `);
    },

    save(e) {
        e.preventDefault();
        UI.showLoader();
        DB.insert('courses', {
            name: document.getElementById('c-name').value,
            level: document.getElementById('c-level').value,
            schedule: document.getElementById('c-schedule').value,
            teacherId: parseInt(document.getElementById('c-teacher').value)
        });
        UI.closeModal();
        UI.showToast('Curso creado y publicado en la plataforma', 'success');
        this.render();
        UI.hideLoader();
    },

    delete(id) {
        if(confirm('¿ELIMINAR este curso de forma permanente? Se desvincularán alumnos, asistencias y materiales relacionados.')) {
            UI.showLoader();
            DB.remove('courses', id);
            
            const allUsers = DB.getTable('users');
            const targets = allUsers.filter(u => Number(u.courseId) === Number(id));
            
            for (const u of targets) {
                DB.update('users', u.id, { courseId: null });
            }

            UI.showToast('Curso eliminado correctamente', 'success');
            this.render();
            UI.hideLoader();
        }
    }
};
