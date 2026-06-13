// ============================================================
// WEST HOUSE — Gamification.js
// ============================================================

const Gamification = {
    XP_MAP: {
        ATTENDANCE: 10,
        EXAM_PASS: 30, // Score >= 6
        EXAM_EXCELLENT: 60, // Score >= 9
        LOGIN_DAILY: 5,
        STREAK_BONUS: 10,
        DAILY_QUIZ: 15
    },

    async awardXP(studentId, amount, reason = "") {
        const users = DB.getTable('users');
        const student = users.find(u => String(u.id) === String(studentId));
        
        if (!student) return;

        const oldLevel = student.level || 1;
        student.xp = (student.xp || 0) + amount;
        student.spendable_xp = (student.spendable_xp || 0) + amount;
        
        // Calculate new level: Level = floor(sqrt(XP/100)) + 1
        // Level 1: 0-99 XP
        // Level 2: 100-399 XP
        // Level 3: 400-899 XP
        const newLevel = Math.floor(Math.sqrt(student.xp / 100)) + 1;
        
        student.level = newLevel;

        await DB.update('users', studentId, { 
            xp: student.xp, 
            spendable_xp: student.spendable_xp,
            level: student.level 
        });

        if (newLevel > oldLevel) {
            UI.showToast(`¡Felicidades ${student.name}! Has subido al Nivel ${newLevel} 🚀`, 'success');
            this.checkBadges(student);
        }

        console.log(`[GAMIFICATION] ${student.name} +${amount} XP (${reason}). Total: ${student.xp}`);
    },

    async checkBadges(student) {
        // Logic to award badges
        let newBadges = [...(student.badges || [])];
        let earned = false;

        if (student.level >= 2 && !newBadges.includes('Scholar')) {
            newBadges.push('Scholar');
            earned = true;
        }
        if (student.level >= 5 && !newBadges.includes('Master')) {
            newBadges.push('Master');
            earned = true;
        }

        if (earned) {
            await DB.update('users', student.id, { badges: newBadges });
            UI.showToast(`¡Has ganado una nueva insignia! 🏆`, 'info');
        }
    },

    async checkDailyStreak(studentId) {
        const users = DB.getTable('users');
        const student = users.find(u => String(u.id) === String(studentId));
        if (!student) return;

        const today = new Date().toISOString().split('T')[0];
        const lastLogin = student.last_login;

        if (lastLogin === today) return; // Ya se conectó hoy

        let streak = student.streak || 0;

        if (lastLogin) {
            const lastDate = new Date(lastLogin);
            const todayDate = new Date(today);
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streak += 1;
            } else if (diffDays > 1) {
                streak = 1; // Perdió la racha
            }
        } else {
            streak = 1;
        }

        await DB.update('users', studentId, { 
            last_login: today, 
            streak: streak 
        });

        if (streak > 1 && streak % 7 === 0) {
            // Bono semanal
            await this.awardXP(studentId, this.XP_MAP.STREAK_BONUS * 5, "Bono Semanal de Racha");
            UI.showToast(`¡Increíble! Racha de ${streak} días. +${this.XP_MAP.STREAK_BONUS * 5} XP extra.`, 'success');
        } else {
            await this.awardXP(studentId, this.XP_MAP.LOGIN_DAILY, "Conexión Diaria");
            if (streak > 1) {
                UI.showToast(`¡Racha de ${streak} días! 🔥`, 'info');
            }
        }
    },

    async purchaseReward(studentId, rewardId) {
        const users = DB.getTable('users');
        const rewards = DB.getTable('rewards');
        
        const student = users.find(u => String(u.id) === String(studentId));
        const reward = rewards.find(r => String(r.id) === String(rewardId));

        if (!student || !reward) return false;

        const cost = reward.cost || 0;
        const currentSpendable = student.spendable_xp || 0;

        if (currentSpendable < cost) {
            UI.showToast("No tienes suficientes XP para canjear este premio.", "danger");
            return false;
        }

        // Deduce XP
        await DB.update('users', studentId, { spendable_xp: currentSpendable - cost });

        // Add to user_rewards
        const newId = Date.now().toString();
        await DB.insert('user_rewards', {
            id: newId,
            student_id: studentId,
            reward_id: rewardId,
            date: new Date().toISOString(),
            status: 'pending' // pending until admin approves
        });

        UI.showToast(`¡Has canjeado: ${reward.name}! 🎉`, 'success');
        return true;
    }
};
