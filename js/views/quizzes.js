window.Views = window.Views || {};

Views.Quizzes = {
    render() {
        const user = Auth.getUser();
        let courses = DB.getTable('courses');
        
        if (user.role === 'teacher') courses = courses.filter(c => String(c.teacher_id) === String(user.id));
        else if (user.role === 'student') courses = courses.filter(c => String(c.id) === String(user.course_id));
        
        const quizzes = DB.getTable('quizzes');
        const results = DB.getTable('quiz_results');
        const canUpload = ['admin', 'teacher'].includes(user.role);

        let html = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-clipboard-question"></i> Evaluaciones Online</h1>
                    <p class="text-muted mt-2">Cuestionarios y auto-evaluaciones.</p>
                </div>
                ${canUpload ? `<button class="btn btn-primary shadow-md" onclick="Views.Quizzes.openCreateModal()"><i class="fa-solid fa-plus"></i> Nuevo Quiz</button>` : ''}
            </div>
        `;

        if (courses.length === 0) {
            html += `<p class="text-muted" style="padding:2rem; text-align:center; background:white; border-radius:8px;">No tienes cursos asignados.</p>`;
        }

        html += courses.map(course => {
            const courseQuizzes = quizzes.filter(q => String(q.course_id) === String(course.id));
            
            return `
                <div class="card mb-4" style="border-left: 4px solid var(--primary);">
                    <h2 style="font-size:1.4rem;color:var(--text-main);margin-bottom:1.5rem;border-bottom:1px solid var(--border-color);padding-bottom:0.75rem">
                        <i class="fa-solid fa-graduation-cap text-primary"></i> ${course.name} <span class="badge badge-info text-sm ml-2">${course.level}</span>
                    </h2>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:1.5rem;">
                        ${courseQuizzes.length === 0 ? '<p class="text-muted w-full" style="grid-column: 1 / -1">No hay evaluaciones activas.</p>' : ''}
                        
                        ${courseQuizzes.map(q => {
                            let actionHtml = '';
                            if (user.role === 'student') {
                                const result = results.find(r => String(r.quiz_id) === String(q.id) && String(r.student_id) === String(user.id));
                                if (result) {
                                    actionHtml = `
                                        <div style="margin-top:1rem; padding:0.75rem; background:var(--bg-hover); border-radius:8px; text-align:center;">
                                            <p class="text-muted text-sm mb-1">Ya realizaste esta evaluación</p>
                                            <h3 class="text-primary m-0">Nota: ${result.score}%</h3>
                                        </div>
                                    `;
                                } else {
                                    actionHtml = `
                                        <button class="btn btn-primary w-full shadow-sm mt-3" onclick="Views.Quizzes.startQuiz(${q.id})">
                                            <i class="fa-solid fa-play"></i> Iniciar Evaluación
                                        </button>
                                    `;
                                }
                            } else {
                                const totalTaken = results.filter(r => String(r.quiz_id) === String(q.id)).length;
                                actionHtml = `
                                    <button class="btn btn-info w-full shadow-sm mt-3" onclick="Views.Quizzes.viewResults(${q.id})">
                                        <i class="fa-solid fa-chart-simple"></i> Ver Resultados (${totalTaken})
                                    </button>
                                `;
                            }

                            return `
                            <div class="card shadow-md" style="display:flex;flex-direction:column; border: 1px solid #e5e7eb; padding:1.25rem;">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="badge badge-success">Quiz</span>
                                    ${canUpload ? `<button onclick="Views.Quizzes.delete(${q.id})" style="background:none;border:none;color:var(--danger);font-size:1rem;cursor:pointer"><i class="fa-regular fa-trash-can"></i></button>` : ''}
                                </div>
                                <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem">${q.title}</h3>
                                <p style="font-size:0.85rem; color:var(--text-muted); flex:1;">${q.description || 'Sin descripción'}</p>
                                
                                ${actionHtml}
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('router-view').innerHTML = html;
    },

    openCreateModal() {
        const user = Auth.getUser();
        let courses = DB.getTable('courses');
        if (user.role === 'teacher') courses = courses.filter(c => String(c.teacher_id) === String(user.id));
        
        UI.openModal('Crear Cuestionario (Generador IA / Manual)', `
            <form onsubmit="Views.Quizzes.save(event)">
                <div class="form-group">
                    <label>Curso Destino *</label>
                    <select id="q-course" class="form-control" required>
                        ${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Título del Quiz *</label>
                    <input type="text" id="q-title" class="form-control" required placeholder="Ej: Past Simple vs Continuous">
                </div>
                
                <div class="card" style="background:#f0f9ff; border:1px solid #bae6fd; padding:1rem; margin-bottom:1rem">
                    <h4 style="margin:0 0 0.5rem 0; color:#0369a1; font-size:0.95rem"><i class="fa-solid fa-wand-magic-sparkles"></i> Generar con Mila</h4>
                    <p style="font-size:0.8rem; color:#0c4a6e; margin-bottom:0.5rem">Pídele a Mila que genere las preguntas automáticamente. Por ejemplo: "Crea 3 preguntas sobre el verbo To Be".</p>
                    <div style="display:flex; gap:0.5rem">
                        <input type="text" id="q-prompt" class="form-control" placeholder="Prompt para Mila..." style="flex:1">
                        <button type="button" class="btn btn-secondary" onclick="Views.Quizzes.generateWithMila()">Generar</button>
                    </div>
                </div>

                <div id="q-questions-container" style="border-top:1px solid #e5e7eb; padding-top:1rem; margin-top:1rem">
                    <h4 style="font-size:1rem; margin-bottom:1rem">Preguntas (JSON Formato)</h4>
                    <p class="text-muted text-sm mb-2">Formato esperado: [{"q": "Pregunta", "options": ["A", "B", "C", "D"], "correct": 0}]</p>
                    <textarea id="q-json" class="form-control" rows="8" required>[
    {
        "q": "Escribe aquí la pregunta 1",
        "options": ["Opcion 1", "Opcion 2", "Opcion 3", "Opcion 4"],
        "correct": 0
    }
]</textarea>
                </div>

                <button type="submit" class="btn btn-primary w-full mt-3"><i class="fa-solid fa-save"></i> Publicar Quiz</button>
            </form>
        `);
    },

    async generateWithMila() {
        const prompt = document.getElementById('q-prompt').value;
        if(!prompt) return;

        const btn = document.querySelector('button[onclick="Views.Quizzes.generateWithMila()"]');
        const originalText = btn.innerText;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;

        try {
            const userPrompt = "El usuario solicita: " + prompt + ". Genera un array de objetos con formato: [{'q': 'Pregunta', 'options': ['A', 'B', 'C', 'D'], 'correct': 0}]. Mínimo 3 preguntas. Solo JSON.";
            const res = await MilaAI.callGeminiAPI(userPrompt, Auth.getUser(), 'raw_json');
            
            // Clean up backticks if Gemini still included them
            let cleanJson = res.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            
            // Validate
            JSON.parse(cleanJson); 
            document.getElementById('q-json').value = cleanJson;
            UI.showToast("Preguntas generadas correctamente", "success");
        } catch (e) {
            UI.showToast("Error generando con Mila. Intenta reformular.", "danger");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    async save(e) {
        e.preventDefault();
        try {
            UI.showLoader();
            
            const questionsRaw = document.getElementById('q-json').value;
            let questionsData;
            try {
                questionsData = JSON.parse(questionsRaw);
            } catch(e) {
                throw new Error("El JSON de las preguntas es inválido.");
            }

            const quiz = await DB.insert('quizzes', {
                course_id: parseInt(document.getElementById('q-course').value),
                title: document.getElementById('q-title').value,
                description: "Generado automáticamente.",
                created_by: Auth.getUser().id
            });

            if (quiz) {
                // Save questions (Simulating saving to a separate table by storing them locally mapped to quiz_id)
                // En local, guardaremos las preguntas en una tabla quiz_questions
                for (const q of questionsData) {
                    await DB.insert('quiz_questions', {
                        quiz_id: quiz.id,
                        question: q.q,
                        options: JSON.stringify(q.options),
                        correct_option: q.correct
                    });
                }
            }

            UI.closeModal();
            UI.showToast('Quiz publicado con éxito.', 'success');
            this.render();
        } catch (err) {
            UI.showToast('Error al publicar: ' + err.message, 'danger');
        } finally {
            UI.hideLoader();
        }
    },

    delete(id) {
        if(confirm('¿Eliminar este quiz?')) {
            UI.showLoader();
            DB.remove('quizzes', id);
            
            // Cascades
            DB.getTable('quiz_questions').filter(q => q.quiz_id === id).forEach(q => DB.remove('quiz_questions', q.id));
            DB.getTable('quiz_results').filter(r => r.quiz_id === id).forEach(r => DB.remove('quiz_results', r.id));
            
            UI.showToast('Quiz eliminado.', 'success');
            this.render();
            UI.hideLoader();
        }
    },

    currentQuiz: null,
    currentAnswers: [],

    startQuiz(quizId) {
        const quiz = DB.getTable('quizzes').find(q => q.id === quizId);
        const questions = DB.getTable('quiz_questions').filter(q => q.quiz_id === quizId);
        
        if (questions.length === 0) {
            UI.showToast('Este quiz no tiene preguntas configuradas.', 'warning');
            return;
        }

        this.currentQuiz = quiz;
        this.currentQuestions = questions;
        this.currentAnswers = new Array(questions.length).fill(null);

        this.renderQuizUI(0);
    },

    renderQuizUI(questionIndex) {
        const total = this.currentQuestions.length;
        const q = this.currentQuestions[questionIndex];
        const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;

        const isLast = questionIndex === total - 1;
        const hasPrev = questionIndex > 0;

        const modalHtml = `
            <div style="padding:1rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:1rem; font-size:0.85rem; color:var(--text-muted)">
                    <span>Pregunta ${questionIndex + 1} de ${total}</span>
                    <span>${this.currentQuiz.title}</span>
                </div>

                <h3 style="font-size:1.2rem; margin-bottom:1.5rem; line-height:1.4">${q.question}</h3>
                
                <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:2rem">
                    ${options.map((opt, i) => `
                        <button class="btn" style="text-align:left; padding:1rem; border:1px solid ${this.currentAnswers[questionIndex] === i ? 'var(--primary)' : 'var(--border-color)'}; background:${this.currentAnswers[questionIndex] === i ? 'var(--primary-light)' : 'var(--bg-card)'}; color:var(--text-main); justify-content:flex-start; white-space:normal; line-height:1.4" onclick="Views.Quizzes.selectAnswer(${questionIndex}, ${i})">
                            <span style="display:inline-block; width:24px; height:24px; border-radius:50%; border:2px solid ${this.currentAnswers[questionIndex] === i ? 'var(--primary)' : '#ccc'}; margin-right:1rem; vertical-align:middle; text-align:center; line-height:20px; font-weight:bold; color:${this.currentAnswers[questionIndex] === i ? 'var(--primary)' : '#ccc'}">${['A','B','C','D'][i]}</span>
                            ${opt}
                        </button>
                    `).join('')}
                </div>

                <div style="display:flex; justify-content:space-between; gap:1rem">
                    <button class="btn btn-secondary flex-1" onclick="Views.Quizzes.renderQuizUI(${questionIndex - 1})" ${!hasPrev ? 'disabled' : ''}>Anterior</button>
                    
                    ${isLast ? `
                        <button class="btn btn-primary flex-1" onclick="Views.Quizzes.submitQuiz()">Finalizar y Evaluar</button>
                    ` : `
                        <button class="btn btn-primary flex-1" onclick="Views.Quizzes.renderQuizUI(${questionIndex + 1})">Siguiente</button>
                    `}
                </div>
            </div>
        `;

        UI.openModal('Evaluación en curso', modalHtml);
    },

    selectAnswer(qIndex, optIndex) {
        this.currentAnswers[qIndex] = optIndex;
        this.renderQuizUI(qIndex); // Re-render to show selection
    },

    async submitQuiz() {
        if (this.currentAnswers.includes(null)) {
            if(!confirm("Tienes preguntas sin responder. ¿Seguro que quieres finalizar?")) return;
        }

        UI.showLoader();
        
        let correctCount = 0;
        this.currentQuestions.forEach((q, i) => {
            if (this.currentAnswers[i] === q.correct_option) correctCount++;
        });

        const score = Math.round((correctCount / this.currentQuestions.length) * 100);

        try {
            await DB.insert('quiz_results', {
                quiz_id: this.currentQuiz.id,
                student_id: Auth.getUser().id,
                score: score,
                completed_at: new Date().toISOString()
            });

            // Gamification
            if (Gamification && Gamification.addXP) Gamification.addXP(Auth.getUser().id, score > 60 ? 30 : 10);

            UI.closeModal();
            
            // Show result modal
            UI.openModal('Resultado', `
                <div style="text-align:center; padding:2rem">
                    <div style="font-size:4rem; color:${score >= 60 ? 'var(--success)' : 'var(--danger)'}; margin-bottom:1rem">
                        <i class="fa-solid ${score >= 60 ? 'fa-face-smile' : 'fa-face-sad-tear'}"></i>
                    </div>
                    <h2 style="font-size:2.5rem; margin-bottom:0.5rem">${score}%</h2>
                    <p class="text-muted">Respondiste correctamente ${correctCount} de ${this.currentQuestions.length} preguntas.</p>
                    <button class="btn btn-primary mt-4" onclick="UI.closeModal()">Cerrar</button>
                </div>
            `);

            this.render();
        } catch (e) {
            UI.showToast("Error al guardar resultados", "danger");
        } finally {
            UI.hideLoader();
        }
    },

    viewResults(quizId) {
        const quiz = DB.getTable('quizzes').find(q => q.id === quizId);
        const results = DB.getTable('quiz_results').filter(r => r.quiz_id === quizId);
        const users = DB.getTable('users');

        let tableHtml = `
            <table class="table" style="width:100%; text-align:left;">
                <thead>
                    <tr>
                        <th>Alumno</th>
                        <th>Fecha</th>
                        <th>Puntaje</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (results.length === 0) {
            tableHtml += `<tr><td colspan="3" class="text-center text-muted">Aún no hay resultados.</td></tr>`;
        }

        results.forEach(res => {
            const student = users.find(u => String(u.id) === String(res.student_id));
            const studentName = student ? student.name : 'Desconocido';
            const dateStr = new Date(res.completed_at || Date.now()).toLocaleDateString();
            
            tableHtml += `
                <tr>
                    <td><strong>${studentName}</strong></td>
                    <td>${dateStr}</td>
                    <td><span class="badge ${res.score >= 60 ? 'badge-success' : 'badge-danger'}">${res.score}%</span></td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;

        UI.openModal(`Resultados: ${quiz.title}`, tableHtml);
    }
};
