const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\54380\\OneDrive\\Escritorio\\app instituto\\js\\views';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Number(something.id) with String(something.id)
    const regex = /Number\s*\(\s*([a-zA-Z0-9_.]+(?:id|_id|Id))\s*\)/g;
    const newContent = content.replace(regex, 'String($1)');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
});
