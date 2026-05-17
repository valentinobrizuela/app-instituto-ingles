const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\54380\\OneDrive\\Escritorio\\app instituto\\js\\config.js', 'utf8');
const urlMatch = content.match(/SUPABASE_URL:\s*"([^"]+)"/i);
const url = urlMatch[1];
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";

async function fixCourses() {
  console.log('Fetching all users with service role key to bypass RLS...');
  const uRes = await fetch(url + '/rest/v1/users?select=id,name,role', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const users = await uRes.json();
  
  const teachers = users.filter(u => u.name && ['Luana', 'Maricel', 'Amelia', 'Brian', 'Yael'].some(n => u.name.includes(n)));
  console.log('Found teachers:', teachers.length);

  const teacherMap = {};
  teachers.forEach(t => {
      // Find the first name
      const firstName = t.name.split(' ')[0];
      teacherMap[firstName] = t.id;
      console.log('Mapped:', firstName, '=>', t.id);
  });

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
      // Find the corresponding group in studentsData to figure out the teacher
      const groupData = studentsData.find(s => s.group === c.name);
      if (groupData) {
          const tName = groupData.teacher;
          const correctTeacherId = teacherMap[tName];
          if (correctTeacherId && c.teacher_id !== correctTeacherId) {
              console.log(`Course ${c.name} has incorrect or missing teacher_id. Updating to: ${tName} (${correctTeacherId})`);
              
              // Patch the course
              const pRes = await fetch(url + '/rest/v1/courses?id=eq.' + c.id, {
                  method: 'PATCH',
                  headers: {
                      'apikey': key,
                      'Authorization': 'Bearer ' + key,
                      'Content-Type': 'application/json',
                      'Prefer': 'return=representation'
                  },
                  body: JSON.stringify({ teacher_id: correctTeacherId })
              });
              
              if(pRes.ok) {
                  console.log(`-> Successfully updated ${c.name}`);
                  
                  // Also patch all students in this course to have the correct teacher_id
                  const updateStudents = await fetch(url + '/rest/v1/users?course_id=eq.' + c.id, {
                      method: 'PATCH',
                      headers: {
                          'apikey': key,
                          'Authorization': 'Bearer ' + key,
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ teacher_id: correctTeacherId })
                  });
              } else {
                  console.error(`-> Failed to update ${c.name}:`, await pRes.text());
              }
          } else if (correctTeacherId) {
              console.log(`Course ${c.name} is already correctly assigned to ${tName}`);
          } else {
              console.log(`Teacher ${tName} not found in DB!`);
          }
      }
  }
}

fixCourses();
