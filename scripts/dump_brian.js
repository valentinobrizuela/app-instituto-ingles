const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\54380\\OneDrive\\Escritorio\\app instituto\\js\\config.js', 'utf8');

const urlMatch = content.match(/SUPABASE_URL:\s*"([^"]+)"/i);
const url = urlMatch[1];
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";

async function dumpAllBrian() {
  const uRes = await fetch(url + '/rest/v1/users?select=id,name,email,role', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const users = await uRes.json();
  
  console.log('All users in public.users matching Brian or Brian\'s auth ID:');
  users.forEach(u => {
      if (u.name.includes('Brian') || u.email.includes('brian') || u.id === '14498a21-94a3-4318-9b9e-199bccdbee36' || u.id === '0e633074-1abf-4975-865c-ac2da177ba6c') {
          console.log(`- ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
      }
  });
}
dumpAllBrian();
