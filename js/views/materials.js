window.Views = window.Views || {};

Views.Materials = {
    render() {
        const user = Auth.getUser();
        let courses = DB.getTable('courses');
        
        if(user.role === 'teacher') {
            courses = courses.filter(c => c.teacherId === user.id);
        } else if (user.role === 'student') {
            courses = courses.filter(c => c.id === user.courseId && c.level === user.level);
        }
        
        const materials = DB.getTable('materials');
        const canUpload = ['admin', 'teacher'].includes(user.role);

        let html = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-primary" style="font-size:2rem; margin-bottom:0;"><i class="fa-solid fa-cloud-arrow-down"></i> Materiales de Estudio</h1>
                    <p class="text-muted mt-2">Documentos, guías y videos complementarios.</p>
                </div>
                ${canUpload ? `<button class="btn btn-primary shadow-md" onclick="Views.Materials.openModal()"><i class="fa-solid fa-cloud-arrow-up"></i> Subir Recurso</button>` : ''}
            </div>
            
            ${user.role === 'student' ? `
            <div style="background:var(--info); color:white; padding:0.75rem 1rem; border-radius:8px; margin-bottom:1.5rem; display:flex; gap:0.5rem; align-items:center;">
                <i class="fa-solid fa-shield-halved"></i>
                <span>Visualizando estrictamente materiales correspondientes a tu nivel: <strong>${user.level || 'Asignado'}</strong>.</span>
            </div>
            `: ''}
        `;

        if(courses.length === 0) {
            html += `<p class="text-muted" style="padding:2rem; text-align:center; background:white; border-radius:8px;">No tienes acceso a ningún material actualmente.</p>`;
        }

        html += courses.map(course => {
            const courseMats = materials.filter(m => m.courseId === course.id);
            return `
                <div class="card mb-4" style="border-left: 4px solid var(--primary);">
                    <h2 style="font-size:1.4rem;color:var(--text-main);margin-bottom:1.5rem;border-bottom:1px solid var(--border-color);padding-bottom:0.75rem">
                        <i class="fa-solid fa-folder-open text-primary"></i> ${course.name} <span class="badge badge-info text-sm ml-2">${course.level}</span>
                    </h2>
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:1.5rem;">
                        ${courseMats.length === 0 ? '<p class="text-muted w-full" style="grid-column: 1 / -1">Aún no hay materiales publicados en este nivel.</p>' : ''}
                        
                        ${courseMats.map(m => {
                            let isYoutube = m.url.includes('youtube.com') || m.url.includes('youtu.be');
                            let isDrive = m.url.includes('drive.google.com');
                            let icon = 'fa-solid fa-link text-primary';
                            let typeText = 'Enlace Externo';
                            let mediaPreview = '';

                            if(isYoutube) {
                                typeText = 'Video de YouTube';
                                icon = 'fa-brands fa-youtube text-danger';
                                let videoId = '';
                                if(m.url.includes('v=')) videoId = m.url.split('v=')[1]?.split('&')[0];
                                else if(m.url.includes('youtu.be/')) videoId = m.url.split('youtu.be/')[1]?.split('?')[0];
                                
                                if(videoId) {
                                    mediaPreview = `
                                        <div id="yt-${m.id}" style="margin-top:1rem; border-radius:8px; overflow:hidden; position:relative; cursor:pointer;" onclick="Views.Materials.playYt('${videoId}', 'yt-${m.id}')">
                                            <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" style="width:100%; height:180px; object-fit:cover; display:block;">
                                            <div style="position:absolute; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center;">
                                                <i class="fa-brands fa-youtube text-danger" style="font-size:3rem; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5))"></i>
                                            </div>
                                        </div>
                                    `;
                                }
                            } else if (isDrive) {
                                typeText = 'Google Drive / Documento';
                                icon = 'fa-brands fa-google-drive text-success';
                            } else if (m.url.endsWith('.pdf')) {
                                typeText = 'Documento PDF';
                                icon = 'fa-solid fa-file-pdf text-danger';
                            }

                            return `
                            <div class="card shadow-md" style="display:flex;flex-direction:column; border: 1px solid #e5e7eb; padding:1.25rem; transition: transform 0.2s">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="badge" style="background:#f3f4f6; color:#4b5563; font-size:0.75rem"><i class="${icon}"></i> ${typeText}</span>
                                    ${canUpload ? `<button onclick="Views.Materials.delete(${m.id})" style="background:none;border:none;color:var(--danger);font-size:1rem;cursor:pointer" title="Eliminar Recurso"><i class="fa-regular fa-trash-can"></i></button>` : ''}
                                </div>
                                <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-main); line-height:1.4">${m.title}</h3>
                                
                                <div style="flex:1">
                                    ${mediaPreview}
                                </div>
                                
                                <div style="margin-top:1.5rem;">
                                    ${!isYoutube ? 
                                    `<a href="${m.url}" target="_blank" class="btn btn-primary w-full shadow-sm flex justify-center" style="font-size:0.9rem">
                                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Material
                                    </a>` : 
                                    `<a href="${m.url}" target="_blank" class="btn btn-secondary w-full" style="font-size:0.9rem"><i class="fa-solid fa-external-link-alt"></i> Ver en YouTube</a>`}
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('router-view').innerHTML = html;
    },

    playYt(videoId, containerId) {
        document.getElementById(containerId).innerHTML = `
            <iframe width="100%" height="180" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        `;
    },

    openModal() {
        const user = Auth.getUser();
        let courses = DB.getTable('courses');

        if(user.role === 'teacher') courses = courses.filter(c => Number(c.teacherId) === Number(user.id));
        
        UI.openModal('Publicar Material', `
            <form id="form-material" onsubmit="Views.Materials.save(event)">
                <p class="text-muted mb-4" style="font-size:0.9rem">Soporta enlaces automáticos de YouTube y Google Drive.</p>
                
                <div class="form-group">
                    <label>Curso Destino *</label>
                    <select id="m-course" class="form-control" required style="background:#f9fafb">
                        ${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Título del Recurso *</label>
                    <input type="text" id="m-title" class="form-control" required placeholder="Ej: Clase 1: Present Simple">
                </div>
                <div class="form-group">
                    <label>URL (Enlace al archivo o video) *</label>
                    <input type="url" id="m-url" class="form-control" placeholder="https://youtube.com/... o https://drive.google.com/..." required>
                    <small style="color:var(--text-muted); margin-top:0.5rem; display:block;"><i class="fa-solid fa-circle-info text-info"></i> Pega aquí el enlace de YouTube para incrustar el video, o el enlace de compartición de Drive.</small>
                </div>
                
                <div class="form-group mt-4 pt-4" style="border-top:1px solid #eee">
                    <button type="submit" class="btn btn-primary w-full" style="padding:0.75rem;"><i class="fa-solid fa-cloud-arrow-up"></i> Publicar Material</button>
                </div>
            </form>
        `);
    },

    save(e) {
        e.preventDefault();
        UI.showLoader();
        DB.insert('materials', {
            courseId: parseInt(document.getElementById('m-course').value),
            title: document.getElementById('m-title').value,
            url: document.getElementById('m-url').value,
            type: 'link',
            addedBy: Auth.getUser().id
        });
        UI.closeModal();
        UI.showToast('Material publicado y clasificado con éxito.', 'success');
        this.render();
        UI.hideLoader();
    },

    delete(id) {
        if(confirm('¿Eliminar este material de forma permanente?')) {
            UI.showLoader();
            DB.remove('materials', id);
            UI.showToast('Material eliminado.', 'success');
            this.render();
            UI.hideLoader();
        }
    }
};
