const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\54380\\OneDrive\\Escritorio\\app instituto\\js\\config.js', 'utf8');

const urlMatch = content.match(/SUPABASE_URL:\s*"([^"]+)"/i);
const keyMatch = content.match(/SUPABASE_KEY:\s*"([^"]+)"/i);
const url = urlMatch[1];
const anonKey = keyMatch[1];

async function testTeacherFetch() {
  console.log('Logging in as Brian...');
  const loginRes = await fetch(url + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
          'apikey': anonKey,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          email: 'brian@westhouse.com',
          password: 'WestHouse2026'
      })
  });
  
  const loginData = await loginRes.json();
  if (!loginData.access_token) {
      console.error('Login failed:', loginData);
      return;
  }
  
  const token = loginData.access_token;
  const user = loginData.user;
  console.log('Logged in successfully! User ID:', user.id);
  
  console.log('\nFetching users table as Brian...');
  const uRes = await fetch(url + '/rest/v1/users?select=id,name,role,teacher_id,course_id', {
      headers: {
          'apikey': anonKey,
          'Authorization': 'Bearer ' + token
      }
  });
  
  const users = await uRes.json();
  console.log(`Fetched ${users.length} users:`);
  users.forEach(u => console.log(`- ${u.name} (${u.role}) | Teacher ID: ${u.teacher_id} | Course ID: ${u.course_id}`));

  console.log('\nFetching courses table as Brian...');
  const cRes = await fetch(url + '/rest/v1/courses?select=*', {
      headers: {
          'apikey': anonKey,
          'Authorization': 'Bearer ' + token
      }
  });
  const courses = await cRes.json();
  console.log(`Fetched ${courses.length} courses:`);
  courses.forEach(c => console.log(`- ${c.name} | Teacher ID: ${c.teacher_id}`));
}

testTeacherFetch();
