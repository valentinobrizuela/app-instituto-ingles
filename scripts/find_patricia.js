const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\54380\\OneDrive\\Escritorio\\app instituto\\js\\config.js', 'utf8');

const urlMatch = content.match(/SUPABASE_URL:\s*"([^"]+)"/i);
const url = urlMatch[1];
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";

async function check() {
  const uRes = await fetch(url + '/rest/v1/users?select=id,name,email,role', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const users = await uRes.json();
  const teachers = users.filter(u => u.role === 'teacher' || (u.name && u.name.toLowerCase().includes('patricia')));
  
  console.log('Teachers and Patricia:');
  let patriciaId = null;
  teachers.forEach(u => {
      console.log(u.id, '|', u.name, '|', u.email, '|', u.role);
      if (u.name && u.name.toLowerCase().includes('patricia')) {
          patriciaId = u.id;
      }
  });
  
  if (patriciaId) {
      console.log('Patricia ID:', patriciaId);
      const cRes = await fetch(url + '/rest/v1/courses?select=id,name,teacher_id', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
      const courses = await cRes.json();
      console.log('\nCourses assigned to Patricia:');
      courses.filter(c => c.teacher_id === patriciaId).forEach(c => console.log(c.id, '|', c.name));
      
      console.log('\nAll Courses with No Teacher or Incorrect:');
      const knownIds = teachers.map(t => t.id);
      courses.filter(c => !knownIds.includes(c.teacher_id)).forEach(c => console.log(c.id, '|', c.name, '|', c.teacher_id));
  }
}
check();
