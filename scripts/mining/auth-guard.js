// ===== AUTHENTICATION GUARD FOR MINING PAGES =====
// Verifica que el usuario esté autenticado antes de mostrar las páginas
// Este script DEBE cargarse ANTES que cualquier otro script de la página

(function() {
    'use strict';
    
    // No ejecutar en la página de login
    if (window.location.pathname.includes('login.html')) {
        console.log('🛡️ Authentication Guard: Página de login, omitiendo verificación');
        return;
    }
    
    console.log('🛡️ Authentication Guard activado - Verificando autenticación...');
    
    // Ocultar contenido mientras verificamos
    if (document.body) {
        document.body.style.opacity = '0.3';
        document.body.style.pointerEvents = 'none';
    }
    
    function redirectToLogin() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();
        
        let loginUrl = 'login.html';
        if (currentPage && currentPage !== 'login.html' && currentPage !== '' && currentPage !== 'dashboard.html') {
            loginUrl += `?return=${encodeURIComponent(currentPage)}`;
        }
        
        if (currentPath.includes('/mining/')) {
            console.log('🛡️ Redirigiendo a login:', loginUrl);
            window.location.replace(loginUrl);
        } else {
            console.log('🛡️ Redirigiendo a login: mining/' + loginUrl);
            window.location.replace(`mining/${loginUrl}`);
        }
    }
    
    async function checkAuthentication() {
        const MAX_WAIT = 5000; // 5 segundos máximo (aumentado para dar tiempo al backend API)
        const CHECK_INTERVAL = 100; // Verificar cada 100ms
        const maxAttempts = MAX_WAIT / CHECK_INTERVAL;
        let attempts = 0;
        let backendAPIChecked = false;
        let supabaseChecked = false;
        
        return new Promise((resolve) => {
            const checkInterval = setInterval(async () => {
                attempts++;
                
                // Verificar autenticación del backend API primero (solo una vez)
                if (!backendAPIChecked && window.miningBackendAPI) {
                    backendAPIChecked = true; // Marcar como verificado para no repetir
                    
                    try {
                        // Cargar token si no está cargado
                        if (!window.miningBackendAPI.token) {
                            window.miningBackendAPI.loadToken();
                        }
                        
                        // Verificar si hay token y si es válido
                        if (window.miningBackendAPI.isAuthenticated()) {
                            try {
                                // Verificar que el token sea válido haciendo una petición de prueba
                                const testResponse = await window.miningBackendAPI.request('GET', '/auth/profile');
                                
                                if (testResponse.success && testResponse.data?.user) {
                                    clearInterval(checkInterval);
                                    console.log('✅ Usuario autenticado (Backend API) - Acceso permitido');
                                    if (document.body) {
                                        document.body.style.opacity = '1';
                                        document.body.style.pointerEvents = 'auto';
                                    }
                                    resolve(true);
                                    return;
                                }
                            } catch (error) {
                                // Token inválido o expirado
                                console.warn('⚠️ Token del backend inválido o expirado:', error);
                                window.miningBackendAPI.clearToken();
                            }
                        }
                    } catch (error) {
                        console.warn('⚠️ Error verificando backend API:', error);
                    }
                }
                
                // Si Supabase está disponible, verificar también (solo una vez)
                if (!supabaseChecked && window.supabaseIntegration) {
                    supabaseChecked = true; // Marcar como verificado para no repetir
                    
                    try {
                        // Intentar cargar usuario almacenado
                        if (!window.supabaseIntegration.user?.isAuthenticated) {
                            await window.supabaseIntegration.loadStoredUser();
                        }
                        
                        // Verificar autenticación - debe tener email y estar marcado como autenticado
                        if (window.supabaseIntegration.user?.isAuthenticated && 
                            window.supabaseIntegration.user?.email) {
                            clearInterval(checkInterval);
                            console.log('✅ Usuario autenticado (Supabase) - Acceso permitido');
                            if (document.body) {
                                document.body.style.opacity = '1';
                                document.body.style.pointerEvents = 'auto';
                            }
                            resolve(true);
                            return;
                        } else {
                            // Limpiar datos inválidos
                            console.warn('⚠️ Datos de Supabase inválidos o incompletos');
                            if (window.supabaseIntegration.user) {
                                window.supabaseIntegration.user.isAuthenticated = false;
                            }
                        }
                    } catch (error) {
                        console.error('❌ Error verificando autenticación Supabase:', error);
                        // Limpiar datos en caso de error
                        if (window.supabaseIntegration?.user) {
                            window.supabaseIntegration.user.isAuthenticated = false;
                        }
                    }
                }
                
                // Si ambos sistemas están verificados y ninguno tiene autenticación válida, limpiar y redirigir
                if (backendAPIChecked && supabaseChecked && attempts >= 10) {
                    clearInterval(checkInterval);
                    
                    // Limpiar tokens y datos inválidos
                    if (window.miningBackendAPI) {
                        window.miningBackendAPI.clearToken();
                    }
                    if (window.supabaseIntegration?.user) {
                        window.supabaseIntegration.user.isAuthenticated = false;
                    }
                    
                    console.warn('❌ Usuario NO autenticado en ningún sistema - Redirigiendo a login');
                    redirectToLogin();
                    resolve(false);
                    return;
                }
                
                // Si llegamos al tiempo máximo sin autenticación, redirigir
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('❌ Timeout: Usuario NO autenticado - Redirigiendo a login');
                    redirectToLogin();
                    resolve(false);
                }
            }, CHECK_INTERVAL);
        });
    }
    
    // Ejecutar verificación inmediatamente
    checkAuthentication();
    
})();

