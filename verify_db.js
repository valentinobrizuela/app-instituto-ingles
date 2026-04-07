const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');

function hashPass(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

const dbPath = path.resolve(__dirname, 'server', 'westhouse.sqlite');
const db = new sqlite3.Database(dbPath);

const testPass = 'teacher123';
const hashedTest = hashPass(testPass);

console.log('--- DIAGNOSTIC ---');
console.log('Expected Hash for "teacher123":', hashedTest);

db.get('SELECT email, password, role FROM users WHERE email = ?', ['john@teacher.com'], (err, row) => {
    if (err) {
        console.error('Error querying DB:', err);
    } else if (row) {
        console.log('Found User:', row.email);
        console.log('Role:', row.role);
        console.log('Stored Hash:', row.password);
        console.log('Match?:', row.password === hashedTest ? 'YES' : 'NO');
    } else {
        console.log('User "john@teacher.com" NOT FOUND in database.');
        
        // Let's see some users that ARE there
        db.all('SELECT email FROM users LIMIT 5', (err2, rows) => {
            console.log('Sample of existing users:', rows);
        });
    }
    setTimeout(() => db.close(), 1000);
});
