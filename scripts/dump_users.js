const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\54380\\OneDrive\\Escritorio\\app instituto\\js\\config.js', 'utf8');

const urlMatch = content.match(/SUPABASE_URL:\s*"([^"]+)"/i);
const keyMatch = content.match(/SUPABASE_KEY:\s*"([^"]+)"/i);
const url = urlMatch[1];
const key = keyMatch[1];

async function check() {
  const uRes = await fetch(url + '/rest/v1/users?select=id,name,role', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const users = await uRes.json();
  console.log('All Users:');
  users.forEach(u => console.log(u.role, '|', u.name));
}
check();
