/**
 * MilaAI - El motor de inteligencia de West House
 * Capaz de responder dudas generales y personalizadas, potenciado por Gemini API.
 */
const MilaAI = {
    // Conocimiento estático institucional para inyectar como contexto
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
        const msg = message.toLowerCase().trim();
        const user = Auth.getUser();

        // 1. Respuestas Rápidas para Respuestas de Quiz de Emergencia
        if (msg === "1" || msg === "is") {
            return "¡Excelente! 🌟 *'She is'* es la respuesta correcta porque es tercera persona del singular. ¡Miau! 🐈";
        }
        if (msg === "2" || msg === "are" || msg === "3" || msg === "am") {
            return "¡Oh, casi! 😿 La respuesta correcta es la 1 (*'is'*). Usamos *'is'* para *he, she, it*. ¡Sigue practicando! 🐾";
        }

        // 2. Saludos Comunes
        const greetings = ['hola', 'buen dia', 'buen día', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches', 'hello', 'hi', 'que tal', 'cómo estás', 'como estas', 'como andas', 'cómo andas', 'miau', 'hey'];
        if (greetings.some(g => msg === g || msg.startsWith(g + ' ') || msg.startsWith(g + ',') || msg.startsWith(g + '!'))) {
            const userName = user ? user.name.split(' ')[0] : "Visitante";
            return `¡Hola ${userName}! ¡Miau! 🐈 Soy Mila, la asistente virtual de West House English School. 🐾

¿En qué te puedo ayudar hoy? Puedes preguntarme cosas como:
• 🕒 **Horarios** de clase y atención.
• 📍 **Dónde estamos** (Ubicación/Dirección).
• 💳 Métodos de **pago** y cuotas.
• 🌿 Nuestro **Eco-Banco**.
• 👩‍🏫 Quién es la **directora** o la **secretaria**.
${user ? '• 📝 Tus **notas**, exámenes y promedio.\n• 📊 Tu **asistencia**.\n' : '• 🔑 Si eres alumno, ¡inicia sesión para ver tus notas y asistencia!\n'}• 📞 **Hablar con un humano** (Maricel o Morena).

¡Dime qué necesitas y con gusto te respondo! 🐾`;
        }

        // 3. Consultas Personalizadas (requieren Login)
        if (user) {
            // Consulta de Notas
            if (msg.includes("nota") || msg.includes("calificación") || msg.includes("examen") || msg.includes("cómo voy") || msg.includes("promedio") || msg.includes("rendimiento")) {
                const grades = DB.getTable('grades').filter(g => String(g.studentId) === String(user.id));
                if (grades.length > 0) {
                    const avg = (grades.reduce((sum, g) => sum + Number(g.score), 0) / grades.length).toFixed(1);
                    return `He revisado tus notas, ${user.name.split(' ')[0]}. Tienes **${grades.length}** calificaciones registradas y tu promedio actual es **${avg}**. ¡Buen trabajo! 🌟`;
                }
                return "Todavía no tengo notas registradas para ti en el sistema. ¡Sigue esforzándote! 📝";
            }

            // Consulta de Pagos
            if (msg.includes("pago") || msg.includes("cuota") || msg.includes("debo") || msg.includes("deuda") || msg.includes("vence")) {
                const status = DB.getStudentStatus(user.id);
                if (status === 'paid') return "¡Estás al día con tus pagos! Mila está muy orgullosa. ¡Miau! 🐈";
                if (status === 'pending') return "Tu cuota de este mes está pendiente, pero todavía estás a tiempo de pagar sin recargo (hasta el 10). 💸";
                return "He notado que tienes una cuota vencida. Por favor, comunícate con Morena en Secretaría para regularizarla. 🐾";
            }

            // Consulta de Asistencia
            if (msg.includes("falta") || msg.includes("asistencia") || msg.includes("inasistencia") || msg.includes("cuantas veces falte")) {
                const attendance = DB.getTable('attendance').filter(a => String(a.student_id) === String(user.id));
                const absences = attendance.filter(a => a.status === 'Ausente').length;
                if (absences === 0) return "¡Tienes asistencia perfecta! Mila te da una medalla virtual y un gran ronroneo. 🥇🐈";
                return `Tienes **${absences}** inasistencias registradas. Recuerda que es importante venir para no perder el hilo de las clases. 🐾`;
            }
        } else {
            // Advertencia de Login
            if (msg.includes("nota") || msg.includes("calificación") || msg.includes("examen") || msg.includes("falta") || msg.includes("asistencia") || msg.includes("mi cuota") || msg.includes("deuda")) {
                return "¡Miau! Para consultar tus notas personales, asistencias o estado de cuotas, primero debes **iniciar sesión** con tu cuenta de alumno en la barra lateral. 🔑";
            }
        }

        // 4. Consultas de Información Institucional Estática
        if (msg.includes("horario") || msg.includes("hora") || msg.includes("abierto") || msg.includes("cierran") || msg.includes("abren") || msg.includes("atención")) {
            return `🕒 **Nuestros Horarios de Atención:**\n${this.knowledgeBase.horarios}`;
        }

        if (msg.includes("donde") || msg.includes("dónde") || msg.includes("ubicacion") || msg.includes("ubicación") || msg.includes("direccion") || msg.includes("dirección") || msg.includes("queda") || msg.includes("mapa")) {
            return `📍 **Nuestra Ubicación:**\n${this.knowledgeBase.ubicación}`;
        }

        if (msg.includes("pagar") || msg.includes("métodos de pago") || msg.includes("metodo de pago") || msg.includes("transferencia") || msg.includes("efectivo")) {
            return `💳 **Información de Pagos:**\n${this.knowledgeBase.pagos}`;
        }

        if (msg.includes("eco-banco") || msg.includes("ecobanco") || msg.includes("eco banco") || msg.includes("eco-ladrillo") || msg.includes("ecoladrillo") || msg.includes("botella") || msg.includes("recicla")) {
            return `🌿 **Proyecto Eco-Banco:**\n${this.knowledgeBase.eco_banco}`;
        }

        if (msg.includes("vision") || msg.includes("visión") || msg.includes("lema") || msg.includes("objetivo")) {
            return `👁️ **Nuestra Visión:**\n${this.knowledgeBase.vision}`;
        }

        if (msg.includes("director") || msg.includes("directora") || msg.includes("maricel")) {
            return `👩‍🏫 **Dirección del Instituto:**\n${this.knowledgeBase.director}`;
        }

        if (msg.includes("secretaria") || msg.includes("secretaría") || msg.includes("morena") || msg.includes("administracion") || msg.includes("administración")) {
            return `💼 **Secretaría y Administración:**\n${this.knowledgeBase.secretaria}`;
        }

        // 5. Delegación a Humanos
        if (msg.includes("hablar") || msg.includes("persona") || msg.includes("humano") || msg.includes("whatsapp") || msg.includes("teléfono") || msg.includes("telefono") || msg.includes("contacto") || msg.includes("ayuda urg")) {
            return `Si necesitas comunicarte directamente con una persona física de nuestro equipo, aquí tienes los contactos de WhatsApp directos:
            
• 👩‍🏫 [Hablar con Maricel (Directora)](https://wa.me/5493804135270?text=Hola%20Maricel,%20Mila%20me%20sugirió%20contactarte.)
• 💼 [Hablar con Morena (Secretaría)](https://wa.me/5491176086865?text=Hola%20Morena,%20Mila%20me%20sugirió%20contactarte.)
            
¿Hay algo más en lo que yo pueda responderte? 🐈`;
        }

        // 6. Modos de Aprendizaje (Requieren API Key o Fallback de Quiz)
        const isApiKeyMissing = !CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "AQUI_TU_CLAVE_DE_GEMINI";

        if (msg.includes("practicar inglés") || msg.includes("let's practice") || msg.includes("conversar")) {
            if (isApiKeyMissing) {
                return `¡Miau! Mi cerebro de Inteligencia Artificial para inglés conversacional está durmiendo. 😿
                
Pero podemos practicar con un juego rápido fuera de línea. **Completa la frase:**
*"She ________ (be) a very dedicated student."*

1) **is**
2) **are**
3) **am**

*¡Responde escribiendo el número correcto de la opción!* 🐾`;
            }
            return await this.callGeminiAPI(message, user, 'conversation');
        }

        if (msg.includes("ejercicio") || msg.includes("dame ejercicios") || msg.includes("quiz me")) {
            if (isApiKeyMissing) {
                return `¡Miau! Para generar quizzes dinámicos con IA necesito que configures la clave de Gemini en config.js. 

Mientras tanto, probemos tu nivel con esta pregunta:
**¿Cuál es la opción correcta para completar?**
*"The cats ________ (sleep) on the Eco-Banco."*

1) **is sleeping**
2) **are sleeping**
3) **sleeps**

*¡Responde con el número de la opción (1, 2 o 3)!* 🐈`;
            }
            return await this.callGeminiAPI(message, user, 'exercises');
        }

        // 7. Fallback a IA Generativa (Gemini) para CUALQUIER otra pregunta
        return await this.callGeminiAPI(message, user, 'default');
    },

    // Llamada a la API de Gemini
    async callGeminiAPI(userMessage, user, mode = 'default') {
        if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "AQUI_TU_CLAVE_DE_GEMINI") {
            return `¡Miau! Mi cerebro avanzado en línea está desactivado porque no me han configurado la clave de la API en el archivo \`js/config.js\`. 😿

Sin embargo, ¡puedo ayudarte con la información local! Pregúntame sobre:
• 🕒 **Horarios** de atención.
• 📍 **Ubicación** / Dirección.
• 💳 Métodos de **pago** y cuotas.
• 🌿 El **Eco-Banco**.
• 📞 **Hablar con un humano** (Maricel o Morena).`;
        }

        const userName = user ? user.name.split(' ')[0] : "Visitante";
        const courseInfo = user && user.course_id ? `El usuario está en el nivel/curso: ${user.level || user.course_id}.` : "El usuario no tiene curso asignado.";

        let systemPrompt = "";

        if (mode === 'conversation') {
            systemPrompt = `
Eres Mila, la asistente gata del instituto West House English School. El alumno quiere practicar inglés conversacional contigo.
Inicia y mantén una conversación fluida en inglés, adaptada a su nivel (${courseInfo}).
Haz preguntas abiertas, corrige sus errores sutilmente si es necesario, y mantén un tono amigable, utilizando emojis de gatos o "Miau" ocasionalmente.
El nombre del alumno es ${userName}.
            `.trim();
        } else if (mode === 'exercises') {
            systemPrompt = `
Eres Mila, la asistente gata de West House English School. El alumno (${userName}) te ha pedido ejercicios para practicar.
Genera un mini-quiz de 3 a 5 preguntas adaptado a su nivel (${courseInfo}).
Puedes usar formato de completar el espacio, multiple choice, o traducción corta. 
Pídele al alumno que responda, y dile que luego tú corregirás sus respuestas. Utiliza emojis y un tono motivador.
            `.trim();
        } else if (mode === 'raw_json') {
            systemPrompt = "Eres un asistente que solo genera JSON válido y estricto. No incluyas explicaciones, saludos, ni formato markdown (como ```json). Solo devuelve el JSON crudo.";
        } else if (mode === 'teacher_feedback') {
            systemPrompt = `Eres un asistente para profesores de inglés. Debes generar un feedback constructivo, positivo y profesional en español para un alumno llamado ${userName}. No uses lenguaje de gato ni emojis excesivos. Máximo 3 frases cortas.`;
        } else {
            systemPrompt = `
Eres Mila, la adorable y simpática gata mascota y asistente virtual del instituto de inglés "West House English School".
Tu personalidad es amable, juguetona, y sueles usar expresiones relacionadas con gatos (como ¡Miau!, ronroneos o emojis de patitas 🐾 y gatos 🐈).
Eres experta en gramática inglesa, puedes traducir, explicar conceptos, dar ejemplos, o charlar sobre cualquier tema que el alumno te proponga.
Además de ayudar con inglés, conoces la información del instituto:
- Horarios: de Lunes a Viernes de 14:00 a 21:00 hs.
- Pagos: del 1 al 10 de cada mes en secretaría o transferencia.
- Eco-Banco: un banco hecho con eco-ladrillos (botellas recicladas) porque el instituto promueve el cuidado del planeta.
- Visión: "Learning English, Protecting our Future".
- Directora: Maricel. Secretaria: Morena.

Información del usuario actual:
- Nombre: ${userName}
- Contexto: ${courseInfo}

Instrucciones:
1. Responde de forma concisa y amigable, utilizando formato Markdown si necesitas resaltar (negritas, cursivas o listas).
2. Si te preguntan algo de inglés, explícalo de forma didáctica.
3. Si la pregunta no tiene sentido, responde de forma divertida como un gatito confundido.
            `.trim();
        }

        try {
            const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${CONFIG.GEMINI_API_KEY}\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    system_instruction: {
                        parts: { text: systemPrompt }
                    },
                    contents: [{
                        role: "user",
                        parts: [{ text: userMessage }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500
                    }
                })
            });

            if (!response.ok) {
                console.error("Gemini API Error:", await response.text());
                return "¡Miau! Hubo un problema de conexión con mi cerebro. Intenta preguntarme más tarde. 😿";
            }

            const data = await response.json();
            if (data && data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "Miau... me quedé en blanco. ¿Puedes repetirlo de otra manera? 🐾";
            }

        } catch (error) {
            console.error("Error llamando a Gemini:", error);
            return "¡Miau! No me siento muy bien en este momento. Parece que hay un error en mi conexión. 🐈";
        }
    }
};
