const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\54380\\OneDrive\\Escritorio\\app instituto\\js\\config.js', 'utf8');

const urlMatch = content.match(/SUPABASE_URL:\s*"([^"]+)"/i);
const url = urlMatch[1];
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";

async function check() {
  const uRes = await fetch(url + '/rest/v1/users?select=id,name,role,teacher_id,course_id', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const users = await uRes.json();
  const cRes = await fetch(url + '/rest/v1/courses?select=id,name,teacher_id', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const courses = await cRes.json();
  
  const brian = users.find(u => u.name === 'Brian');
  if(!brian) return console.log('Brian not found');
  console.log('Brian ID:', brian.id);
  
  const brianCourses = courses.filter(c => c.teacher_id === brian.id);
  console.log('Brian Courses:', brianCourses.map(c => c.name).join(', '));
  
  const brianStudents = users.filter(u => u.teacher_id === brian.id);
  console.log('Brian Students count by teacher_id:', brianStudents.length);
  brianStudents.forEach(s => console.log(s.name, s.course_id));

  // Let's also check if the students are mapped to the course ID directly instead of teacher_id
  const courseIds = brianCourses.map(c => c.id);
  const studentsByCourse = users.filter(u => u.role === 'student' && courseIds.includes(u.course_id));
  console.log('Brian Students count by course_id:', studentsByCourse.length);
  studentsByCourse.forEach(s => console.log(s.name, s.course_id, s.teacher_id));
}
check();
