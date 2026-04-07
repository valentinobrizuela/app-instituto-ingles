const { get } = require('./database');

async function test() {
    try {
        const user = await get("SELECT email, role FROM users WHERE email='john@teacher.com'");
        if (user) {
            console.log('✅ PROFESOR ENCONTRADO EN DB:', user.email);
        } else {
            console.log('❌ PROFESOR NO ENCONTRADO.');
            const any = await get("SELECT email FROM users LIMIT 1");
            console.log('Primer usuario en DB:', any);
        }
    } catch (e) {
        console.error('ERROR AL LEER DB:', e);
    }
    process.exit();
}

test();
