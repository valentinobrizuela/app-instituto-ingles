const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'westhouse.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            initTables();
        });
    }
});

function hashPass(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function initTables() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        age INTEGER,
        level TEXT,
        courseId INTEGER,
        teacherId INTEGER,
        parentEmail TEXT,
        parentPhone TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        level TEXT,
        teacherId INTEGER,
        schedule TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER,
        studentId INTEGER,
        date TEXT,
        status TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER,
        amount REAL,
        date TEXT,
        status TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER,
        title TEXT,
        type TEXT,
        url TEXT,
        addedBy INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senderId INTEGER,
        targetRole TEXT,
        message TEXT,
        date TEXT,
        readBy TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        start TEXT,
        end TEXT,
        type TEXT,
        courseId INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER,
        courseId INTEGER,
        term TEXT,
        score REAL,
        date TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        action TEXT,
        details TEXT,
        timestamp TEXT
    )`, () => {
        checkAndSeed();
    });
}

function checkAndSeed() {
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        // Aumentamos el umbral a 110 (100 alumnos, 8 profes, 2 admins)
        if (!err && (!row || row.count < 110)) {
            console.log("⚠️ Datos incompletos o antiguos (conteo: " + (row ? row.count : 0) + "). Regenerando base de datos completa...");
            seedDatabase();
        } else {
            console.log('✅ Base de datos verificada y lista.');
        }
    });
}

async function seedDatabase() {
    console.log('--- GENERATING DEMO DATA (100 STUDENTS) ---');

    try {
        // 1. Clear existing data to avoid PK conflicts during seed (optional but safer for "Reset" feel)
        await run('DELETE FROM users');
        await run('DELETE FROM courses');
        await run('DELETE FROM payments');
        await run('DELETE FROM sqlite_sequence WHERE name IN ("users", "courses", "payments", "grades", "logs")');

        // 2. Insert Admins
        const admins = [
            ['Morena Brizuela', 'morebrizuela26@gmail.com', hashPass('morewesthouse'), 'admin'],
            ['Admin Prueba', 'admin@westhouse.com', hashPass('admin123'), 'admin']
        ];
        for (const u of admins) {
            await run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', u);
        }

        // 3. Insert Teachers (8)
        const teachers = [
            ['John Doe', 'john@teacher.com', 'teacher123'],
            ['Mary Smith', 'mary@teacher.com', 'teacher123'],
            ['Alan Turing', 'alan@teacher.com', 'teacher123'],
            ['Ada Lovelace', 'ada@teacher.com', 'teacher123'],
            ['Nikola Tesla', 'nikola@teacher.com', 'teacher123'],
            ['Marie Curie', 'marie@teacher.com', 'teacher123'],
            ['Isaac Newton', 'isaac@teacher.com', 'teacher123'],
            ['Grace Hopper', 'grace@teacher.com', 'teacher123']
        ];
        let teacherIds = [];
        for (const t of teachers) {
            const res = await run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [t[0], t[1], hashPass(t[2]), 'teacher']);
            teacherIds.push(res.lastID);
        }

        // 4. Insert Courses (8)
        const courses = [
            ['Inglés Beginner A', 'Beginner', teacherIds[0], 'Lun-Mié 18:00'],
            ['Inglés Beginner B', 'Beginner', teacherIds[1], 'Mar-Jue 17:00'],
            ['Inglés Intermediate A', 'Intermediate', teacherIds[2], 'Lun-Mié 19:00'],
            ['Inglés Intermediate B', 'Intermediate', teacherIds[3], 'Mar-Jue 18:00'],
            ['Inglés Advanced A', 'Advanced', teacherIds[4], 'Lun-Mié 20:00'],
            ['Inglés Advanced B', 'Advanced', teacherIds[5], 'Mar-Jue 19:00'],
            ['Conversación Pro', 'Advanced', teacherIds[6], 'Vie 18:00'],
            ['Kids English', 'Beginner', teacherIds[7], 'Vie 17:00']
        ];
        let courseIds = [];
        for (const c of courses) {
            const res = await run('INSERT INTO courses (name, level, teacherId, schedule) VALUES (?, ?, ?, ?)', c);
            courseIds.push(res.lastID);
        }

        // 5. Insert 100 Students
        const firstNames = ["Sofia", "Mateo", "Valentina", "Santiago", "Camila", "Matías", "Valeria", "Sebastián", "Emma", "Nicolás", "Lucía", "Alejandro", "Martina", "Diego", "Catalina", "Lucas", "Isabella", "Joaquín", "Mía", "Tomás"];
        const lastNames = ["García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz", "Álvarez", "Romero", "Alonso", "Gutiérrez"];
        
        const today = new Date().toISOString().split('T')[0];

        for (let i = 1; i <= 100; i++) {
            const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
            const email = `student${i}@westhouse.com`;
            const courseIdx = i % courseIds.length;
            const courseId = courseIds[courseIdx];
            const teacherId = teacherIds[courseIdx];
            const level = courses[courseIdx][1];

            const res = await run(
                'INSERT INTO users (name, email, password, role, age, level, courseId, teacherId, parentEmail, parentPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, email, hashPass('student123'), 'student', 10 + (i % 10), level, courseId, teacherId, `parent${i}@example.com`, `+54 9 11 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`]
            );

            const studentId = res.lastID;
            // Add a payment
            const status = i % 5 === 0 ? 'Pendiente' : 'Pagado';
            await run('INSERT INTO payments (studentId, amount, date, status) VALUES (?, ?, ?, ?)', [studentId, 50.00, today, status]);

            // Add grades
            const score1 = (Math.random() * 4 + 6).toFixed(1); // Grade between 6.0 and 10.0
            const score2 = (Math.random() * 4 + 6).toFixed(1);
            await run('INSERT INTO grades (studentId, courseId, term, score, date) VALUES (?, ?, ?, ?, ?)', [studentId, courseId, 'Trimestre 1', parseFloat(score1), today]);
            await run('INSERT INTO grades (studentId, courseId, term, score, date) VALUES (?, ?, ?, ?, ?)', [studentId, courseId, 'Trimestre 2', parseFloat(score2), today]);
        }

        console.log('✅ Base de Datos inicializada con 100 alumnos, 8 profesores y 8 cursos.');
    } catch (err) {
        console.error('❌ Error during seeding:', err);
    }
}

function all(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function run(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

module.exports = {
    db,
    all,
    run,
    get,
    hashPass
};
