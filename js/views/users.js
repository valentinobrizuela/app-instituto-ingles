window.Views = window.Views || {};

Views.Users = {
    render(page = 1) {
        if (!Auth.hasRole('admin')) {
            document.getElementById('router-view').innerHTML = `
                <div class="card" style="text-align:center; padding: 4rem;">
                    <i class="fa-solid fa-lock text-danger" style="font-size:3rem;"></i>
                    <h2 class="mt-4">Acceso Restringido</h2>
                    <p class="text-muted">Solo los administradores pueden gestionar usuarios.</p>
                </div>
            `;
            return;
        }

        const usersList = DB.getTable('users').filter(u => u.role !== 'admin');
        const limit = 20; // Aumentar a 20 para manejar mejor los 100 alumnos
        const pagedData = DB.paginate(usersList, page, limit);

        document.getElementById('router-view').innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-users-gear"></i> Gestión de Usuarios</h1>
                    <p class="text-muted mt-2">Administra alumnos y profesores del instituto.</p>
                </div>
                <button class="btn btn-primary shadow-md" onclick="Views.Users.openModal()"><i class="fa-solid fa-user-plus"></i> Crear Nuevo</button>
            </div>
            
            <div class="card mb-4" style="padding:0; overflow:hidden;">
                <div class="table-responsive">
                    <table id="users-table" style="width:100%">
                        <thead style="background:var(--bg-color)">
                            <tr>
                                <th style="padding:1rem">Usuario</th>
                                <th>Contacto</th>
                                <th>Rol / Nivel</th>
                                <th>Curso</th>
                                <th style="text-align:center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pagedData.data.map(u => this.row(u)).join('')}
                            ${pagedData.data.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:2rem" class="text-muted">No hay usuarios registrados</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
                
                ${pagedData.totalPages > 1 ? `
                <div style="padding:1rem; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; background:var(--primary-light);">
                    <button class="btn btn-secondary shadow-sm" ${page === 1 ? 'disabled' : ''} onclick="Views.Users.render(${page - 1})">
                        <i class="fa-solid fa-angle-left"></i> Anterior
                    </button>
                    <span class="text-muted text-sm font-weight-bold">Página ${page} de ${pagedData.totalPages}</span>
                    <button class="btn btn-secondary shadow-sm" ${page === pagedData.totalPages ? 'disabled' : ''} onclick="Views.Users.render(${page + 1})">
                        Siguiente <i class="fa-solid fa-angle-right"></i>
                    </button>
                </div>` : ''}
            </div>
        `;
    },

    row(u) {
        let badge = u.role === 'student' ? '<span class="badge badge-success">Alumno</span>' 
                : '<span class="badge badge-info">Profesor</span>';
        
        let levelHtml = u.level ? `<div style="font-size:0.8rem; margin-top:0.25rem" class="text-muted"><i class="fa-solid fa-layer-group"></i> ${u.level}</div>` : '';
        let courseHtml = '-';

        const allCourses = DB.getTable('courses');

        if(u.role === 'student' && u.courseId) {
            const c = allCourses.find(c => Number(c.id) === Number(u.courseId));
            if(c) courseHtml = `<span class="badge" style="background:#f3f4f6; color:#4b5563; border:1px solid #e5e7eb">${c.name}</span>`;
        } else if (u.role === 'teacher') {
            const cc = allCourses.filter(c => Number(c.teacherId) === Number(u.id)).length;
            courseHtml = `<span class="text-muted" style="font-size:0.8rem">${cc} Cursos asignados</span>`;
        }

        return `
            <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s">
                <td style="padding:1rem;">
                    <div style="font-weight:600; color:var(--text-main)"><i class="fa-regular fa-user" style="color:var(--primary); margin-right:0.5rem"></i> ${u.name}</div>
                    ${u.age ? `<div class="text-muted" style="font-size:0.8rem">Edad: ${u.age}</div>` : ''}
                </td>
                <td style="font-size:0.9rem">
                    <div><i class="fa-regular fa-envelope text-muted"></i> ${u.email || '-'}</div>
                    ${u.parentEmail ? `<div style="margin-top:0.25rem; font-size:0.8rem; color:var(--text-muted)"><i class="fa-solid fa-user-shield text-info"></i> Tutor: ${u.parentEmail}</div>` : ''}
                    ${u.parentPhone ? `<div style="margin-top:0.25rem; font-size:0.8rem;"><a href="https://wa.me/${u.parentPhone.replace(/\D/g,'')}?text=Hola,%20nos%20comunicamos%20de%20West%20House%20English%20School%20por%20motivos%20administrativos." target="_blank" style="color:#10b981; text-decoration:none; font-weight:bold"><i class="fa-brands fa-whatsapp"></i> ${u.parentPhone}</a></div>` : ''}
                </td>
                <td>
                    ${badge}
                    ${levelHtml}
                </td>
                <td>${courseHtml}</td>
                <td style="text-align:center">
                    <button class="btn" style="background:#fee2e2; color:#b91c1c; border:none; padding:0.4rem 0.6rem; border-radius:6px; cursor:pointer;" onclick="Views.Users.delete(${u.id})" title="Eliminar">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    },

    openModal() {
        const courses = DB.getTable('courses');
        const courseOptions = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        UI.openModal('Registrar Nuevo Usuario', `
            <form id="form-user" onsubmit="Views.Users.save(event)">
                
                <h3 class="mb-2" style="font-size:1.1rem; border-bottom:1px solid #eee; padding-bottom:0.5rem; color:var(--primary)"><i class="fa-solid fa-id-card"></i> Datos Base</h3>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>Nombre Completo *</label>
                        <input type="text" id="u-name" class="form-control" placeholder="Ej: Carlos Pinto" required>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="u-email" class="form-control" placeholder="carlos@gmail.com" required>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-top:0.5rem;">
                    <div class="form-group">
                        <label>Rol en el Sistema *</label>
                        <select id="u-role" class="form-control" required style="background:#f9fafb; font-weight:600;">
                            <option value="student">Alumno</option>
                            <option value="teacher">Profesor</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Contraseña Provisional *</label>
                        <input type="text" id="u-password" class="form-control" value="westhouse123" required>
                    </div>
                </div>

                <!-- ALUMNOS FIELDS -->
                <div id="u-student-fields" style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0; margin-top:1.5rem">
                    <h3 class="mb-4" style="font-size:1.1rem; color:var(--info)"><i class="fa-solid fa-graduation-cap"></i> Ficha Académica del Alumno</h3>
                    
                    <div style="display:grid; grid-template-columns: 100px 1fr 1fr; gap:1rem;">
                        <div class="form-group">
                            <label>Edad</label>
                            <input type="number" id="u-age" class="form-control" min="4" max="99">
                        </div>
                        <div class="form-group">
                            <label>Email Tutor *</label>
                            <input type="email" id="u-parent" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>WhatsApp Tutor *</label>
                            <input type="tel" id="u-phone" class="form-control" placeholder="+54 9 ..." required>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-top:0.5rem">
                        <div class="form-group">
                            <label>Nivel de Inglés</label>
                            <select id="u-level" class="form-control">
                                <option value="Beginner">Beginner (A1-A2)</option>
                                <option value="Intermediate">Intermediate (B1-B2)</option>
                                <option value="Advanced">Advanced (C1-C2)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Asignación a Curso</label>
                            <select id="u-course" class="form-control">
                                <option value="">(Sin asignar)</option>
                                ${courseOptions}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-group mt-4 pt-4" style="border-top:1px solid #eee;">
                    <button type="submit" class="btn btn-primary w-full" style="font-size:1.1rem; padding:0.75rem;"><i class="fa-solid fa-save"></i> Guardar Usuario y Encriptar</button>
                </div>
            </form>
        `);
        
        setTimeout(() => {
            const roleSelect = document.getElementById('u-role');
            const studentFields = document.getElementById('u-student-fields');
            const parentInput = document.getElementById('u-parent');
            const phoneInput = document.getElementById('u-phone');

            roleSelect.addEventListener('change', (e) => {
                if(e.target.value === 'student') {
                    studentFields.style.display = 'block';
                    parentInput.setAttribute('required', 'true');
                    phoneInput.setAttribute('required', 'true');
                } else {
                    studentFields.style.display = 'none';
                    parentInput.removeAttribute('required');
                    phoneInput.removeAttribute('required');
                }
            });
        }, 100);
    },

    async save(e) {
        e.preventDefault();
        UI.showLoader();
        
        const rawPassword = document.getElementById('u-password').value;
        // NOTA: No hasheamos aquí, dejamos que el Backend lo haga por seguridad centralizada
        // El backend detecta si el pass es corto y lo hashea.

        const data = {
            name: document.getElementById('u-name').value,
            email: document.getElementById('u-email').value,
            role: document.getElementById('u-role').value,
            password: rawPassword
        };
        
        if (data.role === 'student') {
            data.age = parseInt(document.getElementById('u-age').value) || null;
            data.parentEmail = document.getElementById('u-parent').value;
            data.parentPhone = document.getElementById('u-phone').value;
            data.level = document.getElementById('u-level').value;
            const courseVal = document.getElementById('u-course').value;
            if(courseVal) {
                data.courseId = parseInt(courseVal);
                const tCourse = DB.getTable('courses').find(c => Number(c.id) === data.courseId);
                if(tCourse) data.teacherId = tCourse.teacherId;
            }
        }

        try {
            await DB.insert('users', data);
            UI.closeModal();
            UI.showToast('Usuario guardado con éxito y sincronizado.', 'success');
            this.render();
        } catch (err) {
            UI.showToast('Error al guardar usuario', 'danger');
        }
        UI.hideLoader();
    },

    async delete(id) {
        if(confirm('¿Seguro que deseas ELIMINAR este usuario de forma permanente?')) {
            UI.showLoader();
            await DB.remove('users', id);
            UI.showToast('Usuario eliminado', 'success');
            this.render();
            UI.hideLoader();
        }
    }
};
