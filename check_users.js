const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'server', 'westhouse.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- USERS IN DATABASE ---');
db.all('SELECT email, role FROM users', [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});
