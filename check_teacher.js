const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'server', 'westhouse.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- VERIFYING TEACHER ---');
db.get("SELECT email, password, role FROM users WHERE email='john@teacher.com'", (err, row) => {
    if (err) {
        console.error('DB Error:', err);
    } else if (row) {
        console.log('✅ Success: Teacher found!');
        console.log('Email:', row.email);
        console.log('Role:', row.role);
    } else {
        console.log('❌ Error: Teacher "john@teacher.com" not found in DB.');
    }
    db.close();
});
