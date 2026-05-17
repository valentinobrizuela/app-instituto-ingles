const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\54380\\OneDrive\\Escritorio\\app instituto\\js\\config.js', 'utf8');

const urlMatch = content.match(/SUPABASE_URL:\s*"([^"]+)"/i);
const url = urlMatch[1];
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";

async function checkRLS() {
  const res = await fetch(url + '/rest/v1/rpc/get_policies', {
      method: 'POST',
      headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + key,
          'Content-Type': 'application/json'
      }
  });
  // If rpc doesn't exist, we can just execute some SQL to see or query the REST api using the anon key (imitating the teacher)
  console.log('RPC check:', res.status, await res.text());
}
checkRLS();
