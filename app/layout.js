import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700']
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata = {
  title: 'West House English School — La Rioja, Argentina',
  description: 'Instituto de inglés moderno para niños, adolescentes y adultos. Aprendizaje práctico, acompañamiento personalizado y ambiente cálido y humano.',
  openGraph: {
    title: 'West House English School',
    description: 'Abrí puertas al mundo aprendiendo inglés en un ambiente cálido, humano y moderno.',
    images: [{ url: '/app/img/icon-192.png' }],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <head>
        {/* Link for FontAwesome icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="font-sans antialiased text-slate-800">
        {children}
      </body>
    </html>
  );
}
