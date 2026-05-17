const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'js', 'views');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Number(x.id) with String(x.id)
    // We target common ID patterns: Number(a.id), Number(course.id), Number(id), Number(a.course_id), Number(c.teacher_id), Number(c.teacherId)
    // Be careful with Number(c.id) vs Number(p.amount)
    const regex = /Number\s*\(\s*([a-zA-Z0-9_.]+(?:id|_id|Id))\s*\)/g;
    
    const newContent = content.replace(regex, 'String($1)');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
});

// Also check js/users.js or other files if needed
const appJsPath = path.join(__dirname, 'js', 'app.js');
if (fs.existsSync(appJsPath)) {
    let appContent = fs.readFileSync(appJsPath, 'utf8');
    const newAppContent = appContent.replace(/Number\s*\(\s*([a-zA-Z0-9_.]+(?:id|_id|Id))\s*\)/g, 'String($1)');
    if (appContent !== newAppContent) {
        fs.writeFileSync(appJsPath, newAppContent, 'utf8');
        console.log('Updated js/app.js');
    }
}
