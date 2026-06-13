window.Views = window.Views || {};

Views.Conversations = {
    render() {
        const user = Auth.getUser();

        if (user.role === 'student') {
            this.renderStudentView(user);
        } else {
            this.renderTeacherView(user);
        }
    },

    // ── VISTA DEL ALUMNO ──
    async renderStudentView(student) {
        const slots = DB.getTable('conversation_slots');
        const bookings = DB.getTable('bookings');
        const users = DB.getTable('users');

        // Obtener el profesor asignado al alumno (o el primer profesor si no hay)
        const myTeacherId = student.teacher_id;
        const myTeacher = users.find(u => String(u.id) === String(myTeacherId)) || 
                          users.find(u => u.role === 'teacher') || 
                          { name: 'Profesor de Turno', id: null };

        // Mis reservas activas
        const myBookings = bookings.filter(b => String(b.student_id) === String(student.id));
        const myBookedSlots = slots.filter(s => myBookings.some(b => String(b.slot_id) === String(s.id)));

        // Slots disponibles para mi profesor
        const availableSlots = slots.filter(s => 
            s.status === 'disponible' && 
            String(s.teacher_id) === String(myTeacher.id) &&
            new Date(`${s.date}T${s.time}`) > new Date()
        ).sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        let html = `
            <div class="mb-4">
                <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-comments"></i> Conversaciones 1-a-1</h1>
                <p class="text-muted mt-2">Reserva videollamadas individuales de 15 minutos para practicar conversación con tu profesor.</p>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:2rem; align-items: start;" class="mobile-grid-1">
                <!-- Columna 1: Reservar Nueva Conversación -->
                <div>
                    <div class="card shadow-sm" style="border-top:4px solid var(--primary)">
                        <h2 style="font-size:1.3rem; margin-bottom:1.5rem"><i class="fa-regular fa-calendar-plus text-primary"></i> Turnos Disponibles</h2>
                        <p class="text-muted text-sm mb-3">Profesor asignado: <strong>${myTeacher.name}</strong></p>

                        <div id="student-available-slots-container" style="display:flex; flex-direction:column; gap:1rem">
        `;

        if (availableSlots.length === 0) {
            html += `
                        </div>
                        <div style="margin-top:1.5rem; padding:1.25rem; background:var(--bg-hover); border-radius:10px; border:1px dashed var(--border-color); text-align:center">
                            <p class="text-muted text-sm mb-3">No hay turnos disponibles cargados para tu profesor esta semana.</p>
                            <button class="btn btn-secondary w-full" onclick="Views.Conversations.joinWaitlist(${myTeacher.id}, ${student.id})">
                                <i class="fa-solid fa-user-clock text-warning"></i> Unirme a la Lista de Espera
                            </button>
                        </div>
            `;
        } else {
            html += availableSlots.map(s => {
                const dateObj = new Date(`${s.date}T${s.time}`);
                const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' });
                return `
                    <div class="flex items-center justify-between" style="padding:0.75rem 1rem; background:var(--bg-main); border:1px solid var(--border-color); border-radius:8px">
                        <div>
                            <div style="font-weight:700; color:var(--text-main)"><i class="fa-regular fa-calendar text-primary"></i> ${dateStr}</div>
                            <div style="font-size:0.85rem; color:var(--text-muted)"><i class="fa-regular fa-clock"></i> ${s.time} hs (15m)</div>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="Views.Conversations.bookSlot(${s.id}, ${student.id})">
                            Reservar
                        </button>
                    </div>
                `;
            }).join('') + `</div>`;
        }

        html += `
                    </div>
                </div>

                <!-- Columna 2: Mis Turnos Reservados -->
                <div>
                    <div class="card shadow-sm" style="border-top:4px solid var(--success)">
                        <h2 style="font-size:1.3rem; margin-bottom:1.5rem"><i class="fa-solid fa-circle-check text-success"></i> Mis Reservas Activas</h2>
                        
                        <div id="student-my-bookings-container" style="display:flex; flex-direction:column; gap:1rem">
        `;

        if (myBookedSlots.length === 0) {
            html += `
                        <p class="text-muted" style="padding:2rem; text-align:center">Aún no tienes ninguna conversación programada.</p>
            `;
        } else {
            html += myBookedSlots.map(s => {
                const dateObj = new Date(`${s.date}T${s.time}`);
                const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' });
                const myBooking = myBookings.find(b => String(b.slot_id) === String(s.id));
                const teacherObj = users.find(u => String(u.id) === String(s.teacher_id)) || { name: 'Profesor' };
                
                return `
                    <div class="card shadow-sm" style="padding:1rem; border:1px solid var(--border-color); border-radius:8px">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="badge badge-success text-xs mb-1">Confirmado</span>
                                <div style="font-weight:700; font-size:1.1rem">${dateStr}</div>
                                <div class="text-muted text-sm"><i class="fa-regular fa-clock"></i> Hora: ${s.time} hs</div>
                                <div class="text-muted text-sm"><i class="fa-regular fa-user"></i> Con: ${teacherObj.name}</div>
                            </div>
                            <button class="btn" style="color:var(--danger); padding:0.25rem" onclick="Views.Conversations.cancelBooking(${myBooking.id}, ${s.id})" title="Cancelar Reserva">
                                <i class="fa-regular fa-trash-can" style="font-size:1.15rem"></i>
                            </button>
                        </div>
                        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center">
                            <span style="font-size:0.8rem; color:var(--text-muted)">Videollamada 15 min</span>
                            <a href="https://meet.google.com/new" target="_blank" class="btn btn-secondary btn-sm flex items-center gap-1">
                                <i class="fa-solid fa-video text-success"></i> Unirse a clase
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
        }

        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('router-view').innerHTML = html;
    },

    // ── VISTA DE PROFESOR / ADMIN ──
    async renderTeacherView(teacher) {
        const slots = DB.getTable('conversation_slots').filter(s => String(s.teacher_id) === String(teacher.id));
        const bookings = DB.getTable('bookings');
        const users = DB.getTable('users');
        const waitlist = DB.getTable('waitlist').filter(w => String(w.teacher_id) === String(teacher.id));

        let html = `
            <div class="flex justify-between items-center mb-4" style="flex-wrap:wrap; gap:1rem">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-comments"></i> Conversaciones de 15 Minutos</h1>
                    <p class="text-muted mt-2">Crea turnos disponibles para que tus alumnos reserven clases individuales.</p>
                </div>
                <button class="btn btn-primary shadow-md" onclick="Views.Conversations.openCreateModal(${teacher.id})">
                    <i class="fa-solid fa-plus"></i> Crear Turnos
                </button>
            </div>

            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem; align-items: start;" class="mobile-grid-1">
                <!-- Columna Principal: Calendario / Lista de Turnos -->
                <div class="card shadow-sm p-0" style="overflow:hidden">
                    <div style="background:#f1f5f9; padding:1rem; border-bottom:1px solid #e2e8f0; font-weight:700">
                        <i class="fa-regular fa-calendar-days text-primary"></i> Mis Horarios Cargados
                    </div>
                    
                    <div class="table-container">
                        <table class="w-full">
                            <thead>
                                <tr style="background:#f8fafc">
                                    <th style="padding:1rem">Fecha</th>
                                    <th>Hora</th>
                                    <th>Estado</th>
                                    <th>Alumno</th>
                                    <th style="text-align:center">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        if (slots.length === 0) {
            html += `
                <tr>
                    <td colspan="5" style="text-align:center; padding:4rem" class="text-muted">
                        No has creado ningún turno de conversación para tus alumnos todavía.
                    </td>
                </tr>
            `;
        } else {
            // Ordenar por fecha y hora
            const sortedSlots = slots.sort((a,b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
            
            html += sortedSlots.map(s => {
                const dateStr = new Date(`${s.date}T00:00:00`).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' });
                
                let statusBadge = '<span class="badge badge-info">Disponible</span>';
                let studentName = '-';
                
                if (s.status === 'reservado') {
                    statusBadge = '<span class="badge badge-success">Reservado</span>';
                    const booking = bookings.find(b => String(b.slot_id) === String(s.id));
                    if (booking) {
                        const studentObj = users.find(u => String(u.id) === String(booking.student_id));
                        studentName = studentObj ? studentObj.name : 'Alumno';
                    }
                }
                
                return `
                    <tr style="border-bottom:1px solid var(--border-color)">
                        <td style="padding:1rem"><strong>${dateStr}</strong></td>
                        <td>${s.time} hs</td>
                        <td>${statusBadge}</td>
                        <td>${studentName}</td>
                        <td style="text-align:center">
                            <button class="btn" style="color:var(--danger)" onclick="Views.Conversations.deleteSlot(${s.id})">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Columna Lateral: Alumnos en Espera -->
                <div>
                    <div class="card shadow-sm" style="border-top:4px solid var(--warning)">
                        <h2 style="font-size:1.25rem; margin-bottom:1rem">
                            <i class="fa-solid fa-user-clock text-warning"></i> Lista de Espera (${waitlist.length})
                        </h2>
                        <p class="text-muted text-sm mb-4">Alumnos que pidieron turnos adicionales para practicar.</p>
                        
                        <div id="waitlist-container" style="display:flex; flex-direction:column; gap:0.75rem">
        `;

        if (waitlist.length === 0) {
            html += `
                <p class="text-muted text-center" style="padding:1.5rem">No hay alumnos en lista de espera.</p>
            `;
        } else {
            html += waitlist.map(w => {
                const studentObj = users.find(u => String(u.id) === String(w.student_id)) || { name: 'Alumno' };
                const dateStr = new Date(w.created_at).toLocaleDateString();
                return `
                    <div style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); border-radius:8px" class="flex justify-between items-center">
                        <div>
                            <div style="font-weight:700">${studentObj.name}</div>
                            <div style="font-size:0.75rem; color:var(--text-muted)">Pedido: ${dateStr}</div>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="Views.Conversations.resolveWaitlist(${w.id})" title="Quitar de la lista">
                            <i class="fa-solid fa-check text-success"></i>
                        </button>
                    </div>
                `;
            }).join('');
        }

        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('router-view').innerHTML = html;
    },

    // ── ACCIONES ──
    async bookSlot(slotId, studentId) {
        UI.showLoader();
        try {
            // Registrar reserva
            const newBooking = await DB.insert('bookings', {
                slot_id: String(slotId),
                student_id: String(studentId),
                created_at: new Date().toISOString()
            });

            if (newBooking) {
                // Actualizar estado del slot a 'reservado'
                await DB.update('conversation_slots', slotId, { status: 'reservado' });
                
                UI.showToast("¡Conversación reservada con éxito!", "success");
                this.render();
            }
        } catch (err) {
            console.error("Booking slot error:", err);
            UI.showToast("Error al realizar la reserva.", "danger");
        } finally {
            UI.hideLoader();
        }
    },

    async cancelBooking(bookingId, slotId) {
        if (!confirm("¿Deseas cancelar esta reserva? El turno volverá a estar disponible.")) return;
        
        UI.showLoader();
        try {
            await DB.remove('bookings', bookingId);
            await DB.update('conversation_slots', slotId, { status: 'disponible' });
            
            UI.showToast("Reserva cancelada.", "info");
            this.render();
        } catch (err) {
            console.error("Cancel booking error:", err);
            UI.showToast("Error al cancelar la reserva.", "danger");
        } finally {
            UI.hideLoader();
        }
    },

    async joinWaitlist(teacherId, studentId) {
        UI.showLoader();
        try {
            const check = DB.getTable('waitlist').find(w => String(w.student_id) === String(studentId) && String(w.teacher_id) === String(teacherId));
            if (check) {
                UI.showToast("Ya estás en la lista de espera de este profesor.", "info");
                return;
            }

            await DB.insert('waitlist', {
                student_id: String(studentId),
                teacher_id: String(teacherId),
                created_at: new Date().toISOString()
            });

            UI.showToast("Te has unido a la lista de espera correctamente. ¡Tu profesor lo verá!", "success");
            this.render();
        } catch (err) {
            console.error("Waitlist error:", err);
            UI.showToast("Error al unirse a la lista de espera.", "danger");
        } finally {
            UI.hideLoader();
        }
    },

    async resolveWaitlist(id) {
        UI.showLoader();
        try {
            await DB.remove('waitlist', id);
            UI.showToast("Alumno quitado de la lista de espera.", "success");
            this.render();
        } catch (err) {
            console.error("Resolve waitlist error:", err);
            UI.showToast("Error al procesar la lista.", "danger");
        } finally {
            UI.hideLoader();
        }
    },

    openCreateModal(teacherId) {
        UI.openModal('Crear Turnos Disponibles', `
            <form id="create-slots-form" onsubmit="Views.Conversations.createSlots(event, ${teacherId})">
                <div class="form-group">
                    <label>Fecha *</label>
                    <input type="date" id="slot-date" class="form-control" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group mt-3">
                    <label>Hora de Inicio *</label>
                    <input type="time" id="slot-time" class="form-control" required>
                </div>
                <div class="form-group mt-3">
                    <label>Cantidad de Turnos Consecutivos (de 15 min)</label>
                    <select id="slot-count" class="form-control">
                        <option value="1">1 Turno (15 min)</option>
                        <option value="2">2 Turnos (30 min seguidos)</option>
                        <option value="3">3 Turnos (45 min seguidos)</option>
                        <option value="4">4 Turnos (1 hora seguida)</option>
                    </select>
                </div>
                <div class="mt-4 pt-3" style="border-top:1px solid #eee">
                    <button type="submit" class="btn btn-primary w-full"><i class="fa-solid fa-calendar-plus"></i> Generar Turnos</button>
                </div>
            </form>
        `);
    },

    async createSlots(e, teacherId) {
        e.preventDefault();
        UI.showLoader();

        const date = document.getElementById('slot-date').value;
        const startTime = document.getElementById('slot-time').value;
        const count = parseInt(document.getElementById('slot-count').value);

        try {
            let [hour, minute] = startTime.split(':').map(Number);
            
            for (let i = 0; i < count; i++) {
                const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                
                await DB.insert('conversation_slots', {
                    teacher_id: String(teacherId),
                    date,
                    time: timeString,
                    status: 'disponible'
                });

                // Avanzar 15 minutos para el siguiente slot
                minute += 15;
                if (minute >= 60) {
                    hour += 1;
                    minute -= 60;
                }
            }

            UI.showToast(`Se crearon ${count} turnos disponibles con éxito.`, "success");
            UI.closeModal();
            this.render();
        } catch (err) {
            console.error("Create slots error:", err);
            UI.showToast("Error al generar los turnos.", "danger");
        } finally {
            UI.hideLoader();
        }
    },

    async deleteSlot(slotId) {
        if (!confirm("¿Eliminar este turno permanente? Si estaba reservado, se perderá la reserva.")) return;

        UI.showLoader();
        try {
            // Si el slot estaba reservado, eliminar también la reserva
            const bookings = DB.getTable('bookings');
            const relatedBooking = bookings.find(b => String(b.slot_id) === String(slotId));
            if (relatedBooking) {
                await DB.remove('bookings', relatedBooking.id);
            }

            await DB.remove('conversation_slots', slotId);
            UI.showToast("Turno eliminado.", "success");
            this.render();
        } catch (err) {
            console.error("Delete slot error:", err);
            UI.showToast("Error al eliminar.", "danger");
        } finally {
            UI.hideLoader();
        }
    }
};
