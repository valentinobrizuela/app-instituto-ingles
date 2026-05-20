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
        let myCourses = user.role === 'teacher' ? courses.filter(c => String(c.teacher_id) === String(user.id)) : courses;
        
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

        const students = DB.getTable('users').filter(u => u.role === 'student' && String(u.course_id) === String(courseId));
        const grades = DB.getTable('grades');

        if (students.length === 0) {
            container.innerHTML = '<div class="card"><p class="text-muted text-center">No hay alumnos inscritos en este curso.</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="flex items-center justify-between mb-3 mt-3 flex-wrap gap-2">
                <h3 style="font-size:1.1rem; color:var(--text-main); margin-bottom:0; font-weight:700;"><i class="fa-solid fa-list-check"></i> Planilla de Notas</h3>
                <button class="btn btn-primary shadow-sm" onclick="Views.Grades.generateMassivePDF(${courseId})" style="display:flex; align-items:center; gap:0.5rem; font-size:0.9rem;">
                    <i class="fa-solid fa-file-pdf"></i> Generar Boletines Masivos (PDF)
                </button>
            </div>
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
                                const sg = grades.filter(g => String(g.studentId) === String(s.id));
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
                                        <button class="btn btn-secondary shadow-sm" style="font-size:0.8rem" onclick="Views.Grades.openModal(${s.id})">
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

    openModal(studentId) {
        const student = DB.getTable('users').find(u => String(u.id) === String(studentId));
        const studentName = student ? student.name : `Alumno #${studentId}`;
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

            // Award XP
            const score = parseFloat(document.getElementById('g-score').value);
            if (score >= 9) {
                await Gamification.awardXP(studentId, Gamification.XP_MAP.EXAM_EXCELLENT, "Excelencia Académica");
            } else if (score >= 6) {
                await Gamification.awardXP(studentId, Gamification.XP_MAP.EXAM_PASS, "Examen Aprobado");
            }

            UI.closeModal();
            UI.showToast('Calificación guardada correctamente', 'success');
            this.loadStudents();
        } catch (err) {
            UI.showToast('Error al guardar', 'danger');
        }
        UI.hideLoader();
    },

    async generateMassivePDF(courseId) {
        if (typeof html2pdf === 'undefined') {
            UI.showToast('La librería de PDF no está cargada.', 'danger');
            return;
        }

        const course = DB.getTable('courses').find(c => String(c.id) === String(courseId));
        if (!course) return;

        const students = DB.getTable('users').filter(u => u.role === 'student' && String(u.course_id) === String(courseId));
        if (students.length === 0) {
            UI.showToast('No hay alumnos inscritos en este curso para generar boletines.', 'warning');
            return;
        }

        UI.showLoader();

        // Crear contenedor temporal para renderizar los boletines
        const tempContainer = document.createElement('div');
        tempContainer.id = 'massive-pdf-temp-container';
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '800px';
        tempContainer.style.background = '#ffffff';
        tempContainer.style.color = '#1e293b';
        tempContainer.style.fontFamily = "'Inter', 'Segoe UI', sans-serif";

        let html = '';

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const sGrades = DB.getTable('grades').filter(g => String(g.studentId) === String(student.id));
            const avg = sGrades.length ? sGrades.reduce((acc,g) => acc + parseFloat(g.score), 0) / sGrades.length : 0;
            
            // Asistencia
            const courseAtt = DB.getTable('attendance').filter(a => String(a.student_id) === String(student.id) && String(a.course_id) === String(courseId));
            const present = courseAtt.filter(a => a.status === 'Presente').length;
            const attPercentage = courseAtt.length > 0 ? ((present / courseAtt.length) * 100).toFixed(0) : '100';

            html += `
                <div class="pdf-page" style="padding: 3rem; min-height: 1050px; page-break-after: always; box-sizing: border-box; position: relative; border: 15px solid #0f172a; background: #ffffff; margin-bottom: 2rem;">
                    
                    <!-- Fondo decorativo sutil -->
                    <div style="position: absolute; top:0; left:0; right:0; bottom:0; border: 2px solid #e2e8f0; margin: 10px; pointer-events: none;"></div>

                    <!-- Cabecera / Letterhead -->
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #0f172a; padding-bottom: 1.5rem; margin-bottom: 2rem;">
                        <div>
                            <h1 style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 1px;">West House English School</h1>
                            <p style="font-size: 0.85rem; color: #64748b; margin: 2px 0 0 0; font-weight: 600;">INFORME DE RENDIMIENTO ACADÉMICO / ACADEMIC REPORT</p>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 1.8rem; color: #0f172a; font-weight: 800;"><i class="fa-solid fa-graduation-cap"></i></span>
                        </div>
                    </div>

                    <!-- Ficha del Alumno -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 8px; margin-bottom: 2.5rem;">
                        <div>
                            <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Alumno / Student</p>
                            <p style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a;">${student.name}</p>
                        </div>
                        <div>
                            <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Nivel / Level</p>
                            <p style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #0f172a;">${student.level || 'Beginner'}</p>
                        </div>
                        <div style="margin-top: 0.5rem;">
                            <p style="margin: 0 0 0.25rem 0; font-size: 0.8rem; color: #64748b; font-weight: 700;">CURSO / COURSE</p>
                            <p style="margin: 0; font-size: 1rem; font-weight: 600; color: #334155;">${course.name}</p>
                        </div>
                        <div style="margin-top: 0.5rem;">
                            <p style="margin: 0 0 0.25rem 0; font-size: 0.8rem; color: #64748b; font-weight: 700;">FECHA / DATE</p>
                            <p style="margin: 0; font-size: 1rem; font-weight: 600; color: #334155;">${new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    <!-- Panel Métricas Clave -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 2.5rem; text-align: center;">
                        <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; border-top: 4px solid #0f172a;">
                            <p style="margin: 0 0 0.25rem 0; font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Promedio General</p>
                            <p style="margin: 0; font-size: 1.75rem; font-weight: 800; color: ${avg >= 6 ? '#10b981' : '#ef4444'};">${sGrades.length > 0 ? avg.toFixed(1) : '-'}</p>
                        </div>
                        <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; border-top: 4px solid #10b981;">
                            <p style="margin: 0 0 0.25rem 0; font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Asistencia</p>
                            <p style="margin: 0; font-size: 1.75rem; font-weight: 800; color: #334155;">${attPercentage}%</p>
                        </div>
                        <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; border-top: 4px solid #3b82f6;">
                            <p style="margin: 0 0 0.25rem 0; font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Evaluaciones</p>
                            <p style="margin: 0; font-size: 1.75rem; font-weight: 800; color: #334155;">${sGrades.length}</p>
                        </div>
                    </div>

                    <!-- Tabla de Calificaciones -->
                    <h3 style="font-size: 1.1rem; font-weight: 800; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.5px;">Desglose de Calificaciones / Grade Breakdown</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 3rem;">
                        <thead>
                            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                                <th style="text-align: left; padding: 0.75rem; font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase;">Fecha</th>
                                <th style="text-align: left; padding: 0.75rem; font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase;">Evaluación</th>
                                <th style="text-align: center; padding: 0.75rem; font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase;">Calificación</th>
                                <th style="text-align: left; padding: 0.75rem; font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase;">Feedback / Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sGrades.map(g => `
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 0.75rem; font-size: 0.85rem; color: #475569;">${new Date(g.date).toLocaleDateString()}</td>
                                    <td style="padding: 0.75rem; font-size: 0.85rem; font-weight: 600; color: #0f172a;">${g.examType}</td>
                                    <td style="padding: 0.75rem; text-align: center; font-size: 0.9rem; font-weight: 800; color: ${parseFloat(g.score) >= 6 ? '#10b981' : '#ef4444'};">${g.score}</td>
                                    <td style="padding: 0.75rem; font-size: 0.85rem; color: #475569; font-style: italic;">"${g.observations || '-'}"</td>
                                </tr>
                            `).join('')}
                            ${sGrades.length === 0 ? `
                                <tr>
                                    <td colspan="4" style="text-align: center; padding: 2rem; color: #94a3b8; font-style: italic;">No hay evaluaciones registradas en el período.</td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>

                    <!-- Firmas -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; text-align: center; margin-top: auto; position: absolute; bottom: 4rem; left: 3rem; right: 3rem;">
                        <div>
                            <div style="border-top: 1px solid #94a3b8; width: 100%; margin: 0 auto 0.5rem auto;"></div>
                            <p style="margin: 0; font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase;">Firma del Profesor / Teacher's Signature</p>
                        </div>
                        <div>
                            <div style="border-top: 1px solid #94a3b8; width: 100%; margin: 0 auto 0.5rem auto;"></div>
                            <p style="margin: 0; font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase;">Firma de la Dirección / Director's Signature</p>
                        </div>
                    </div>

                </div>
            `;
        }

        tempContainer.innerHTML = html;
        document.body.appendChild(tempContainer);

        const opt = {
            margin:       0.3,
            filename:     `Boletines_Masivos_${course.name.replace(/ /g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(tempContainer).save();
            UI.showToast('Boletines masivos generados con éxito.', 'success');
        } catch (err) {
            console.error(err);
            UI.showToast('Error al generar boletines PDF masivos.', 'danger');
        } finally {
            document.body.removeChild(tempContainer);
            UI.hideLoader();
        }
    }
};
