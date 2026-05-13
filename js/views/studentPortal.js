window.Views = window.Views || {};

Views.StudentPortal = {
    _dailyQuizData: null,

    render() {
        try {
            const user = Auth.getUser();
            if (!user) return;

            const payments = DB.getTable('payments').filter(p => String(p.student_id) === String(user.id));
            const hasDebt = payments.some(p => p.status !== 'Pagado');
            const course = DB.getTable('courses').find(c => String(c.id) === String(user.course_id));
            const teacher = DB.getTable('users').find(u => String(u.id) === String(user.teacher_id));

            const container = document.getElementById('router-view');
            if (!container) return;

            const xp = Number(user.xp || 0);
            const spendable = Number(user.spendable_xp || 0);
            const level = user.level || 1;
            const streak = user.streak || 0;

            // Leaderboard: top 5 students by XP
            const allStudents = DB.getTable('users').filter(u => u.role === 'student')
                .sort((a, b) => (b.xp || 0) - (a.xp || 0));
            const top5 = allStudents.slice(0, 5);
            const myRank = allStudents.findIndex(s => String(s.id) === String(user.id)) + 1;

            // Daily quiz
            const quiz = this.getDailyQuiz();
            const quizDoneKey = `quiz_done_${new Date().toISOString().split('T')[0]}_${user.id}`;
            const quizDone = localStorage.getItem(quizDoneKey);

            const hour = new Date().getHours();
            let greeting = 'Good morning';
            if (hour >= 12 && hour < 18) greeting = 'Good afternoon';
            else if (hour >= 18) greeting = 'Good evening';

            const streakMsg = streak >= 7
                ? `🔥 ¡Racha de ${streak} días! Eres imparable.`
                : streak >= 2
                ? `🔥 ¡Llevas ${streak} días seguidos! Sigue así.`
                : '¡Conéctate mañana para empezar tu racha!';

            container.innerHTML = `
                <div class="hero-welcome">
                    <div style="position:relative; z-index:2">
                        <span class="badge" style="background:var(--accent); color:white; margin-bottom:1rem">Estudiante Activo</span>
                        <h1 class="hero-title">${greeting}, ${user.name ? user.name.split(' ')[0] : 'Alumno'}! 👋</h1>
                        <p class="hero-subtitle">Bienvenido de vuelta a West House. Sigue practicando y alcanzando tus metas.</p>
                        <div style="margin-top:2rem; display:flex; gap:1rem; align-items:center; flex-wrap:wrap">
                            <button class="btn btn-primary" onclick="window.location.hash='#/materials'">Ver mis materiales <i class="fa-solid fa-arrow-right"></i></button>
                            <button class="btn" style="background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.2)" onclick="window.location.hash='#/calendar'">Mi Horario</button>
                            <button class="btn" style="background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.2)" onclick="window.location.hash='#/rewards'">
                                <i class="fa-solid fa-store"></i> Tienda (${spendable} XP)
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Stats Bar -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px,1fr)); gap:1rem; margin-bottom:1.5rem">
                    <div class="card" style="margin:0; padding:1rem; display:flex; align-items:center; gap:1rem; border-top:3px solid var(--primary)">
                        <div style="font-size:2rem">⭐</div>
                        <div>
                            <div style="font-size:1.5rem; font-weight:800; color:var(--text-main)">${xp}</div>
                            <div class="text-xs text-muted uppercase font-bold">XP Total</div>
                        </div>
                    </div>
                    <div class="card" style="margin:0; padding:1rem; display:flex; align-items:center; gap:1rem; border-top:3px solid #f97316">
                        <div style="font-size:2rem">🔥</div>
                        <div>
                            <div style="font-size:1.5rem; font-weight:800; color:var(--text-main)">${streak}</div>
                            <div class="text-xs text-muted uppercase font-bold">Días de Racha</div>
                        </div>
                    </div>
                    <div class="card" style="margin:0; padding:1rem; display:flex; align-items:center; gap:1rem; border-top:3px solid var(--success)">
                        <div style="font-size:2rem">🏆</div>
                        <div>
                            <div style="font-size:1.5rem; font-weight:800; color:var(--text-main)">#${myRank}</div>
                            <div class="text-xs text-muted uppercase font-bold">Tu Ranking</div>
                        </div>
                    </div>
                    <div class="card" style="margin:0; padding:1rem; display:flex; align-items:center; gap:1rem; border-top:3px solid var(--accent)">
                        <div style="font-size:2rem">🎖️</div>
                        <div>
                            <div style="font-size:1.5rem; font-weight:800; color:var(--text-main)">Nv. ${level}</div>
                            <div class="text-xs text-muted uppercase font-bold">Nivel Actual</div>
                        </div>
                    </div>
                </div>

                <!-- XP Bar -->
                <div class="card mb-4" style="padding:1rem; border:1px solid var(--primary-light)">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem">
                        <div style="font-size:0.85rem; font-weight:700">${streakMsg}</div>
                        <span class="badge badge-primary">Nivel ${level}</span>
                    </div>
                    <div style="background:var(--bg-main); height:10px; border-radius:10px; overflow:hidden">
                        <div style="background:linear-gradient(90deg,var(--primary),var(--accent)); height:100%; width:${Math.min((xp % 100),100)}%; transition:width 1.2s ease-out; border-radius:10px"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:0.4rem">
                        <span class="text-xs text-muted">${xp} XP totales · ${spendable} XP disponibles</span>
                        <span class="text-xs text-muted">Próximo nivel: ${100 - (xp % 100)} XP</span>
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
                            <div class="avatar" style="background:var(--accent); color:white">${teacher && teacher.name ? teacher.name[0] : '?'}</div>
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
                                        <span style="font-weight:bold; color:${p.status === 'Pagado' ? 'var(--success)' : 'var(--danger)'}">$${Number(p.amount || 0).toLocaleString('es-AR')}</span>
                                    </div>
                                `).join('') : '<p class="text-xs text-muted">No hay pagos registrados aún.</p>'}
                            </div>

                            <button class="btn btn-secondary mt-4 w-full" onclick="window.location.hash='#/payments'">Ver Detalle Completo</button>
                        </div>
                    </div>

                    <!-- Daily Quiz Card -->
                    <div class="card" style="border-top:3px solid var(--accent); background:var(--bg-card)">
                        <h3 class="mb-3" style="color:var(--accent); display:flex; align-items:center; gap:0.5rem">
                            <i class="fa-solid fa-brain"></i> Reto del Día — +${Gamification.XP_MAP.DAILY_QUIZ} XP
                        </h3>
                        <div id="daily-quiz-container">
                            ${quizDone ? `
                                <div style="text-align:center; padding:1.5rem; background:var(--bg-hover); border-radius:12px">
                                    <div style="font-size:2.5rem; margin-bottom:0.5rem">✅</div>
                                    <p style="font-weight:700">¡Ya completaste el reto de hoy!</p>
                                    <p class="text-muted text-sm">Volvé mañana para uno nuevo. ¡Seguí sumando racha! 🔥</p>
                                </div>
                            ` : `
                                <div>
                                    <p style="font-weight:700; margin-bottom:1rem; color:var(--text-main)">${quiz.question}</p>
                                    <div style="display:flex; flex-direction:column; gap:0.5rem">
                                        ${quiz.options.map((opt, i) => `
                                            <button class="btn btn-secondary w-full" style="justify-content:flex-start; text-align:left" 
                                                onclick="Views.StudentPortal.checkAnswer(${i}, ${quiz.correct}, '${quizDoneKey}')">
                                                <span style="font-weight:700; margin-right:0.5rem">${String.fromCharCode(65+i)}.</span> ${opt}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Leaderboard -->
                    <div class="card">
                        <h3 class="mb-3" style="color:var(--primary); display:flex; align-items:center; gap:0.5rem">
                            <i class="fa-solid fa-ranking-star"></i> Top Alumnos esta Semana
                        </h3>
                        <div style="display:flex; flex-direction:column; gap:0.75rem">
                            ${top5.map((s, i) => {
                                const isMe = String(s.id) === String(user.id);
                                const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
                                return `
                                    <div style="display:flex; align-items:center; gap:0.75rem; padding:0.75rem; border-radius:10px; background:${isMe ? 'var(--primary-light)' : 'var(--bg-hover)'}; border:1px solid ${isMe ? 'var(--primary)' : 'transparent'}">
                                        <span style="font-size:1.25rem; width:28px; text-align:center">${medals[i]}</span>
                                        <div class="avatar" style="width:30px; height:30px; font-size:0.75rem; background:${isMe ? 'var(--primary)' : 'var(--accent)'}">${(s.name||'?')[0]}</div>
                                        <span style="flex:1; font-weight:${isMe?'800':'600'}; font-size:0.9rem; color:${isMe?'var(--primary)':'var(--text-main)'}">${s.name ? s.name.split(' ')[0] : 'Alumno'}${isMe?' (Tú)':''}</span>
                                        <span class="badge badge-primary" style="font-size:0.7rem">${s.xp||0} XP</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Badges -->
                    <div class="card" style="grid-column: 1 / -1;">
                        <h3 class="mb-4" style="color:var(--primary); display:flex; align-items:center; gap:0.5rem">
                            <i class="fa-solid fa-trophy"></i> Mi Sala de Trofeos
                        </h3>
                        <div id="trophy-room" style="display:flex; gap:1.5rem; flex-wrap:wrap">
                            ${this.renderBadges(user)}
                        </div>
                    </div>

                    <div class="card" style="grid-column: 1 / -1;">
                        <h3 class="mb-4" style="color:var(--primary); display:flex; align-items:center; gap:0.5rem">
                            <i class="fa-solid fa-timeline"></i> Mi Camino de Aprendizaje
                        </h3>
                        <div id="learning-timeline">Cargando progreso...</div>
                    </div>
                </div>
            `;
            
            this.renderTimeline(user);
        } catch (err) {
            console.error("Error en StudentPortal.render:", err);
            document.getElementById('router-view').innerHTML = `
                <div class="card" style="text-align:center; padding: 4rem;">
                    <i class="fa-solid fa-circle-exclamation text-warning" style="font-size:3rem;"></i>
                    <h2 class="mt-4">Lo sentimos</h2>
                    <p class="text-muted">No pudimos cargar tu panel. Esto puede deberse a datos incompletos en tu perfil.</p>
                    <button class="btn btn-primary mt-4" onclick="window.location.reload()">Reintentar</button>
                </div>
            `;
        }
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
    },

    renderBadges(user) {
        const badges = user.badges || [];
        const badgeData = {
            'Scholar': { icon: 'fa-graduation-cap', color: '#3b82f6', desc: 'Por llegar al Nivel 2' },
            'Master': { icon: 'fa-award', color: '#8b5cf6', desc: 'Por llegar al Nivel 5' },
            'Perfect-Attendance': { icon: 'fa-calendar-check', color: '#10b981', desc: 'Asistencia perfecta' },
            'Early-Bird': { icon: 'fa-bolt', color: '#f59e0b', desc: 'Inscripción temprana' }
        };

        if (badges.length === 0) {
            return `<p class="text-muted" style="padding:1rem; border:1px dashed var(--border-color); width:100%; text-align:center; border-radius:12px">Aún no has ganado medallas. ¡Sigue estudiando para desbloquearlas!</p>`;
        }

        return badges.map(b => {
            const data = badgeData[b] || { icon: 'fa-certificate', color: '#64748b', desc: 'Logro desbloqueado' };
            return `
                <div class="badge-card" style="text-align:center; width:120px; padding:1rem; background:var(--bg-main); border-radius:16px; border:1px solid var(--border-color)">
                    <div style="width:60px; height:60px; background:${data.color}22; color:${data.color}; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 0.75rem; font-size:1.5rem">
                        <i class="fa-solid ${data.icon}"></i>
                    </div>
                    <p style="font-weight:700; font-size:0.85rem; margin-bottom:0.25rem">${b}</p>
                    <p style="font-size:0.65rem; color:var(--text-muted)">${data.desc}</p>
                </div>
            `;
        }).join('');
    },

    getDailyQuiz() {
        const pool = [
            { question: '¿Cómo se dice "Biblioteca" en inglés?', options: ['Library','Cafeteria','Bathroom','Bookshop'], correct: 0 },
            { question: '¿Cuál es el pasado simple de "go"?', options: ['Goed','Gone','Went','Goes'], correct: 2 },
            { question: '"I ___ a student." ¿Qué verbo va aquí?', options: ['is','are','am','be'], correct: 2 },
            { question: '¿Cómo se dice "Rojo" en inglés?', options: ['Blue','Green','Red','Yellow'], correct: 2 },
            { question: '¿Qué significa "beautiful"?', options: ['Feo','Difícil','Hermoso','Rápido'], correct: 2 },
            { question: '¿Cuál es el plural de "child"?', options: ['Childs','Childes','Children','Childres'], correct: 2 },
            { question: '"She ___ to school every day." ¿Qué va?', options: ['go','goes','going','went'], correct: 1 },
        ];
        // Use day of year as seed so everyone gets the same quiz each day
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        return pool[dayOfYear % pool.length];
    },

    async checkAnswer(selected, correct, quizDoneKey) {
        const buttons = document.querySelectorAll('#daily-quiz-container button');
        buttons.forEach((btn, i) => {
            btn.disabled = true;
            if (i === correct) btn.style.background = 'var(--success)';
            if (i === selected && selected !== correct) btn.style.background = 'var(--danger)';
        });

        const user = Auth.getUser();
        if (selected === correct) {
            try {
                await Gamification.awardXP(user.id, Gamification.XP_MAP.DAILY_QUIZ, 'Reto del Día');
                // Solo marcar como hecho si el XP se guardó correctamente
                localStorage.setItem(quizDoneKey, '1');
                UI.showToast(`¡Correcto! +${Gamification.XP_MAP.DAILY_QUIZ} XP ganados 🎉`, 'success');
                setTimeout(() => {
                    const qc = document.getElementById('daily-quiz-container');
                    if (qc) qc.innerHTML = `
                        <div style="text-align:center; padding:1.5rem; background:var(--bg-hover); border-radius:12px">
                            <div style="font-size:2.5rem; margin-bottom:0.5rem">🎉</div>
                            <p style="font-weight:700">¡Excelente! +${Gamification.XP_MAP.DAILY_QUIZ} XP</p>
                            <p class="text-muted text-sm">Volvé mañana para un nuevo reto. ¡Seguí tu racha! 🔥</p>
                        </div>`;
                }, 1200);
            } catch (err) {
                console.error('[Quiz] Error al guardar XP:', err);
                UI.showToast('¡Correcto! Pero no se pudo guardar el XP. Intenta de nuevo más tarde.', 'danger');
                // Re-habilitar botones para que pueda intentar de nuevo
                buttons.forEach(btn => btn.disabled = false);
            }
        } else {
            UI.showToast('¡Casi! La respuesta correcta está resaltada en verde.', 'info');
        }
    }
};
