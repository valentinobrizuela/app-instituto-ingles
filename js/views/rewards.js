window.Views = window.Views || {};

Views.Rewards = {
    render() {
        const user = Auth.getUser();
        UI.setSectionTitle('West House Store', 'fa-solid fa-store');
        UI.renderBreadcrumbs();

        const container = document.getElementById('router-view');
        
        // Seed default rewards if empty
        let rewards = DB.getTable('rewards');
        if (rewards.length === 0) {
            rewards = [
                { id: '1', name: 'Sticker Exclusivo', description: 'Un sticker holográfico oficial de West House.', cost: 500, icon: 'fa-solid fa-note-sticky', color: '#ec4899' },
                { id: '2', name: 'DJ por 5 minutos', description: 'Elige las canciones al final de tu próxima clase.', cost: 1000, icon: 'fa-solid fa-music', color: '#8b5cf6' },
                { id: '3', name: 'Ayudante de Mila', description: 'Gana un título especial en tu perfil y en clase.', cost: 2500, icon: 'fa-solid fa-paw', color: '#f59e0b' },
                { id: '4', name: 'Snack Sorpresa', description: 'Canjea esto por un snack especial en administración.', cost: 3000, icon: 'fa-solid fa-cookie', color: '#10b981' }
            ];
            DB.saveTable('rewards', rewards);
        }

        const userRewards = DB.getTable('user_rewards').filter(ur => String(ur.student_id) === String(user.id));

        container.innerHTML = `
            <div class="header-section mb-5">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem">
                    <div>
                        <h1 class="hero-title" style="color:var(--text-main); margin-bottom: 0.5rem">Tienda de Recompensas</h1>
                        <p class="text-muted">Gasta tus XP ganados en premios increíbles.</p>
                    </div>
                    <div class="card" style="margin:0; padding:1rem 1.5rem; display:flex; align-items:center; gap:1rem; border:2px solid var(--primary); background:var(--primary-light)">
                        <div style="background:var(--primary); color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.25rem">
                            <i class="fa-solid fa-coins"></i>
                        </div>
                        <div>
                            <div class="text-sm text-primary font-bold uppercase" style="letter-spacing:1px">Tus Monedas</div>
                            <div style="font-size:1.75rem; font-weight:800; color:var(--text-main); line-height:1" id="spendable-xp-display">
                                ${user.spendable_xp || 0} <span style="font-size:1rem">XP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom:3rem">
                ${rewards.map(r => `
                    <div class="card" style="display:flex; flex-direction:column; padding:1.5rem; border-top:4px solid ${r.color || 'var(--primary)'}">
                        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem">
                            <div style="width:50px; height:50px; border-radius:12px; background:${r.color}22; color:${r.color}; display:flex; align-items:center; justify-content:center; font-size:1.5rem">
                                <i class="${r.icon || 'fa-solid fa-gift'}"></i>
                            </div>
                            <div class="badge" style="background:var(--bg-hover); color:var(--text-main); font-weight:700; font-size:1rem; border:1px solid var(--border-color)">
                                ${r.cost} XP
                            </div>
                        </div>
                        <h3 style="font-size:1.2rem; margin-bottom:0.5rem">${r.name}</h3>
                        <p class="text-muted text-sm" style="margin-bottom:1.5rem; flex:1">${r.description}</p>
                        
                        <button class="btn btn-primary w-full" style="background:${r.color}; border-color:${r.color}" onclick="Views.Rewards.confirmPurchase('${r.id}')" ${(user.spendable_xp || 0) < r.cost ? 'disabled opacity="0.5"' : ''}>
                            <i class="fa-solid fa-cart-shopping"></i> Canjear
                        </button>
                    </div>
                `).join('')}
            </div>

            <div class="card">
                <h3 class="mb-4"><i class="fa-solid fa-box-open text-primary"></i> Tu Inventario</h3>
                ${userRewards.length > 0 ? `
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                        ${userRewards.map(ur => {
                            const item = rewards.find(r => String(r.id) === String(ur.reward_id));
                            if (!item) return '';
                            return `
                                <div style="padding:1rem; border:1px dashed var(--border-color); border-radius:10px; display:flex; align-items:center; gap:1rem">
                                    <div style="color:${item.color}; font-size:1.5rem"><i class="${item.icon}"></i></div>
                                    <div>
                                        <div style="font-weight:700; font-size:0.9rem">${item.name}</div>
                                        <div class="text-xs text-muted">${new Date(ur.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<p class="text-muted">Aún no has canjeado ningún premio. ¡Ahorra tus XP!</p>'}
            </div>
        `;
    },

    confirmPurchase(rewardId) {
        const rewards = DB.getTable('rewards');
        const reward = rewards.find(r => String(r.id) === String(rewardId));
        if (!reward) return;

        UI.openModal('Confirmar Canje', `
            <div style="text-align:center; padding:1rem">
                <div style="width:80px; height:80px; border-radius:50%; background:${reward.color}22; color:${reward.color}; display:flex; align-items:center; justify-content:center; font-size:2.5rem; margin:0 auto 1.5rem">
                    <i class="${reward.icon}"></i>
                </div>
                <h3 style="margin-bottom:0.5rem">¿Canjear ${reward.name}?</h3>
                <p class="text-muted mb-4">Esto consumirá <strong>${reward.cost} XP</strong> de tu saldo gastable.</p>
                <div style="display:flex; gap:1rem; justify-content:center">
                    <button class="btn btn-secondary" onclick="UI.closeModal()">Cancelar</button>
                    <button class="btn btn-primary" style="background:${reward.color}; border-color:${reward.color}" onclick="Views.Rewards.executePurchase('${rewardId}')">Sí, Canjear</button>
                </div>
            </div>
        `);
    },

    async executePurchase(rewardId) {
        UI.closeModal();
        const user = Auth.getUser();
        const success = await Gamification.purchaseReward(user.id, rewardId);
        
        if (success) {
            // Update auth user local reference so the UI updates properly
            const users = DB.getTable('users');
            const updatedUser = users.find(u => String(u.id) === String(user.id));
            localStorage.setItem('westhouse_user', JSON.stringify(updatedUser));
            
            // Mila interaction
            if (UI.Mila && UI.Mila.speak) {
                 UI.Mila.speak("¡Guau! Acabas de canjear un premio genial. ¡Sigue así! 🐾");
            }
            
            this.render(); // re-render
        }
    }
};
