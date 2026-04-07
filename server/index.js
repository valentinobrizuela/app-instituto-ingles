const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db, all, run, get, hashPass } = require('./database');
const { sendInvoiceEmail } = require('./emailService');

const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'westhouse-super-secret-key-2026';

app.use(cors());
app.use(express.json());

// Setup Uploads Directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// JWT Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.status(401).json({ error: 'Token requerido' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
        req.user = user;
        next();
    });
}

// Log Helper
async function logAction(userId, action, details) {
    try {
        await run('INSERT INTO logs (userId, action, details, timestamp) VALUES (?, ?, ?, ?)', [userId, action, details, new Date().toISOString()]);
    } catch (e) {
        console.error('Log Error:', e);
    }
}

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
            const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: '24h' });
            res.json({ success: true, user: safeUser, token });
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

app.get('/api/:table', authenticateToken, async (req, res) => {
    try {
        const { table } = req.params;
        const validTables = ['users', 'courses', 'attendance', 'payments', 'materials', 'notifications', 'events', 'grades', 'logs'];
        if (!validTables.includes(table)) return res.status(400).json({ error: 'Tabla no válida' });

        const rows = await all(`SELECT * FROM ${table}`);
        res.json(rows);
    } catch (err) {
        console.error(`Error GET /api/${req.params.table}:`, err);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

app.post('/api/:table', authenticateToken, async (req, res) => {
    try {
        const { table } = req.params;
        const validTables = ['users', 'courses', 'attendance', 'payments', 'materials', 'notifications', 'events', 'grades', 'logs'];
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
        if (req.user) logAction(req.user.id, 'CREATE', `Created record in ${table} with id ${result.lastID}`);
        res.status(201).json({ id: result.lastID, ...data });
    } catch (err) {
        console.error(`Error POST /api/${req.params.table}:`, err);
        res.status(500).json({ error: 'Error al insertar registro' });
    }
});

app.put('/api/:table/:id', authenticateToken, async (req, res) => {
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
        if (req.user) logAction(req.user.id, 'UPDATE', `Updated record in ${table} with id ${id}`);
        res.json({ id: Number(id), ...data });
    } catch (err) {
        console.error(`Error PUT /api/${req.params.table}/${req.params.id}:`, err);
        res.status(500).json({ error: 'Error al actualizar registro' });
    }
});

app.delete('/api/:table/:id', authenticateToken, async (req, res) => {
    try {
        const { table, id } = req.params;
        await run(`DELETE FROM ${table} WHERE id = ?`, [id]);
        if (req.user) logAction(req.user.id, 'DELETE', `Deleted record from ${table} with id ${id}`);
        res.json({ success: true, id: Number(id) });
    } catch (err) {
        console.error(`Error DELETE /api/${req.params.table}/${req.params.id}:`, err);
        res.status(500).json({ error: 'Error al eliminar registro' });
    }
});

// --- INVOICES (EMAIL) ---
app.post('/api/payments/invoice/:id', authenticateToken, async (req, res) => {
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

// --- FILE UPLOAD ---
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    if (req.user) logAction(req.user.id, 'UPLOAD', `Uploaded file ${req.file.filename}`);
    res.json({ success: true, url: fileUrl, filename: req.file.originalname });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
