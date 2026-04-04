window.Views = window.Views || {};

Views.Attendance = {
    render() {
        const user = Auth.getUser();

        if (user.role === 'student') {
            this.renderStudentView(user);
            return;
        }

        const allCourses = DB.getTable('courses');
        let courses = allCourses;
        if (user.role === 'teacher') {
            courses = courses.filter(c => Number(c.teacherId) === Number(user.id));
        }

        let html = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-regular fa-calendar-check"></i> Registro de Asistencia</h1>
                    <p class="text-muted mt-2">Seguimiento de presencia y faltas en los cursos asignados.</p>
                </div>
            </div>
            
            <div class="card mb-4" style="background:#fff; border-radius:var(--radius-lg)">
                <div class="form-group mb-0" style="max-width:320px">
                    <label>Seleccionar Curso Administrado</label>
                    <select id="a-course" class="form-control" onchange="Views.Attendance.loadCourseStats(this.value)" style="background:#f8fafc; font-weight:600">
                        <option value="">-- Elige un curso --</option>
                        ${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div id="attendance-stats">
                <div style="padding:4rem; text-align:center; color:var(--text-muted)">
                    <i class="fa-solid fa-hand-pointer" style="font-size:3rem; opacity:0.3; margin-bottom:1rem"></i>
                    <h2>Selecciona un curso arriba para tomar lista</h2>
                </div>
            </div>
        `;
        document.getElementById('router-view').innerHTML = html;
    },

    renderStudentView(student) {
        const coursesList = DB.getTable('courses');
        const attendanceRecords = DB.getTable('attendance');

        const attendance = attendanceRecords.filter(a => Number(a.studentId) === Number(student.id));
        
        const presentes = attendance.filter(a => a.status === 'Presente').length;
        const ausentes = attendance.filter(a => a.status === 'Ausente').length;
        const total = presentes + ausentes;
        const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 100;
        
        let html = `
            <h1 class="text-primary mb-4" style="font-size:2rem;"><i class="fa-regular fa-calendar-check"></i> Mi Historial de Asistencia</h1>
            
            <div class="flex gap-4 mb-4" style="flex-wrap:wrap">
                <div class="card metric-card" style="flex:1; border-left: 4px solid var(--info);">
                    <h3 class="text-muted text-sm uppercase"><i class="fa-solid fa-percent"></i> Porcentaje Global</h3>
                    <div style="font-size:2.5rem;font-weight:700;color:var(--text-main);margin-top:0.5rem">${porcentaje}%</div>
                </div>
                <div class="card metric-card" style="flex:1; border-left: 4px solid var(--success);">
                    <h3 class="text-muted text-sm uppercase"><i class="fa-solid fa-check"></i> Clases Presentes</h3>
                    <div style="font-size:2.5rem;font-weight:700;color:var(--success);margin-top:0.5rem">${presentes}</div>
                </div>
                <div class="card metric-card" style="flex:1; border-left: 4px solid var(--danger);">
                    <h3 class="text-muted text-sm uppercase"><i class="fa-solid fa-xmark"></i> Inasistencias</h3>
                    <div style="font-size:2.5rem;font-weight:700;color:var(--danger);margin-top:0.5rem">${ausentes}</div>
                </div>
            </div>
            
            <div class="card p-0 shadow-sm" style="overflow:hidden">
                <table class="table-responsive w-full" style="border-collapse: collapse">
                    <thead style="background:#f8fafc">
                        <tr>
                            <th style="padding:1rem">Fecha</th>
                            <th style="padding:1rem">Curso Referencia</th>
                            <th style="padding:1rem">Estado Registrado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${attendance.reverse().map(a => {
                            const c = coursesList.find(c => Number(c.id) === Number(a.courseId));
                            const badge = a.status === 'Presente' ? '<span class="badge badge-success">Presente</span>' : 
                                          a.status === 'Tarde' ? '<span class="badge badge-warning">Tarde</span>' :
                                          '<span class="badge badge-danger">Ausente</span>';
                            const dateStr = new Date(a.date).toLocaleDateString('es-ES', {weekday: 'short', month: 'short', day: 'numeric'});
                            return `
                                <tr>
                                    <td style="padding:1rem"><i class="fa-regular fa-calendar text-muted"></i> <strong>${dateStr}</strong></td>
                                    <td style="padding:1rem">${c ? c.name : 'Desc.'}</td>
                                    <td style="padding:1rem">${badge}</td>
                                </tr>
                            `;
                        }).join('')}
                        ${attendance.length === 0 ? '<tr><td colspan="3" style="text-align:center; padding:2rem" class="text-muted">Aún no hay registros para ti en este ciclo.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('router-view').innerHTML = html;
    },

    loadCourseStats(courseId) {
        if (!courseId) {
            document.getElementById('attendance-stats').innerHTML = '';
            return;
        }

        UI.showLoader();
        const courses = DB.getTable('courses');
        const course = courses.find(c => Number(c.id) === Number(courseId));
        const allUsers = DB.getTable('users');
        const students = allUsers.filter(u => u.role === 'student' && Number(u.courseId) === Number(courseId));
        
        let html = `
            <div class="card mb-4 border-left-primary shadow-sm" style="padding: 1.5rem; background:linear-gradient(to right, #ffffff, #fff5ec)">
                <div class="flex justify-between items-center">
                    <div>
                        <h2><i class="fa-solid fa-users text-primary"></i> ${course.name}</h2>
                        <p class="text-muted"><i class="fa-regular fa-clock"></i> Horario: <strong>${course.schedule}</strong> — Nivel: <span class="badge badge-info">${course.level}</span></p>
                    </div>
                </div>
            </div>
            
            <div class="card p-0" style="overflow:hidden">
                <div style="background:#f1f5f9; padding:1rem; border-bottom:1px solid #e2e8f0;" class="flex items-center justify-between">
                    <div style="font-weight:700"><i class="fa-solid fa-list-check"></i> Hoja de Asistencia Rápida</div>
                    <div class="flex items-center gap-2">
                        <input type="date" id="a-date" class="form-control" style="padding: 0.4rem; height:auto" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                
                <table class="w-full" style="border-collapse: collapse;">
                    <tbody>
                        ${students.map(s => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding:1rem 1.5rem">
                                    <div style="font-weight:600; font-size:1.1rem">${s.name}</div>
                                    <div class="text-muted" style="font-size:0.8rem">Email: ${s.email}</div>
                                </td>
                                <td style="padding:1rem 1.5rem; text-align:right">
                                    <div class="flex gap-2 justify-end" id="status-btns-${s.id}">
                                        <button class="btn btn-secondary shadow-sm" onclick="Views.Attendance.mark(${courseId}, ${s.id}, 'Presente', this)" style="border-radius:20px; font-size:0.85rem"><i class="fa-solid fa-check text-success"></i> Presente</button>
                                        <button class="btn btn-secondary shadow-sm" onclick="Views.Attendance.mark(${courseId}, ${s.id}, 'Tarde', this)" style="border-radius:20px; font-size:0.85rem"><i class="fa-solid fa-clock text-warning"></i> Tarde</button>
                                        <button class="btn btn-secondary shadow-sm" onclick="Views.Attendance.mark(${courseId}, ${s.id}, 'Ausente', this)" style="border-radius:20px; font-size:0.85rem"><i class="fa-solid fa-xmark text-danger"></i> Ausente</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                        ${students.length === 0 ? '<tr><td colspan="2" style="text-align:center; padding:3rem; color:var(--text-muted)">No hay alumnos asignados a este curso.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('attendance-stats').innerHTML = html;
        this.highlightExistingRecords(courseId);

        document.getElementById('a-date').addEventListener('change', () => {
            this.highlightExistingRecords(courseId);
        });
        UI.hideLoader();
    },

    highlightExistingRecords(courseId) {
        document.querySelectorAll('div[id^="status-btns-"] button').forEach(b => {
             b.classList.remove('btn-primary');
             b.classList.add('btn-secondary');
             b.style.background = '';
             b.style.color = '';
             b.style.borderColor = 'var(--border-color)';
             const icon = b.querySelector('i');
             if(icon) {
                 if(b.innerText.trim() === 'Presente') icon.className = 'fa-solid fa-check text-success';
                 else if(b.innerText.trim() === 'Tarde') icon.className = 'fa-solid fa-clock text-warning';
                 else icon.className = 'fa-solid fa-xmark text-danger';
                 icon.style.color = '';
             }
        });

        const date = document.getElementById('a-date').value;
        const records = DB.getTable('attendance');
        const filtered = records.filter(a => Number(a.courseId) === Number(courseId) && a.date === date);

        filtered.forEach(r => {
            const container = document.getElementById(`status-btns-${r.studentId}`);
            if(container) {
                const btns = container.querySelectorAll('button');
                btns.forEach(b => {
                    if(b.innerText.trim() === r.status) {
                        b.classList.remove('btn-secondary');
                        b.style.background = r.status === 'Presente' ? 'var(--success)' : r.status === 'Tarde' ? 'var(--warning)' : 'var(--danger)';
                        b.style.color = 'white';
                        b.style.borderColor = 'transparent';
                        const icon = b.querySelector('i');
                        if(icon) {
                            icon.className = icon.className.replace(/text-(success|warning|danger)/, '');
                            icon.style.color = 'white';
                        }
                    }
                });
            }
        });
    },

    mark(courseId, studentId, status, btnElem) {
        const date = document.getElementById('a-date').value;
        if(!date) {
            UI.showToast("Selecciona una fecha válida", "error");
            return;
        }

        UI.showLoader();
        const attendanceRecords = DB.getTable('attendance');
        const existing = attendanceRecords.find(a => Number(a.courseId) === Number(courseId) && Number(a.studentId) === Number(studentId) && a.date === date);

        if(existing) {
            DB.update('attendance', existing.id, { status: status });
        } else {
            DB.insert('attendance', {
                courseId: Number(courseId),
                studentId: Number(studentId),
                date,
                status
            });
        }
        
        this.highlightExistingRecords(courseId);
        UI.hideLoader();
        UI.showToast(`Marcado como ${status}`, "success");
    }
};
