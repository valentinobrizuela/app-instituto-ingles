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
        usersList.sort((a,b) => a.name.localeCompare(b.name));
        const limit = 20; 
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
                <div class="table-container">
                    <table id="users-table" style="width:100%">
                        <thead style="background:var(--bg-color)">
                            <tr>
                                <th style="padding:1rem">Usuario</th>
                                <th>Contacto</th>
                                <th>Rol / Nivel</th>
                                <th>Curso</th>
                                <th>Estado Pago</th>
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

        if(u.role === 'student' && u.course_id) {
            const c = allCourses.find(c => String(c.id) === String(u.course_id));
            if(c) courseHtml = `<span class="badge" style="background:#f3f4f6; color:#4b5563; border:1px solid #e5e7eb">${c.name}</span>`;
        } else if (u.role === 'teacher') {
            const cc = allCourses.filter(c => String(c.teacher_id) === String(u.id)).length;
            courseHtml = `<span class="text-muted" style="font-size:0.8rem">${cc} Cursos asignados</span>`;
        }

        return `
            <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s">
                <td style="padding:1rem;">
                    <div style="font-weight:600; color:var(--text-main)"><i class="fa-regular fa-user" style="color:var(--primary); margin-right:0.5rem"></i> ${u.name}</div>
                    ${u.age ? `<div class="text-muted" style="font-size:0.8rem">Edad: ${u.age}</div>` : ''}
                </td>
                <td style="font-size:0.9rem">
                    <div style="display:flex; align-items:center; gap:0.5rem">
                        <i class="fa-regular fa-envelope text-muted"></i> 
                        <span>${u.email || '-'}</span>
                        ${u.email ? `<button class="btn" style="padding:2px 5px; background:transparent; color:var(--info); font-size:0.8rem" onclick="UI.composeEmail(decodeURIComponent('${encodeURIComponent(u.email)}'), 'Consulta del Instituto West House', 'Hola ${encodeURIComponent(u.name.split(' ')[0])},')" title="Enviar Email"><i class="fa-solid fa-paper-plane"></i></button>` : ''}
                    </div>
                    ${u.parent_email ? `
                        <div style="margin-top:0.25rem; font-size:0.8rem; color:var(--text-muted); display:flex; align-items:center; gap:0.5rem">
                            <i class="fa-solid fa-user-shield text-info"></i> 
                            <span>Tutor: ${u.parent_email}</span>
                            <button class="btn" style="padding:2px 5px; background:transparent; color:var(--info); font-size:0.7rem" onclick="UI.composeEmail(decodeURIComponent('${encodeURIComponent(u.parent_email)}'), decodeURIComponent('${encodeURIComponent('Consulta sobre el alumno ' + u.name)}'), decodeURIComponent('${encodeURIComponent('Estimados padres de ' + u.name + ',')}'))" title="Email al Tutor"><i class="fa-solid fa-paper-plane"></i></button>
                        </div>` : ''}
                    ${u.parent_phone ? `
                        <div style="margin-top:0.25rem; font-size:0.8rem;">
                            <a href="https://wa.me/${u.parent_phone.replace(/\D/g,'')}?text=Hola,%20nos%20comunicamos%20de%20West%20House%20English%20School%20por%20motivos%20administrativos." 
                               target="_blank" 
                               style="color:#10b981; text-decoration:none; font-weight:bold; display:flex; align-items:center; gap:0.4rem">
                                <i class="fa-brands fa-whatsapp"></i> ${u.parent_phone}
                            </a>
                        </div>` : ''}
                </td>
                <td>
                    ${badge}
                    ${levelHtml}
                </td>
                <td>${courseHtml}</td>
                <td>
                    ${u.role === 'student' ? `
                        <div style="display:flex; align-items:center; gap:0.5rem">
                            ${(() => {
                                const status = DB.getStudentStatus(u.id);
                                if (status === 'paid') return '<span class="status-dot" style="background:#10b981" title="Al día"></span> <span style="font-size:0.75rem; color:#10b981; font-weight:700">Al día</span>';
                                if (status === 'pending') return '<span class="status-dot" style="background:#f59e0b" title="Pendiente"></span> <span style="font-size:0.75rem; color:#f59e0b; font-weight:700">Pendiente</span>';
                                return '<span class="status-dot" style="background:#ef4444" title="Moroso"></span> <span style="font-size:0.75rem; color:#ef4444; font-weight:700">Moroso</span>';
                            })()}
                        </div>
                    ` : '-'}
                </td>
                <td style="text-align:center">
                    <div style="display:flex; justify-content:center; gap:0.5rem">
                        <button class="btn" style="background:var(--primary-light); color:var(--primary); border:none; padding:0.5rem; border-radius:10px; cursor:pointer;" onclick="Views.Users.openModal(${u.id})" title="Editar">
                            <i class="fa-solid fa-user-pen"></i>
                        </button>
                        <button class="btn" style="background:rgba(239, 68, 68, 0.1); color:var(--danger); border:none; padding:0.5rem; border-radius:10px; cursor:pointer;" onclick="Views.Users.delete(${u.id})" title="Eliminar">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    openModal(id = null) {
        const allUsers = DB.getTable('users');
        const courses = DB.getTable('courses');
        
        let u = { name: '', email: '', role: 'student', password: 'westhouse123', age: '', parent_email: '', parent_phone: '', level: 'Beginner', course_id: '' };
        if (id) {
            u = allUsers.find(user => String(user.id) === Number(id));
        }

        const courseOptions = courses.map(c => `<option value="${c.id}" ${String(c.id) === String(u.course_id) ? 'selected' : ''}>${c.name}</option>`).join('');

        UI.openModal(id ? 'Editar Usuario' : 'Registrar Nuevo Usuario', `
            <form id="form-user" onsubmit="Views.Users.save(event, ${id || 'null'})">
                
                <h3 class="mb-2" style="font-size:1.1rem; border-bottom:1px solid #eee; padding-bottom:0.5rem; color:var(--primary)"><i class="fa-solid fa-id-card"></i> Datos Base</h3>
                <div class="responsive-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>Nombre Completo *</label>
                        <input type="text" id="u-name" class="form-control" placeholder="Ej: Carlos Pinto" required value="${u.name}">
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="u-email" class="form-control" placeholder="carlos@gmail.com" required value="${u.email}">
                    </div>
                </div>
                
                <div class="responsive-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-top:0.5rem;">
                    <div class="form-group">
                        <label>Rol en el Sistema *</label>
                        <select id="u-role" class="form-control" required style="background:#f9fafb; font-weight:600;" ${id ? 'disabled' : ''}>
                            <option value="student" ${u.role === 'student' ? 'selected' : ''}>Alumno</option>
                            <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>Profesor</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>${id ? 'Nueva Contraseña (Opcional)' : 'Contraseña Provisional *'}</label>
                        <input type="text" id="u-password" class="form-control" value="${id ? '' : 'westhouse123'}" ${id ? '' : 'required'}>
                    </div>
                </div>

                <!-- ALUMNOS FIELDS -->
                <div id="u-student-fields" style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0; margin-top:1.5rem; display: ${u.role === 'student' ? 'block' : 'none'}">
                    <h3 class="mb-4" style="font-size:1.1rem; color:var(--info)"><i class="fa-solid fa-graduation-cap"></i> Ficha Académica del Alumno</h3>
                    
                    <div style="display:grid; grid-template-columns: 100px 1fr 1fr; gap:1rem;">
                        <div class="form-group">
                            <label>Edad</label>
                            <input type="number" id="u-age" class="form-control" min="4" max="99" value="${u.age || ''}">
                        </div>
                        <div class="form-group">
                            <label>Email Tutor *</label>
                            <input type="email" id="u-parent" class="form-control" ${u.role === 'student' ? 'required' : ''} value="${u.parent_email || ''}">
                        </div>
                        <div class="form-group">
                            <label>WhatsApp Tutor *</label>
                            <input type="tel" id="u-phone" class="form-control" placeholder="+54 9 ..." ${u.role === 'student' ? 'required' : ''} value="${u.parent_phone || ''}">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1rem; margin-top:0.5rem">
                        <div class="form-group">
                            <label>Nivel de Inglés</label>
                            <select id="u-level" class="form-control">
                                <option value="Beginner" ${u.level === 'Beginner' ? 'selected' : ''}>Beginner (A1-A2)</option>
                                <option value="Intermediate" ${u.level === 'Intermediate' ? 'selected' : ''}>Intermediate (B1-B2)</option>
                                <option value="Advanced" ${u.level === 'Advanced' ? 'selected' : ''}>Advanced (C1-C2)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Experiencia (XP)</label>
                            <input type="number" id="u-xp" class="form-control" value="${u.xp || 0}">
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
                    <button type="submit" class="btn btn-primary w-full" style="font-size:1.1rem; padding:0.75rem;"><i class="fa-solid fa-save"></i> ${id ? 'Actualizar Usuario' : 'Guardar Usuario y Encriptar'}</button>
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

    async save(e, id = null) {
        e.preventDefault();
        UI.showLoader();
        
        const rawPassword = document.getElementById('u-password').value;
        const role = id ? DB.getTable('users').find(u => String(u.id) === Number(id)).role : document.getElementById('u-role').value;

        const data = {
            name: document.getElementById('u-name').value,
            email: document.getElementById('u-email').value,
            role: role
        };
        
        if (rawPassword) {
            data.password = rawPassword;
        }
        
        if (data.role === 'student') {
            data.age = parseInt(document.getElementById('u-age').value) || null;
            data.parent_email = document.getElementById('u-parent').value;
            data.parent_phone = document.getElementById('u-phone').value;
            data.level = document.getElementById('u-level').value;
            data.xp = parseInt(document.getElementById('u-xp').value) || 0;
            const courseVal = document.getElementById('u-course').value;
            if(courseVal) {
                data.course_id = parseInt(courseVal);
                const tCourse = DB.getTable('courses').find(c => String(c.id) === data.course_id);
                if(tCourse) data.teacher_id = tCourse.teacher_id;
            } else {
                data.course_id = null;
                data.teacher_id = null;
            }
        }

        try {
            if (id) {
                await DB.update('users', id, data);
                UI.showToast('Usuario actualizado con éxito.', 'success');
            } else {
                await DB.insert('users', data);
                UI.showToast('Usuario guardado con éxito y sincronizado.', 'success');
            }
            UI.closeModal();
            this.render();
        } catch (err) {
            UI.showToast('Error al procesar usuario', 'danger');
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
