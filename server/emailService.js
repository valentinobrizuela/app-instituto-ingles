const nodemailer = require('nodemailer');
require('dotenv').config();

// --- INVOICE ID GENERATOR ---
function generateInvoiceId(date, paymentId) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `WH-${yyyy}${mm}${dd}-${String(paymentId).padStart(4, '0')}`;
}

async function sendInvoiceEmail(studentName, parentEmail, amount, date, paymentId) {
    let transporter;
    const invId = generateInvoiceId(date, paymentId);

    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        // Uso de Gmail Real
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });
    } else {
        // Uso de Ethereal Email de prueba
        console.log('Using Ethereal Email for testing...');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ffedd5; border-radius: 16px; overflow: hidden; background-color:#fffaf5">
        <div style="background-color: #f97316; color: white; padding: 30px; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 10px;">🎓</div>
            <h1 style="margin: 0; font-size: 1.75rem; letter-spacing: -0.5px;">West House English School</h1>
            <p style="margin: 5px 0 0; opacity: 0.9; font-weight: 600;">Comprobante de Pago Electrónico</p>
        </div>
        
        <div style="padding: 40px; background-color: white;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #fff7ed; padding-bottom: 15px;">
                <div>
                    <p style="margin: 0; color: #7c2d12; font-weight: 700;">Factura No.</p>
                    <p style="margin: 5px 0 0; color: #f97316; font-size: 1.25rem; font-weight: 800;">${invId}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; color: #7c2d12; font-weight: 700;">Fecha de Emisión</p>
                    <p style="margin: 5px 0 0; color: #ea580c;">${date}</p>
                </div>
            </div>

            <h2 style="color: #431407; font-size: 1.35rem; margin-top: 0;">Estimado/a Tutor/a de ${studentName},</h2>
            <p style="color: #7c2d12; line-height: 1.6; font-size: 1rem;">Le informamos que hemos recibido satisfactoriamente el pago correspondiente a la cuota mensual. A continuación los detalles de la transacción:</p>
            
            <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #9a3412; font-weight: 600; padding: 8px 0;">Estudiante</td>
                        <td style="color: #431407; text-align: right; font-weight: 700;">${studentName}</td>
                    </tr>
                    <tr>
                        <td style="color: #9a3412; font-weight: 600; padding: 8px 0;">Monto Total</td>
                        <td style="color: #f97316; text-align: right; font-size: 1.5rem; font-weight: 800;">$${amount}</td>
                    </tr>
                    <tr>
                        <td style="color: #9a3412; font-weight: 600; padding: 8px 0;">Estado</td>
                        <td style="color: #10b981; text-align: right; font-weight: 800;">✔ PAGADO</td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <p style="color: #7c2d12; font-size: 0.9rem;">Gracias por su puntualidad y por confiar la educación de sus hijos a <strong>West House</strong>.</p>
            </div>
        </div>

        <div style="background-color: #ffedd5; padding: 25px; text-align: center; color: #7c2d12; font-size: 13px; line-height: 1.5;">
            <p style="margin: 0 0 5px;"><strong>West House English School</strong></p>
            <p style="margin: 0 0 5px;">📍 Calle Asunción, La Rioja, Argentina</p>
            <p style="margin: 0 0 5px;">📞 Teléfono: +3804135270</p>
            <p style="margin: 15px 0 0; color: #9a3412; opacity: 0.7;">© ${new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
    </div>
    `;

    const info = await transporter.sendMail({
        from: '"West House Admin" <admin@westhouse.com>',
        to: parentEmail,
        subject: `Factura de Pago [${invId}] - West House English School`,
        html: htmlContent
    });

    console.log("Message sent to %s: %s", parentEmail, info.messageId);
    
    if (!process.env.GMAIL_USER) {
        console.log("Mensaje de prueba visible en Ethereal: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId, invoiceId: invId };
}

module.exports = {
    sendInvoiceEmail
};
