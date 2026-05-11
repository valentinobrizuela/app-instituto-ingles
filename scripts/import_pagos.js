const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function parseCSVLine(line) {
    const result = [];
    let curVal = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            result.push(curVal.trim());
            curVal = '';
        } else {
            curVal += line[i];
        }
    }
    result.push(curVal.trim());
    return result;
}

async function importPagos() {
    console.log("Importando pagos_westhouse.csv...");
    const content = fs.readFileSync('C:\\Users\\54380\\Downloads\\pagos_westhouse.csv', 'utf-8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    lines.shift(); // remove header
    
    const { data: users } = await supabase.from('users').select('id, name');
    
    let inserted = 0;
    for (const line of lines) {
        const [fecha, alumno, monto, estado] = parseCSVLine(line);
        if (!alumno) continue;
        
        // Find matching user (fuzzy search by name parts)
        const parts = alumno.toLowerCase().split(' ');
        const match = users.find(u => {
            const uName = u.name.toLowerCase();
            // simple match: needs to contain the first and last part
            return uName.includes(parts[0]) && uName.includes(parts[parts.length-1]);
        });
        
        if (match) {
            await supabase.from('payments').insert({
                student_id: match.id,
                amount: parseFloat(monto) || 100000,
                status: estado || 'Pagado',
                date: fecha || '2026-05-01'
            });
            console.log(`Insertado pago para: ${match.name}`);
            inserted++;
        } else {
            console.log(`No se encontró usuario para: ${alumno}`);
        }
    }
    console.log(`Importados ${inserted} pagos exitosamente.`);
}

importPagos();
