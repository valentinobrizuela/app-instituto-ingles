const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\54380\\OneDrive\\Escritorio\\app instituto\\js\\config.js', 'utf8');
const urlMatch = content.match(/SUPABASE_URL:\s*"([^"]+)"/i);
const url = urlMatch[1];
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";

async function fixDuplicateTeachers() {
  console.log('Fetching all users with service role key to bypass RLS...');
  const uRes = await fetch(url + '/rest/v1/users?select=id,name,role,email', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const users = await uRes.json();
  
  const teachers = users.filter(u => u.name && ['Luana', 'Maricel', 'Amelia', 'Brian', 'Yael'].some(n => u.name.includes(n)));
  
  const teacherMap = {};
  teachers.forEach(t => {
      const firstName = t.name.split(' ')[0];
      // Prefer the teacher that has an email ending with @westhouse.com (the one they log in with)
      if (!teacherMap[firstName] || (t.email && t.email.includes('@westhouse.com'))) {
          teacherMap[firstName] = t;
      }
      console.log('Teacher in DB:', t.name, '| Email:', t.email, '| ID:', t.id);
  });

  console.log('\nSelected definitive Teachers:');
  Object.keys(teacherMap).forEach(k => console.log(k, '=>', teacherMap[k].id, '(', teacherMap[k].email, ')'));

  const studentsData = [
    { "name": "Francisco", "surname": "Valles Barros", "email": "fvalles@gmail.com", "group": "Kids A2", "teacher": "Luana" },
    { "name": "Pablo", "surname": "Carrizo Gramajo", "email": "scristinagramajo+1@gmail.com", "group": "B1 Preliminary", "teacher": "Maricel" },
    { "name": "Santiago", "surname": "Carrizo Gramajo", "email": "scristinagramajo@gmail.com", "group": "Kids A1+(A)", "teacher": "Amelia" },
    { "name": "Felipe", "surname": "Parada Larrosa", "email": "marcedecara@gmail.com", "group": "B2 First A", "teacher": "Brian" },
    { "name": "Manuel", "surname": "Parada Larrosa", "email": "marcedecara+2@gmail.com", "group": "B1 Preliminary", "teacher": "Maricel" },
    { "name": "Evangelina", "surname": "Paz Bazan", "email": "eugebazann@gmail.com", "group": "Kids A2", "teacher": "Luana" },
    { "name": "Mateo Roman", "surname": "Pizarro", "email": "2m0a1t6eo@gmail.com", "group": "Kids A1+(A)", "teacher": "Amelia" },
    { "name": "Milena", "surname": "Daste", "email": "leguizamoav@gmail.com", "group": "B2 First A", "teacher": "Brian" },
    { "name": "Valentino Andres", "surname": "Cessano Beale", "email": "stefaniabeale@gmail.com", "group": "Kids A2", "teacher": "Luana" },
    { "name": "Benicio Giovanni", "surname": "Cessano Beale", "email": "stefaniabp5@gmail.com", "group": "Kids A1", "teacher": "Luana" },
    { "name": "Maria Josefina", "surname": "De la Colina", "email": "nataliavaras29@gmail.com", "group": "Kids A1", "teacher": "Luana" },
    { "name": "Juana", "surname": "Basso Garceron", "email": "cecigarce@hotmail.com", "group": "Pre Teens A2 A", "teacher": "Amelia" },
    { "name": "Paulina", "surname": "Pineda Cabral", "email": "elaisacabral@gmail.com", "group": "Kids A2", "teacher": "Luana" },
    { "name": "Camilo", "surname": "De la Vega Ascoeta", "email": "conty_ascoeta+1@hotmail.com", "group": "B1 Preliminary", "teacher": "Maricel" },
    { "name": "Catalina", "surname": "De la Vega Ascoeta", "email": "conty_ascoeta@hotmail.com", "group": "Kids A2", "teacher": "Luana" },
    { "name": "Delfina", "surname": "Narvaez", "email": "dnarvaez@gmail.com", "group": "Teens A2+(B)", "teacher": "Yael" },
    { "name": "Santino", "surname": "Della Barca", "email": "Santidellabarca@gmail.com", "group": "B2 First A", "teacher": "Brian" },
    { "name": "Constantino", "surname": "Della Barca", "email": "Constantinodb78@gmail.com", "group": "B1 Preliminary", "teacher": "Maricel" },
    { "name": "Pilar", "surname": "Ascoeta", "email": "daniabraham72@gmail.com", "group": "Teens A2+(A)", "teacher": "Yael" },
    { "name": "Mateo", "surname": "Gonzalez Cataldo", "email": "mlauc24@gmail.com", "group": "Kids A1 B", "teacher": "Luana" },
    { "name": "Daniela", "surname": "Martinez Masier", "email": "danielamartinezmasier@gmail.com", "group": "Adults B1", "teacher": "Amelia" },
    { "name": "Francesca", "surname": "Arrizabalaga", "email": "Anahivispo@gmail.com", "group": "Kids A1+(A)", "teacher": "Amelia" },
    { "name": "Martin", "surname": "Castro", "email": "drariverosdelavega@live.com.ar", "group": "Teens A2+(A)", "teacher": "Yael" },
    { "name": "Luka", "surname": "Aurilio", "email": "gladysferro3401@gmail.com", "group": "Kids A1+(C)", "teacher": "Luana" },
    { "name": "Luciano", "surname": "Castro Mercado", "email": "analauram.inm@gmail.com", "group": "Kids A1", "teacher": "Luana" },
    { "name": "Benjamin", "surname": "Valles Barros", "email": "fvalles+1@gmail.com", "group": "B2 First B", "teacher": "Brian" },
    { "name": "Maria Julia", "surname": "Bermuez Basso", "email": "jimebasso@gmail.com", "group": "B2 First B", "teacher": "Brian" },
    { "name": "Benicio", "surname": "Romero", "email": "romyyzurano@gmail.com", "group": "Pre Teens A2 A", "teacher": "Amelia" },
    { "name": "Victoria", "surname": "Vargas", "email": "Caromu2010@hotmail.com", "group": "Pre Teens A2 A", "teacher": "Amelia" },
    { "name": "Josefina", "surname": "Nieto Casado", "email": "ju29-sug@hotmail.com", "group": "Teens A2+(B)", "teacher": "Yael" },
    { "name": "Isabella Gianna", "surname": "Santelli", "email": "isantelli@gmail.com", "group": "Kids A1+(A)", "teacher": "Amelia" },
    { "name": "Valentino", "surname": "Santelli", "email": "isantelli+1@gmail.com", "group": "Kids A1+(A)", "teacher": "Amelia" }
  ];

  console.log('\nFetching courses...');
  const cRes = await fetch(url + '/rest/v1/courses?select=*', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const courses = await cRes.json();
  
  for (const c of courses) {
      const groupData = studentsData.find(s => s.group === c.name);
      if (groupData) {
          const tName = groupData.teacher;
          const correctTeacher = teacherMap[tName];
          if (correctTeacher && c.teacher_id !== correctTeacher.id) {
              console.log(`Course ${c.name} has incorrect teacher_id. Updating to: ${tName} (${correctTeacher.id})`);
              
              const pRes = await fetch(url + '/rest/v1/courses?id=eq.' + c.id, {
                  method: 'PATCH',
                  headers: {
                      'apikey': key,
                      'Authorization': 'Bearer ' + key,
                      'Content-Type': 'application/json',
                      'Prefer': 'return=representation'
                  },
                  body: JSON.stringify({ teacher_id: correctTeacher.id })
              });
              
              if(pRes.ok) {
                  console.log(`-> Successfully updated ${c.name}`);
                  
                  await fetch(url + '/rest/v1/users?course_id=eq.' + c.id, {
                      method: 'PATCH',
                      headers: {
                          'apikey': key,
                          'Authorization': 'Bearer ' + key,
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ teacher_id: correctTeacher.id })
                  });
              }
          } else {
              console.log(`Course ${c.name} is ALREADY correctly assigned to ${tName} (${correctTeacher.id})`);
          }
      }
  }

  console.log('\nDeleting duplicate fake teachers...');
  // Delete the teachers that are NOT the mapped ones
  for (const t of teachers) {
      const firstName = t.name.split(' ')[0];
      const correctTeacher = teacherMap[firstName];
      if (t.id !== correctTeacher.id) {
          console.log(`Deleting duplicate ghost teacher: ${t.name} (ID: ${t.id})`);
          await fetch(url + '/rest/v1/users?id=eq.' + t.id, {
              method: 'DELETE',
              headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
          });
      }
  }
  
  console.log('Done!');
}

fixDuplicateTeachers();
