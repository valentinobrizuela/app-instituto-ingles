// Configuración Centralizada
const CONFIG = {
    BASE_URL: "https://westhouseenglishschool.com",
    API_URL: "https://westhouseenglishschool.com/api"
};

// Si estamos en local (localhost, 127.0.0.1, IPs privadas, o abriendo el archivo localmente), usamos el servidor local
const hostname = window.location.hostname;
const protocol = window.location.protocol;
const isLocal = !hostname || 
                hostname === 'localhost' || 
                hostname === '127.0.0.1' || 
                hostname.startsWith('192.168.') || 
                hostname.startsWith('10.') || 
                hostname.endsWith('.local') ||
                protocol === 'file:';

if (isLocal) {
    // Si es local, usamos el hostname actual (para que funcione tanto en 'localhost' como con la IP de la red local)
    const apiHostname = hostname || 'localhost';
    CONFIG.API_URL = `${protocol}//${apiHostname}:3000/api`;
}
