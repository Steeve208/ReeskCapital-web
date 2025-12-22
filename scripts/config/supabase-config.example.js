/**
 * ⚠️ ARCHIVO DE EJEMPLO - NO USAR EN PRODUCCIÓN
 * 
 * Copia este archivo como `supabase-config.js` y reemplaza los valores
 * con tus credenciales reales de Supabase.
 * 
 * IMPORTANTE: Agregar `supabase-config.js` al `.gitignore`
 */

const SUPABASE_CONFIG = {
    // URL del proyecto de Supabase
    // Obtener desde: Supabase Dashboard > Settings > API > Project URL
    url: 'https://tu-proyecto.supabase.co',
    
    // Anon Key (clave anónima)
    // Obtener desde: Supabase Dashboard > Settings > API > anon public key
    anonKey: 'tu-clave-anonima-aqui'
};

// Exportar configuración
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}

// Para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}

