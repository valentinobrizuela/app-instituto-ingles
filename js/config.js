// Configuración Centralizada
const CONFIG = {
    BASE_URL: "https://westhouseenglishschool.com",
    API_URL: "https://westhouseenglishschool.com/api",
    // Configuración de Supabase
    SUPABASE_URL: "https://mwfxxppefpyaxwtybcnf.supabase.com",
    SUPABASE_KEY: "sb_publishable_YxSdxaecaAicyfkyqfNugg_XquP8SK4"
};

// Si estamos en local (localhost, 127.0.0.1, IPs privadas, o abriendo el archivo localmente), usamos el servidor local como fallback
const hostname = window.location.hostname;
const protocol = window.location.protocol;
const isLocal = !hostname || 
                hostname === 'localhost' || 
                hostname === '127.0.0.1' || 
                hostname.startsWith('192.168.') || 
                hostname.startsWith('10.') || 
                hostname.endsWith('.local') ||
                protocol === 'file:';

if (isLocal && !CONFIG.SUPABASE_URL) {
    const apiHostname = hostname || 'localhost';
    CONFIG.API_URL = `${protocol}//${apiHostname}:3000/api`;
}
