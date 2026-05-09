// ============================================================
// WEST HOUSE — Gamification.js
// ============================================================

const Gamification = {
    XP_MAP: {
        ATTENDANCE: 10,
        EXAM_PASS: 30, // Score >= 6
        EXAM_EXCELLENT: 60, // Score >= 9
        LOGIN_DAILY: 5
    },

    async awardXP(studentId, amount, reason = "") {
        const users = DB.getTable('users');
        const student = users.find(u => String(u.id) === String(studentId));
        
        if (!student) return;

        const oldLevel = student.level || 1;
        student.xp = (student.xp || 0) + amount;
        
        // Calculate new level: Level = floor(sqrt(XP/100)) + 1
        // Level 1: 0-99 XP
        // Level 2: 100-399 XP
        // Level 3: 400-899 XP
        const newLevel = Math.floor(Math.sqrt(student.xp / 100)) + 1;
        
        student.level = newLevel;

        await DB.update('users', studentId, { 
            xp: student.xp, 
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
    }
};
