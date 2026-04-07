window.Views = window.Views || {};

Views.Grades = {
    render() {
        const user = Auth.getUser();

        if (user.role === 'student') {
            document.getElementById('router-view').innerHTML = `
                <div class="card" style="text-align:center; padding: 4rem;">
                    <i class="fa-solid fa-lock text-danger" style="font-size:3rem;"></i>
                    <h2 class="mt-4">Acceso Restringido</h2>
                    <p class="text-muted">Las calificaciones como estudiante las puedes ver en Tu Portal.</p>
                </div>
            `;
            return;
        }

        const courses = DB.getTable('courses');
        let myCourses = user.role === 'teacher' ? courses.filter(c => Number(c.teacherId) === Number(user.id)) : courses;
        
        document.getElementById('router-view').innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-star"></i> Módulo de Calificaciones</h1>
                    <p class="text-muted mt-2">Gestiona el progreso académico de los alumnos.</p>
                </div>
            </div>
            
            <div class="card mb-4">
                <div style="display:flex; gap:1rem; align-items:flex-end">
                    <div class="form-group" style="flex:1; margin-bottom:0;">
                        <label>Seleccionar Curso</label>
                        <select id="g-course" class="form-control" onchange="Views.Grades.loadStudents()">
                            <option value="">-- Elige un Curso --</option>
                            ${myCourses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <div id="grades-container"></div>
        `;
    },

    loadStudents() {
        const courseId = document.getElementById('g-course').value;
        const container = document.getElementById('grades-container');
        if (!courseId) {
            container.innerHTML = '';
            return;
        }

        const students = DB.getTable('users').filter(u => u.role === 'student' && Number(u.courseId) === Number(courseId));
        const grades = DB.getTable('grades');

        if (students.length === 0) {
            container.innerHTML = '<div class="card"><p class="text-muted text-center">No hay alumnos inscritos en este curso.</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="card p-0 shadow-sm overflow-hidden" style="background:#fff">
                <div class="table-responsive">
                    <table class="w-full">
                        <thead style="background:#f1f5f9">
                            <tr>
                                <th style="padding:1rem">Alumno</th>
                                <th>Exámenes (Promedio)</th>
                                <th style="text-align:center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(s => {
                                const sg = grades.filter(g => Number(g.studentId) === Number(s.id));
                                const avg = sg.length ? sg.reduce((acc,g) => acc+parseFloat(g.score),0)/sg.length : 0;
                                return `
                                <tr>
                                    <td style="padding:1rem">
                                        <div style="font-weight:600"><i class="fa-solid fa-user-graduate text-primary"></i> ${s.name}</div>
                                    </td>
                                    <td>
                                        <span class="badge ${avg >= 6 ? 'badge-success' : (avg > 0 ? 'badge-danger' : 'badge-info')}">
                                            ${sg.length > 0 ? avg.toFixed(1) : 'Sin notas'}
                                        </span>
                                        <div class="text-sm text-muted" style="margin-top:4px">${sg.length} registros</div>
                                    </td>
                                    <td style="text-align:center">
                                        <button class="btn btn-secondary shadow-sm" style="font-size:0.8rem" onclick="Views.Grades.openModal(${s.id}, '${s.name.replace(/'/g, "\\'")}')">
                                            <i class="fa-solid fa-edit"></i> Calificar
                                        </button>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    openModal(studentId, studentName) {
        UI.openModal(`Calificar a ${studentName}`, `
            <form id="form-grade" onsubmit="Views.Grades.save(event, ${studentId})">
                <div class="form-group">
                    <label>Tipo de Evaluación *</label>
                    <input type="text" id="g-type" class="form-control" placeholder="Ej: Midterm Exam, Quiz 1..." required>
                </div>
                <div class="form-group">
                    <label>Nota / Puntuación (1 al 10) *</label>
                    <input type="number" step="0.1" min="1" max="10" id="g-score" class="form-control" placeholder="10.0" required>
                </div>
                <div class="form-group">
                    <label>Comentarios / Feedback</label>
                    <textarea id="g-obs" class="form-control" rows="3" placeholder="Opcional..."></textarea>
                </div>
                <div class="form-group mt-4 pt-4" style="border-top:1px solid #eee">
                    <button type="submit" class="btn btn-primary w-full shadow-md"><i class="fa-solid fa-save"></i> Guardar Calificación</button>
                </div>
            </form>
        `);
    },

    async save(e, studentId) {
        e.preventDefault();
        UI.showLoader();
        try {
            await DB.insert('grades', {
                studentId: studentId,
                examType: document.getElementById('g-type').value,
                score: parseFloat(document.getElementById('g-score').value),
                observations: document.getElementById('g-obs').value,
                date: new Date().toISOString()
            });
            UI.closeModal();
            UI.showToast('Calificación guardada correctamente', 'success');
            this.loadStudents();
        } catch (err) {
            UI.showToast('Error al guardar', 'danger');
        }
        UI.hideLoader();
    }
};
