/**
 * MilaAI - El motor de inteligencia de West House
 * Capaz de responder dudas generales y personalizadas.
 */
const MilaAI = {
    // Conocimiento estático institucional
    knowledgeBase: {
        horarios: "Abrimos de Lunes a Viernes de 14:00 a 21:00 hs. ¡Te esperamos!",
        ubicación: "Estamos ubicados en el corazón del barrio, listos para recibirte. (Puedes consultar la dirección exacta en Secretaría)",
        pagos: "Las cuotas se abonan del 1 al 10 de cada mes. Puedes hacerlo por transferencia o en Secretaría.",
        eco_banco: "¡El Eco-Banco es un proyecto increíble! Lo construimos con botellas recicladas (eco-ladrillos) para cuidar el planeta mientras aprendemos. 🌿",
        vision: "Nuestra visión es: 'Learning English, Protecting our Future'. Combinamos idiomas con conciencia ambiental.",
        director: "Nuestra directora es Maricel. Siempre está atenta a lo que necesites.",
        secretaria: "Morena es nuestra secretaria y te puede ayudar con temas administrativos."
    },

    // Generar respuesta basada en el mensaje del usuario
    async getResponse(message) {
        const msg = message.toLowerCase();
        const user = Auth.getUser();

        // 1. Intentos de Consultas Personalizadas (requieren Login)
        if (user) {
            // Consulta de Horarios / Clases
            if (msg.includes("clase") || msg.includes("horario") || msg.includes("cuando tengo") || msg.includes("qué día")) {
                const course = DB.getTable('courses').find(c => String(c.id) === String(user.course_id));
                if (course) {
                    return `Estás en el curso **${course.name}**. Tus horarios registrados son: **${course.schedule || 'A confirmar'}**. ¡No faltes! 🎒`;
                }
                return "Aún no tienes un curso asignado. Consulta en Secretaría para que te inscribamos. 🐾";
            }

            // Consulta de Notas
            if (msg.includes("nota") || msg.includes("calificación") || msg.includes("examen") || msg.includes("cómo voy")) {
                const grades = DB.getTable('grades').filter(g => String(g.studentId) === String(user.id));
                if (grades.length > 0) {
                    const avg = (grades.reduce((sum, g) => sum + Number(g.score), 0) / grades.length).toFixed(1);
                    return `He revisado tus notas. Tienes ${grades.length} calificaciones registradas y tu promedio actual es **${avg}**. ¡Buen trabajo! 🌟`;
                }
                return "Todavía no tengo notas registradas para ti. ¡Sigue esforzándote! 📝";
            }

            // Consulta de Pagos
            if (msg.includes("pago") || msg.includes("cuota") || msg.includes("debo") || msg.includes("deuda")) {
                const status = DB.getStudentStatus(user.id);
                if (status === 'paid') return "¡Estás al día con tus pagos! Mila está muy orgullosa. ¡Miau! 🐈";
                if (status === 'pending') return "Tu cuota de este mes está pendiente, pero todavía estás a tiempo de pagar sin recargo (hasta el 10). 💸";
                return "He notado que tienes una cuota vencida. Por favor, comunícate con Morena en Secretaría para regularizarla. 🐾";
            }

            // Consulta de Asistencia
            if (msg.includes("falta") || msg.includes("asistencia") || msg.includes("cuantas veces falte")) {
                const attendance = DB.getTable('attendance').filter(a => String(a.student_id) === String(user.id));
                const absences = attendance.filter(a => a.status === 'Ausente').length;
                if (absences === 0) return "¡Tienes asistencia perfecta! Mila te da una medalla virtual. 🥇";
                return `Tienes **${absences}** inasistencias registradas. Recuerda que es importante venir para no perder el hilo de las clases. 🐾`;
            }
        }

        // 2. Intentos de Información General
        if (msg.includes("hola") || msg.includes("buen") || msg.includes("hey")) {
            const greeting = user ? `¡Hola de nuevo, ${user.name.split(' ')[0]}!` : "¡Hola! Soy Mila.";
            return `${greeting} Estoy aquí para ayudarte con lo que necesites sobre West House. ¿En qué puedo ayudarte hoy? 🐾`;
        }

        if (msg.includes("hora") || msg.includes("abren") || msg.includes("cerrado")) return this.knowledgeBase.horarios;
        if (msg.includes("donde") || msg.includes("ubicacion") || msg.includes("direccion")) return this.knowledgeBase.ubicación;
        if (msg.includes("eco") || msg.includes("banco") || msg.includes("recicl")) return this.knowledgeBase.eco_banco;
        if (msg.includes("quienes somos") || msg.includes("historia") || msg.includes("vision")) return this.knowledgeBase.vision;
        
        // 3. Delegación
        if (msg.includes("hablar") || msg.includes("persona") || msg.includes("humano") || msg.includes("director") || msg.includes("secretaria") || msg.includes("ayuda")) {
            return `Si necesitas hablar con alguien, puedo conectarte ahora mismo:
            
            • [Hablar con Maricel (Directora)](https://wa.me/5493804135270?text=Hola%20Maricel,%20Mila%20me%20sugirió%20contactarte.)
            • [Hablar con Morena (Secretaría)](https://wa.me/5491176086865?text=Hola%20Morena,%20Mila%20me%20sugirió%20contactarte.)
            
            ¿Hay algo más en lo que yo pueda ayudarte directamente? 🐈`;
        }

        // 4. Respuesta por defecto
        return "Miau... no estoy segura de entender eso. ¿Puedes preguntarme sobre tus clases, notas, pagos o sobre el instituto? O si prefieres, pídeme hablar con una persona. 🐾";
    }
};
