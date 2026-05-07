const PDFDocument = require('pdfkit');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generatePDF() {
    console.log("Generando PDF...");
    const { data: users, error } = await supabase
        .from('users')
        .select('name, email, role')
        .order('role', { ascending: true });

    if (error) {
        console.error("Error al obtener usuarios:", error);
        return;
    }

    const adminsEmails = [
        'morebrizuela26@gmail.com',
        'brizuelavalen0@gmail.com',
        'oscararmandolujan@gmail.com',
        'maricelandrealujan@gmail.com'
    ];

    const doc = new PDFDocument();
    const outputPath = path.join(__dirname, 'lista_usuarios.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(20).text('Lista de Usuarios - West House English School', { align: 'center' });
    doc.moveDown();

    users.forEach((u, i) => {
        let password = 'WestHouse2026';
        if (u.role === 'admin' || adminsEmails.includes(u.email)) {
            password = 'AdminWestHouse2026';
        }

        doc.fontSize(12).text(`${i + 1}. [${u.role.toUpperCase()}] ${u.name}`);
        doc.fontSize(10).text(`   Email: ${u.email}`);
        doc.text(`   Contraseña: ${password}`);
        doc.moveDown(0.5);

        if (doc.y > 700) doc.addPage();
    });

    doc.end();

    stream.on('finish', () => {
        console.log(`PDF generado con éxito en: ${outputPath}`);
    });
}

generatePDF();
