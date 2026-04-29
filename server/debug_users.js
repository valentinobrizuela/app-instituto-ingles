const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'westhouse.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT name, email, role FROM users', [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('--- USUARIOS EN BASE DE DATOS ---');
    rows.forEach(row => {
        console.log(`[${row.role}] ${row.name} - ${row.email}`);
    });
    db.close();
});
