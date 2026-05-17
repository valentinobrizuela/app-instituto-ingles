window.Views = window.Views || {};

Views.Calendar = {
    currentDate: new Date(),

    render() {
        const user = Auth.getUser();
        const canEdit = ['admin', 'teacher'].includes(user.role);
        
        let html = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-regular fa-calendar-days"></i> Calendario Institucional</h1>
                    <p class="text-muted mt-2">Fechas de exámenes, eventos y feriados.</p>
                </div>
                ${canEdit ? `<button class="btn btn-primary shadow-md" onclick="Views.Calendar.openModal()"><i class="fa-solid fa-plus"></i> Nuevo Evento</button>` : ''}
            </div>

            <div class="responsive-grid" style="display:grid; grid-template-columns: 1fr 300px; gap: 1.5rem; align-items: start;">
                <div class="calendar-main">
                    <!-- Calendar Controls -->
                    <div class="card mb-4" style="display:flex; justify-content:space-between; align-items:center; padding: 1rem 1.5rem;">
                        <button class="btn btn-secondary" onclick="Views.Calendar.changeMonth(-1)"><i class="fa-solid fa-chevron-left"></i> Anterior</button>
                        <h2 id="calendar-month-year" style="font-size:1.5rem; text-transform:capitalize; color:var(--text-main)">${this.getMonthName()}</h2>
                        <button class="btn btn-secondary" onclick="Views.Calendar.changeMonth(1)">Siguiente <i class="fa-solid fa-chevron-right"></i></button>
                    </div>

                    <!-- Calendar Grid -->
                    <div class="card p-0 overflow-hidden shadow-sm" style="background:var(--bg-card)">
                        <div style="display:grid; grid-template-columns: repeat(7, 1fr); background:var(--bg-main); border-bottom:1px solid var(--border-color); text-align:center; font-weight:700; color:var(--text-muted); padding:0.75rem 0;">
                            <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
                        </div>
                        <div id="calendar-grid" style="display:grid; grid-template-columns: repeat(7, 1fr); auto-rows: minmax(100px, auto);">
                            ${this.generateGrid(user, canEdit)}
                        </div>
                    </div>
                </div>

                <div class="calendar-sidebar">
                    <div class="card">
                        <h3 class="mb-4" style="font-size:1.1rem; color:var(--primary)"><i class="fa-solid fa-bell"></i> Próximos Eventos</h3>
                        <div id="upcoming-events-list">
                            ${this.renderUpcomingEvents(user)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('router-view').innerHTML = html;
    },

    getMonthName() {
        const options = { month: 'long', year: 'numeric' };
        return this.currentDate.toLocaleDateString('es-ES', options);
    },

    changeMonth(offset) {
        this.currentDate.setMonth(this.currentDate.getMonth() + offset);
        this.render();
    },

    generateGrid(user, canEdit) {
        let events = DB.getTable('events');
        
        if(user.role === 'teacher') {
            const myCourses = DB.getTable('courses').filter(c => String(c.teacherId) === String(user.id)).map(c=>c.id);
            events = events.filter(e => !e.courseId || myCourses.includes(e.courseId));
        } else if (user.role === 'student') {
            events = events.filter(e => !e.courseId || String(e.courseId) === String(user.course_id));
        }

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay(); 
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let gridHtml = '';
        
        for(let i=0; i<firstDay; i++) {
            gridHtml += `<div class="calendar-grid-cell" style="background:var(--bg-main); opacity:0.3"></div>`;
        }
        
        for(let d=1; d<=daysInMonth; d++) {
            const dayDateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const dayEvents = events.filter(e => e.start.startsWith(dayDateStr));
            
            let todayStyle = '';
            const today = new Date();
            if(d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                todayStyle = 'background-color:#fff5ec; border:1px solid var(--primary);';
            }

            gridHtml += `
                <div class="calendar-grid-cell" style="${todayStyle}">
                    <div class="calendar-day-number" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
                        ${d}
                        ${canEdit ? `<button onclick="Views.Calendar.openModal('${dayDateStr}')" style="background:none; border:none; cursor:pointer; color:var(--primary); font-size:0.8rem;" title="Añadir aquí"><i class="fa-solid fa-plus"></i></button>` : ''}
                    </div>
                    ${dayEvents.map(e => {
                        let badgeColor = e.type === 'Exam' ? 'danger' : e.type === 'Holiday' ? 'success' : 'primary';
                        const time = new Date(e.start).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
                        return `
                            <div class="badge badge-${badgeColor} mb-1 shadow-sm" style="display:block; padding:0.25rem 0.5rem; white-space:normal; cursor:pointer;" onclick="Views.Calendar.viewEvent(${e.id})">
                                <span style="font-weight:700; opacity:0.8">${time}</span> ${e.title}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        const totalSlots = firstDay + daysInMonth;
        const remainder = totalSlots % 7;
        if(remainder > 0) {
            for(let i=0; i<(7-remainder); i++) {
                gridHtml += `<div class="calendar-grid-cell" style="background:var(--bg-main); opacity:0.3"></div>`;
            }
        }
        
        return gridHtml;
    },

    viewEvent(id) {
        UI.showLoader();
        const events = DB.getTable('events');
        const ev = events.find(e => String(e.id) === Number(id));
        const user = Auth.getUser();
        const canEdit = ['admin', 'teacher'].includes(user.role);
        
        if(!ev) { UI.hideLoader(); return; }

        let courseName = 'Institucional (Todos)';
        if(ev.courseId) {
            const courses = DB.getTable('courses');
            const c = courses.find(c=>String(c.id) === String(ev.courseId));
            if(c) courseName = c.name;
        }

        UI.openModal(`Detalles del Evento`, `
            <div style="border-left: 4px solid var(--primary); padding-left:1rem; margin-bottom:1.5rem;">
                <h3 style="font-size:1.5rem; color:var(--text-main); margin-bottom:0.5rem;">${ev.title}</h3>
                <span class="badge badge-info">${ev.type}</span>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.5rem">
                <p><i class="fa-solid fa-calendar text-primary" style="width:20px"></i> <strong>Fecha Inicio:</strong> ${new Date(ev.start).toLocaleString('es-ES')}</p>
                <p><i class="fa-solid fa-graduation-cap text-primary" style="width:20px"></i> <strong>Aplica a:</strong> ${courseName}</p>
            </div>

            <div style="background:var(--bg-main); padding:1.25rem; border-radius:12px; border:1px solid var(--border-color); line-height:1.6; color:var(--text-main)">
                <p style="font-size:0.9rem; font-weight:600; color:var(--text-muted); margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.5px">Descripción</p>
                ${ev.description || 'Sin descripción adicional.'}
            </div>
            
            ${canEdit ? `
                <div class="flex gap-4 border-t mt-5 pt-4" style="border-color:var(--border-color)">
                    <button class="btn" style="background:rgba(239, 68, 68, 0.1); color:var(--danger); flex:1; padding:0.75rem" onclick="Views.Calendar.delete(${ev.id})"><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            ` : ''}
        `);
        UI.hideLoader();
    },

    renderUpcomingEvents(user) {
        let events = DB.getTable('events');
        const now = new Date();
        
        // Filter by user role/course
        if(user.role === 'teacher') {
            const myCourses = DB.getTable('courses').filter(c => String(c.teacherId) === String(user.id)).map(c=>c.id);
            events = events.filter(e => !e.courseId || myCourses.includes(e.courseId));
        } else if (user.role === 'student') {
            events = events.filter(e => !e.courseId || String(e.courseId) === String(user.course_id));
        }

        // Only future events, sorted by date
        const upcoming = events
            .filter(e => new Date(e.start) >= now)
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5);

        if (upcoming.length === 0) return '<p class="text-muted text-sm">No hay eventos próximos.</p>';

        return upcoming.map(e => `
            <div class="upcoming-item" onclick="Views.Calendar.viewEvent(${e.id})">
                <p style="font-weight:700; font-size:0.9rem; margin-bottom:0.25rem; color:var(--text-main)">${e.title}</p>
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span class="text-muted text-sm"><i class="fa-regular fa-clock"></i> ${new Date(e.start).toLocaleDateString('es-ES', {day:'numeric', month:'short'})}</span>
                    <span class="badge badge-${e.type === 'Exam' ? 'danger' : e.type === 'Holiday' ? 'success' : 'info'}" style="font-size:0.6rem">${e.type}</span>
                </div>
            </div>
        `).join('');
    },

    openModal(defaultDate = '') {
        const user = Auth.getUser();
        let courses = DB.getTable('courses');
        if(user.role === 'teacher') courses = courses.filter(c => String(c.teacherId) === String(user.id));
        
        let startVal = '';
        if(defaultDate) startVal = `${defaultDate}T09:00`; 

        UI.openModal('Añadir Evento', `
            <form id="form-event" onsubmit="Views.Calendar.save(event)">
                <div class="form-group">
                    <label>Título del Evento *</label>
                    <input type="text" id="ev-title" class="form-control" required placeholder="Ej: Examen Final Modal verbs">
                </div>
                
                <div class="responsive-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>Tipo *</label>
                        <select id="ev-type" class="form-control" required>
                            <option value="Class">Clase Especial</option>
                            <option value="Exam">Examen</option>
                            <option value="Holiday">Feriado / Asueto</option>
                            <option value="Other">Otro Evento</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Aplica al Curso *</label>
                        <select id="ev-course" class="form-control" required>
                            <option value="">-- Institucional (Todos) --</option>
                            ${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Fecha y Hora de Inicio *</label>
                    <input type="datetime-local" id="ev-start" class="form-control" required value="${startVal}">
                </div>

                <div class="form-group">
                    <label>Descripción / Notas</label>
                    <textarea id="ev-desc" class="form-control" rows="3" placeholder="Detalles extra como aula o temas a evaluar..."></textarea>
                </div>

                <div class="form-group mt-4 pt-4" style="border-top:1px solid #eee">
                    <button type="submit" class="btn btn-primary w-full shadow-sm"><i class="fa-solid fa-calendar-check"></i> Agendar Evento</button>
                </div>
            </form>
        `);
    },

    save(e) {
        e.preventDefault();
        UI.showLoader();
        const courseVal = document.getElementById('ev-course').value;
        
        DB.insert('events', {
            title: document.getElementById('ev-title').value,
            type: document.getElementById('ev-type').value,
            courseId: courseVal ? parseInt(courseVal) : null,
            start: document.getElementById('ev-start').value,
            description: document.getElementById('ev-desc').value
        });
        
        UI.closeModal();
        UI.showToast('Evento agendado en el calendario', 'success');
        this.render();
        UI.hideLoader();
    },

    delete(id) {
        if(confirm('¿ELIMINAR este evento definitivamente?')) {
            UI.showLoader();
            DB.remove('events', id);
            UI.closeModal();
            UI.showToast('Evento cancelado y eliminado', 'success');
            this.render();
            UI.hideLoader();
        }
    }
};
