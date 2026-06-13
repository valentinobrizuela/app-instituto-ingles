window.Views = window.Views || {};

Views.Assignments = {
    render() {
        const user = Auth.getUser();
        let courses = DB.getTable('courses');
        
        if (user.role === 'teacher') {
            courses = courses.filter(c => String(c.teacher_id) === String(user.id));
        } else if (user.role === 'student') {
            courses = courses.filter(c => String(c.id) === String(user.course_id));
        }
        
        const assignments = DB.getTable('assignments');
        const submissions = DB.getTable('assignment_submissions');
        const canUpload = ['admin', 'teacher'].includes(user.role);

        let html = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-file-pen"></i> Buzón de Tareas</h1>
                    <p class="text-muted mt-2">Gestiona trabajos prácticos y entregas.</p>
                </div>
                ${canUpload ? `<button class="btn btn-primary shadow-md" onclick="Views.Assignments.openModal()"><i class="fa-solid fa-plus"></i> Nueva Tarea</button>` : ''}
            </div>
        `;

        if (courses.length === 0) {
            html += `<p class="text-muted" style="padding:2rem; text-align:center; background:white; border-radius:8px;">No tienes cursos asignados.</p>`;
        }

        html += courses.map(course => {
            const courseAssignments = assignments.filter(a => String(a.course_id) === String(course.id));
            
            return `
                <div class="card mb-4" style="border-left: 4px solid var(--primary);">
                    <h2 style="font-size:1.4rem;color:var(--text-main);margin-bottom:1.5rem;border-bottom:1px solid var(--border-color);padding-bottom:0.75rem">
                        <i class="fa-solid fa-book-open text-primary"></i> ${course.name} <span class="badge badge-info text-sm ml-2">${course.level}</span>
                    </h2>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:1.5rem;">
                        ${courseAssignments.length === 0 ? '<p class="text-muted w-full" style="grid-column: 1 / -1">Aún no hay tareas publicadas en este nivel.</p>' : ''}
                        
                        ${courseAssignments.map(a => {
                            const isLate = new Date(a.due_date) < new Date();
                            const formattedDate = new Date(a.due_date).toLocaleDateString() + ' ' + new Date(a.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            let statusBadge = isLate ? `<span class="badge badge-danger">Vencida</span>` : `<span class="badge badge-success">Activa</span>`;
                            
                            // Si es alumno, ver si ya entregó
                            let studentAction = '';
                            if (user.role === 'student') {
                                const sub = submissions.find(s => String(s.assignment_id) === String(a.id) && String(s.student_id) === String(user.id));
                                if (sub) {
                                    statusBadge = `<span class="badge badge-primary">Entregada</span>`;
                                    studentAction = `
                                        <div style="margin-top:1rem; padding:0.5rem; background:var(--bg-hover); border-radius:6px; font-size:0.85rem">
                                            <strong>Tu entrega:</strong> <a href="${sub.file_url}" target="_blank" style="color:var(--primary)">Ver Archivo</a><br>
                                            <strong>Nota:</strong> ${sub.grade ? `<span class="text-success" style="font-weight:bold">${sub.grade}/10</span>` : 'Pendiente de corrección'}
                                            ${sub.comments ? `<p style="margin-top:0.5rem; font-style:italic">"${sub.comments}"</p>` : ''}
                                        </div>
                                    `;
                                } else {
                                    studentAction = `
                                        <button class="btn btn-secondary w-full shadow-sm mt-3" onclick="Views.Assignments.openSubmitModal(${a.id})">
                                            <i class="fa-solid fa-cloud-arrow-up"></i> Entregar Tarea
                                        </button>
                                    `;
                                }
                            } else {
                                // Admin/Teacher
                                const subCount = submissions.filter(s => String(s.assignment_id) === String(a.id)).length;
                                studentAction = `
                                    <button class="btn btn-info w-full shadow-sm mt-3" onclick="Views.Assignments.viewSubmissions(${a.id})">
                                        <i class="fa-solid fa-list-check"></i> Ver Entregas (${subCount})
                                    </button>
                                `;
                            }

                            return `
                            <div class="card shadow-md" style="display:flex;flex-direction:column; border: 1px solid ${isLate ? '#fee2e2' : '#e5e7eb'}; padding:1.25rem;">
                                <div class="flex items-center justify-between mb-2">
                                    ${statusBadge}
                                    ${canUpload ? `<button onclick="Views.Assignments.delete(${a.id})" style="background:none;border:none;color:var(--danger);font-size:1rem;cursor:pointer"><i class="fa-regular fa-trash-can"></i></button>` : ''}
                                </div>
                                <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem">${a.title}</h3>
                                <p style="font-size:0.85rem; color:var(--text-muted); flex:1;">${a.description}</p>
                                
                                <div style="margin-top:1rem; font-size:0.8rem; color:var(--text-main);">
                                    <i class="fa-regular fa-calendar-xmark" style="color:${isLate ? 'var(--danger)' : 'var(--text-muted)'}"></i> <strong>Vence:</strong> ${formattedDate}
                                </div>
                                
                                ${studentAction}
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('router-view').innerHTML = html;
    },

    openModal() {
        const user = Auth.getUser();
        let courses = DB.getTable('courses');
        if (user.role === 'teacher') courses = courses.filter(c => String(c.teacher_id) === String(user.id));
        
        UI.openModal('Crear Nueva Tarea', `
            <form onsubmit="Views.Assignments.save(event)">
                <div class="form-group">
                    <label>Curso Destino *</label>
                    <select id="a-course" class="form-control" required>
                        ${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Título de la Tarea *</label>
                    <input type="text" id="a-title" class="form-control" required placeholder="Ej: Essay on Climate Change">
                </div>
                <div class="form-group">
                    <label>Descripción / Instrucciones *</label>
                    <textarea id="a-desc" class="form-control" rows="3" required placeholder="Instrucciones detalladas..."></textarea>
                </div>
                <div class="form-group">
                    <label>Fecha Límite (Vencimiento) *</label>
                    <input type="datetime-local" id="a-due" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-full mt-3"><i class="fa-solid fa-save"></i> Publicar Tarea</button>
            </form>
        `);
    },

    async save(e) {
        e.preventDefault();
        try {
            UI.showLoader();
            await DB.insert('assignments', {
                course_id: parseInt(document.getElementById('a-course').value),
                title: document.getElementById('a-title').value,
                description: document.getElementById('a-desc').value,
                due_date: document.getElementById('a-due').value,
                created_by: Auth.getUser().id
            });
            UI.closeModal();
            UI.showToast('Tarea publicada con éxito.', 'success');
            this.render();
        } catch (err) {
            UI.showToast('Error al publicar: ' + err.message, 'danger');
        } finally {
            UI.hideLoader();
        }
    },

    delete(id) {
        if(confirm('¿Eliminar esta tarea y todas sus entregas?')) {
            UI.showLoader();
            DB.remove('assignments', id);
            // Delete related submissions
            let subs = DB.getTable('assignment_submissions');
            subs.filter(s => s.assignment_id === id).forEach(s => DB.remove('assignment_submissions', s.id));
            UI.showToast('Tarea eliminada.', 'success');
            this.render();
            UI.hideLoader();
        }
    },

    openSubmitModal(assignmentId) {
        UI.openModal('Entregar Tarea', `
            <form onsubmit="Views.Assignments.submitAssignment(event, ${assignmentId})">
                <div class="form-group">
                    <label>Archivo o Documento *</label>
                    <input type="file" id="sub-file" class="form-control" required>
                    <small class="text-muted">Asegúrate de que tu nombre esté en el archivo.</small>
                </div>
                <button type="submit" class="btn btn-primary w-full mt-3"><i class="fa-solid fa-paper-plane"></i> Enviar Entrega</button>
            </form>
        `);
    },

    async submitAssignment(e, assignmentId) {
        e.preventDefault();
        const fileInput = document.getElementById('sub-file');
        const file = fileInput.files[0];
        if (!file) return;

        try {
            UI.showLoader();
            const btn = e.target.querySelector('button');
            btn.disabled = true;
            btn.innerHTML = 'Subiendo...';

            let fileUrl = '#';
            if (window.sb) {
                const fileExt = file.name.split('.').pop();
                const fileName = \`\${Auth.getUser().id}-\${Math.random().toString(36).substring(2)}.\${fileExt}\`;
                const filePath = \`submissions/\${fileName}\`;

                const { data, error } = await sb.storage.from('materials').upload(filePath, file);
                if (error) throw error;
                const { data: { publicUrl } } = sb.storage.from('materials').getPublicUrl(filePath);
                fileUrl = publicUrl;
            } else {
                // Modo offline: simular subida
                fileUrl = URL.createObjectURL(file);
            }

            await DB.insert('assignment_submissions', {
                assignment_id: assignmentId,
                student_id: Auth.getUser().id,
                file_url: fileUrl,
                grade: null,
                comments: '',
                submitted_at: new Date().toISOString()
            });

            UI.closeModal();
            UI.showToast('Tarea entregada correctamente', 'success');
            
            // Gamification: 15 XP for submitting an assignment
            if (Gamification && Gamification.addXP) Gamification.addXP(Auth.getUser().id, 15);

            this.render();
        } catch (err) {
            UI.showToast('Error al entregar: ' + err.message, 'danger');
        } finally {
            UI.hideLoader();
        }
    },

    viewSubmissions(assignmentId) {
        const assignment = DB.getTable('assignments').find(a => a.id === assignmentId);
        const submissions = DB.getTable('assignment_submissions').filter(s => s.assignment_id === assignmentId);
        const users = DB.getTable('users');

        let tableHtml = `
            <table class="table" style="width:100%; text-align:left;">
                <thead>
                    <tr>
                        <th>Alumno</th>
                        <th>Fecha</th>
                        <th>Archivo</th>
                        <th>Nota</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (submissions.length === 0) {
            tableHtml += `<tr><td colspan="5" class="text-center text-muted">Aún no hay entregas.</td></tr>`;
        }

        submissions.forEach(sub => {
            const student = users.find(u => String(u.id) === String(sub.student_id));
            const studentName = student ? student.name : 'Desconocido';
            const dateStr = new Date(sub.submitted_at || Date.now()).toLocaleDateString();
            
            tableHtml += `
                <tr>
                    <td><strong>${studentName}</strong></td>
                    <td>${dateStr}</td>
                    <td><a href="${sub.file_url}" target="_blank" class="btn btn-sm btn-secondary"><i class="fa-solid fa-download"></i> Ver</a></td>
                    <td>${sub.grade ? `<span class="badge badge-success">${sub.grade}/10</span>` : '<span class="badge badge-warning">Pendiente</span>'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="Views.Assignments.openGradeModal(${sub.id}, '${studentName.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-check-double"></i> Calificar
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;

        UI.openModal(`Entregas: ${assignment.title}`, tableHtml);
    },

    openGradeModal(subId, studentName) {
        const sub = DB.getTable('assignment_submissions').find(s => s.id === subId);
        if (!sub) return;

        UI.openModal(`Calificar a ${studentName}`, `
            <form onsubmit="Views.Assignments.saveGrade(event, ${subId})">
                <div class="form-group">
                    <label>Calificación (1-10) *</label>
                    <input type="number" id="g-score" class="form-control" min="1" max="10" step="0.5" required value="${sub.grade || ''}">
                </div>
                <div class="form-group" style="position:relative">
                    <label>Feedback para el alumno</label>
                    <textarea id="g-comments" class="form-control" rows="3" placeholder="Muy buen trabajo en la gramática...">${sub.comments || ''}</textarea>
                    
                    <!-- Botón para pedir ayuda a Mila -->
                    <button type="button" class="btn btn-sm" style="position:absolute; top:0; right:0; background:var(--bg-hover); border:1px solid var(--border-color);" onclick="Views.Assignments.askMilaFeedback()">
                        <i class="fa-solid fa-wand-magic-sparkles text-primary"></i> Mila AI
                    </button>
                </div>
                
                <div id="mila-feedback-box" style="display:none; margin-bottom:1rem; padding:0.75rem; background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; font-size:0.85rem">
                    <strong>Sugerencia de Mila:</strong>
                    <div id="mila-feedback-content" style="margin-top:0.5rem"></div>
                </div>

                <button type="submit" class="btn btn-primary w-full"><i class="fa-solid fa-save"></i> Guardar Calificación</button>
            </form>
        `);
    },

    async askMilaFeedback() {
        const box = document.getElementById('mila-feedback-box');
        const content = document.getElementById('mila-feedback-content');
        
        box.style.display = 'block';
        content.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analizando (Mila necesita que le pegues aquí el texto del alumno si es que lo hay o Mila generará un feedback motivacional generico)...';
        
        try {
            // As this is an offline mock logic or depends on real Gemini.
            // In a real scenario, the text is extracted from the PDF/Word, which is hard in the browser without backend.
            // We'll simulate Mila's response for generic feedback.
            const prompt = "Actúa como profesor de inglés. Dame 3 frases cortas de feedback positivo y constructivo para un alumno. No menciones el nombre del alumno, solo dirígete a él.";
            const response = await MilaAI.callGeminiAPI(prompt, Auth.getUser(), 'teacher_feedback');
            
            content.innerHTML = response;
            
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm mt-2 w-full';
            btn.style.background = 'white';
            btn.innerText = 'Copiar al cuadro de Feedback';
            btn.onclick = () => {
                document.getElementById('g-comments').value = response;
            };
            content.appendChild(btn);
            
        } catch(e) {
            content.innerHTML = "No se pudo conectar con Mila en este momento.";
        }
    },

    async saveGrade(e, subId) {
        e.preventDefault();
        try {
            UI.showLoader();
            const grade = document.getElementById('g-score').value;
            const comments = document.getElementById('g-comments').value;

            await DB.update('assignment_submissions', subId, { grade, comments });
            UI.closeModal();
            UI.showToast('Calificación guardada.', 'success');
        } catch (err) {
            UI.showToast('Error: ' + err.message, 'danger');
        } finally {
            UI.hideLoader();
        }
    }
};
