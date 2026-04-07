const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db, all, run, get, hashPass } = require('./database');
const { sendInvoiceEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[LOGIN ATTEMPT] Email: ${email}`);
        
        const hashedPassword = hashPass(password);
        
        // Buscamos comparando el email en minúsculas (LOWER)
        const user = await get('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ?', [email, hashedPassword]);
        
        if (user) {
            console.log(`[LOGIN SUCCESS] User: ${user.name} (${user.role})`);
            const { password, ...safeUser } = user;
            res.json({ success: true, user: safeUser });
        } else {
            console.warn(`[LOGIN FAILED] Credentials mismatch for: ${email}`);
            res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
        }
    } catch (err) {
        console.error("[SERVER ERROR] Login:", err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// --- GENERIC CRUD ---

app.get('/api/:table', async (req, res) => {
    try {
        const { table } = req.params;
        const validTables = ['users', 'courses', 'attendance', 'payments', 'materials', 'notifications', 'events'];
        if (!validTables.includes(table)) return res.status(400).json({ error: 'Tabla no válida' });

        const rows = await all(`SELECT * FROM ${table}`);
        res.json(rows);
    } catch (err) {
        console.error(`Error GET /api/${req.params.table}:`, err);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

app.post('/api/:table', async (req, res) => {
    try {
        const { table } = req.params;
        const validTables = ['users', 'courses', 'attendance', 'payments', 'materials', 'notifications', 'events'];
        if (!validTables.includes(table)) return res.status(400).json({ error: 'Tabla no válida' });

        const data = req.body;
        // Si la tabla es users y viene con password, lo hasheamos
        if (table === 'users' && data.password && data.password.length < 60) {
            data.password = hashPass(data.password);
        }

        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        
        const result = await run(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`, values);
        res.status(201).json({ id: result.lastID, ...data });
    } catch (err) {
        console.error(`Error POST /api/${req.params.table}:`, err);
        res.status(500).json({ error: 'Error al insertar registro' });
    }
});

app.put('/api/:table/:id', async (req, res) => {
    try {
        const { table, id } = req.params;
        const data = req.body;
        let updates = [];
        let values = [];

        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id') {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        values.push(id);
        const query = `UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`;
        await run(query, values);
        res.json({ id: Number(id), ...data });
    } catch (err) {
        console.error(`Error PUT /api/${req.params.table}/${req.params.id}:`, err);
        res.status(500).json({ error: 'Error al actualizar registro' });
    }
});

app.delete('/api/:table/:id', async (req, res) => {
    try {
        const { table, id } = req.params;
        await run(`DELETE FROM ${table} WHERE id = ?`, [id]);
        res.json({ success: true, id: Number(id) });
    } catch (err) {
        console.error(`Error DELETE /api/${req.params.table}/${req.params.id}:`, err);
        res.status(500).json({ error: 'Error al eliminar registro' });
    }
});

// --- INVOICES (EMAIL) ---
app.post('/api/payments/invoice/:id', async (req, res) => {
    try {
        const paymentId = req.params.id;
        const payment = await get('SELECT * FROM payments WHERE id = ?', [paymentId]);
        if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });

        const student = await get('SELECT * FROM users WHERE id = ?', [payment.studentId]);
        if (!student) return res.status(404).json({ error: 'Estudiante no encontrado' });

        const emailInfo = await sendInvoiceEmail(
            student.name, 
            student.parentEmail || student.email, 
            payment.amount, 
            payment.date,
            payment.id
        );

        res.json({ success: true, message: 'Factura enviada correctamente', data: emailInfo });
    } catch (err) {
        console.error("Error enviando factura:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
