/* ================================
   BACKGROUND MINING INTEGRATION
================================ */

/**
 * 🔄 INTEGRACIÓN DE MINERÍA EN SEGUNDO PLANO
 * 
 * Conecta la página principal con el Service Worker
 * para permitir minería continua en background
 */

class BackgroundMiningManager {
    constructor() {
        this.serviceWorker = null;
        this.isSupported = 'serviceWorker' in navigator;
        this.isBackgroundActive = false;
        this.backgroundData = {
            tokensMinedInBackground: 0,
            startTime: null,
            sessionId: null
        };
        
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            console.warn('⚠️ Service Workers no soportados en este navegador');
            return;
        }

        try {
            // Registrar Service Worker con ruta dinámica para soportar subrutas
            const basePath = location.pathname.includes('/pages/')
                ? location.pathname.split('/pages/')[0]
                : '/';
            const swUrl = basePath + 'background-mining-sw.js';

            const registration = await navigator.serviceWorker.register(swUrl, {
                scope: basePath
            });

            console.log('✅ Service Worker registrado:', registration.scope);

            // Esperar a que esté activo
            await this.waitForServiceWorker(registration);

            // Configurar listeners
            this.setupMessageListeners();
            this.setupVisibilityListeners();

            // Solicitar permisos de notificación
            await this.requestNotificationPermission();

            // Reanudar minería en segundo plano si estaba activa previamente
            await this.resumeBackgroundMiningIfNeeded();

            console.log('🚀 Background Mining Manager inicializado');

        } catch (error) {
            console.error('❌ Error registrando Service Worker:', error);
        }
    }

    async waitForServiceWorker(registration) {
        return new Promise((resolve) => {
            if (registration.active) {
                this.serviceWorker = registration.active;
                resolve();
            } else {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            this.serviceWorker = newWorker;
                            resolve();
                        }
                    });
                });
            }
        });
    }

    async resumeBackgroundMiningIfNeeded() {
        try {
            const persistedActive = localStorage.getItem('rsc_bg_mining_active') === '1';
            const status = await this.getBackgroundStatus();
            const currentlyActive = !!(status && status.isActive);

            if (persistedActive && !currentlyActive) {
                console.log('🔄 Reanudando minería en segundo plano desde estado persistido...');
                await this.startBackgroundMining();
            } else if (currentlyActive) {
                this.isBackgroundActive = true;
                console.log('ℹ️ Minería en segundo plano ya activa');
            }
        } catch (e) {
            console.warn('⚠️ No se pudo reanudar automáticamente la minería en segundo plano:', e);
        }
    }

    setupMessageListeners() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            const { type, data } = event.data;

            switch (type) {
                case 'BACKGROUND_MINING_UPDATE':
                    this.handleBackgroundUpdate(data);
                    break;
                case 'BACKGROUND_MINING_COMPLETE':
                    this.handleBackgroundComplete(data);
                    break;
                case 'BACKGROUND_STATUS':
                    this.handleBackgroundStatus(data);
                    break;
                case 'BACKGROUND_SYNC_COMPLETE':
                    this.handleBackgroundSync(data);
                    break;
            }
        });
    }

    setupVisibilityListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Página va a segundo plano
                this.onPageHidden();
            } else {
                // Página vuelve a primer plano
                this.onPageVisible();
            }
        });

        // También escuchar cuando la ventana pierde/gana foco
        window.addEventListener('blur', () => this.onPageHidden());
        window.addEventListener('focus', () => this.onPageVisible());
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('✅ Permisos de notificación concedidos');
            } else {
                console.warn('⚠️ Permisos de notificación denegados');
            }
        }
    }

    // Iniciar minería en segundo plano
    async startBackgroundMining(config = {}) {
        if (!this.serviceWorker) {
            console.warn('⚠️ Service Worker no disponible');
            return false;
        }

        const miningConfig = {
            sessionId: this.generateSessionId(),
            baseRate: config.baseRate || 0.1,
            hashRate: config.hashRate || 100,
            efficiency: config.efficiency || 100,
            algorithm: config.algorithm || 'sha256',
            ...config
        };

        this.sendToServiceWorker('START_BACKGROUND_MINING', miningConfig);
        
        this.isBackgroundActive = true;
        this.backgroundData.sessionId = miningConfig.sessionId;
        this.backgroundData.startTime = Date.now();

        // Persistir estado para reanudar en próximas visitas
        try {
            localStorage.setItem('rsc_bg_mining_active', '1');
            localStorage.setItem('rsc_bg_session', this.backgroundData.sessionId);
        } catch (e) {
            console.warn('⚠️ No se pudo persistir el estado de minería en segundo plano:', e);
        }

        console.log('🚀 Minería en segundo plano iniciada');
        return true;
    }

    // Detener minería en segundo plano
    stopBackgroundMining() {
        if (!this.serviceWorker) return;

        this.sendToServiceWorker('STOP_BACKGROUND_MINING');
        this.isBackgroundActive = false;

        // Limpiar estado persistido
        try {
            localStorage.removeItem('rsc_bg_mining_active');
            localStorage.removeItem('rsc_bg_session');
        } catch (e) {
            // noop
        }

        console.log('⏹️ Minería en segundo plano detenida');
    }

    // Actualizar configuración de minería
    updateMiningConfig(config) {
        if (!this.serviceWorker || !this.isBackgroundActive) return;

        this.sendToServiceWorker('UPDATE_MINING_CONFIG', config);
        console.log('⚙️ Configuración de minería actualizada');
    }

    // Obtener estado actual
    async getBackgroundStatus() {
        if (!this.serviceWorker) return null;

        return new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(null), 5000);
            
            const handler = (event) => {
                if (event.data.type === 'BACKGROUND_STATUS') {
                    clearTimeout(timeout);
                    navigator.serviceWorker.removeEventListener('message', handler);
                    resolve(event.data.data);
                }
            };

            navigator.serviceWorker.addEventListener('message', handler);
            this.sendToServiceWorker('GET_BACKGROUND_STATUS');
        });
    }

    // Manejar eventos del Service Worker
    handleBackgroundUpdate(data) {
        this.backgroundData.tokensMinedInBackground = data.tokensMinedInBackground;
        
        // Actualizar UI si está visible
        if (!document.hidden) {
            this.updateBackgroundUI(data);
        }

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('backgroundMiningUpdate', { detail: data }));
    }

    handleBackgroundComplete(data) {
        this.isBackgroundActive = false;
        this.backgroundData = { ...this.backgroundData, ...data };

        // Limpiar estado persistido al completar
        try {
            localStorage.removeItem('rsc_bg_mining_active');
            localStorage.removeItem('rsc_bg_session');
        } catch (e) {
            // noop
        }

        // Agregar tokens al balance principal
        if (window.supabaseIntegration && data.tokensMinedInBackground > 0) {
            window.supabaseIntegration.addBalance(data.tokensMinedInBackground);
        }

        // Actualizar logros
        if (window.achievementSystem && data.tokensMinedInBackground > 0) {
            window.achievementSystem.updateStats({
                tokens_mined: data.tokensMinedInBackground,
                mining_sessions: 1
            });
        }

        // Mostrar notificación en la UI
        this.showBackgroundCompleteNotification(data);

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('backgroundMiningComplete', { detail: data }));
    }

    handleBackgroundStatus(data) {
        this.isBackgroundActive = data.isActive;
        this.backgroundData = { ...this.backgroundData, ...data };
        
        // Actualizar UI
        this.updateBackgroundStatusUI(data);
    }

    handleBackgroundSync(data) {
        console.log('🔄 Sincronización de segundo plano completada:', data);
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('backgroundSync', { detail: data }));
    }

    // Eventos de visibilidad
    onPageHidden() {
        console.log('📱 Página en segundo plano');
        
        // ARREGLO TEMPORAL: Solo continuar la minería local en background
        if (window.supabaseIntegration?.miningSession?.isActive) {
            console.log('⛏️ Continuando minería en segundo plano (modo simple)');
            // La minería continuará automáticamente porque se basa en tiempo transcurrido
            // No necesitamos Service Worker para esto
        }
    }

    onPageVisible() {
        console.log('👀 Página visible');
        
        // ARREGLO: Forzar actualización de minería al volver
        if (window.supabaseIntegration?.miningSession?.isActive) {
            console.log('🔄 Actualizando minería al volver a la página...');
            
            // Simular una actualización de stats para recalcular tokens
            const currentHashRate = window.supabaseIntegration.miningSession.hashRate || 100;
            const currentEfficiency = window.supabaseIntegration.miningSession.efficiency || 100;
            
            // Forzar actualización
            window.supabaseIntegration.updateMiningStats(0, currentHashRate, currentEfficiency);
            
            // Actualizar UI si existe
            if (window.updateMiningUI) {
                window.updateMiningUI();
            }
        }
    }

    // Funciones de UI
    updateBackgroundUI(data) {
        // Actualizar indicador de minería en background
        const backgroundIndicator = document.getElementById('backgroundMiningIndicator');
        if (backgroundIndicator) {
            backgroundIndicator.innerHTML = `
                <i class="fas fa-mobile-alt"></i>
                <span>Minería en segundo plano: ${data.tokensMinedInBackground.toFixed(4)} RSC</span>
            `;
            backgroundIndicator.style.display = 'block';
        }
    }

    updateBackgroundStatusUI(data) {
        const statusElement = document.getElementById('backgroundStatus');
        if (statusElement) {
            statusElement.innerHTML = data.isActive ? 
                `<i class="fas fa-check-circle" style="color: #4CAF50;"></i> Minería en segundo plano activa` :
                `<i class="fas fa-pause-circle" style="color: #888;"></i> Minería en segundo plano inactiva`;
        }
    }

    showBackgroundCompleteNotification(data) {
        // Crear notificación en la UI
        const notification = document.createElement('div');
        notification.className = 'background-mining-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-mobile-alt" style="color: #4CAF50;"></i>
                <div class="notification-text">
                    <h4>¡Minería en Segundo Plano Completada!</h4>
                    <p>Has minado ${data.tokensMinedInBackground.toFixed(4)} RSC mientras estabas ausente</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remover después de 8 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 8000);
    }

    // Utilidades
    sendToServiceWorker(type, data = {}) {
        if (this.serviceWorker) {
            this.serviceWorker.postMessage({ type, data });
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Getters públicos
    getBackgroundData() {
        return { ...this.backgroundData };
    }

    isBackgroundMiningActive() {
        return this.isBackgroundActive;
    }

    isBackgroundMiningSupported() {
        return this.isSupported;
    }
}

// Crear instancia global
window.backgroundMiningManager = new BackgroundMiningManager();

console.log('🔄 Background Mining Manager cargado');

// === PLANETA DIGITAL TOKENOMICS ESTILO ARGUSVPN ===
(function(){
  const canvas = document.getElementById('tokenomicsPlanetCanvas');
  if (!canvas) return;
  const W = 700, H = 420;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const centerX = W/2, centerY = H*0.52;
  const R = 180; // Radio del planeta
  
  // Generar puntos de la esfera (más densos)
  const points = [];
  const latLines = 40;
  const lonLines = 120;
  for(let i=0; i<=latLines; i++){
    const phi = Math.PI * (i/latLines);
    for(let j=0; j<lonLines; j++){
      const theta = (j/lonLines)*2*Math.PI;
      points.push({phi, theta});
    }
  }
  
  // Partículas flotantes aleatorias
  const floatingDots = [];
  for(let i=0; i<30; i++){
    floatingDots.push({
      x: centerX + (Math.random()-0.5)*R*3,
      y: centerY + (Math.random()-0.5)*R*2.2,
      size: Math.random()*2+0.5,
      speed: Math.random()*0.3+0.1,
      offset: Math.random()*Math.PI*2
    });
  }

  function drawFrame(t){
    ctx.clearRect(0,0,W,H);
    
    // ==== GLOW MASIVO DE FONDO ====
    const glow = ctx.createRadialGradient(centerX, centerY, R*0.3, centerX, centerY, R*1.8);
    glow.addColorStop(0, 'rgba(100,150,255,0.6)');
    glow.addColorStop(0.3, 'rgba(50,100,255,0.4)');
    glow.addColorStop(0.6, 'rgba(20,50,150,0.2)');
    glow.addColorStop(1, 'rgba(0,0,50,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0,0,W,H);
    
    const rot = (t/8000) % (2*Math.PI);
    
    // ==== LÍNEAS HORIZONTALES CURVAS (LATITUD) ====
    ctx.save();
    for(let i=5; i<=35; i+=3){
      const phi = Math.PI * (i/40);
      const y = centerY - R * Math.cos(phi);
      const radiusAtLat = R * Math.sin(phi);
      
      ctx.beginPath();
      for(let angle=0; angle<=Math.PI; angle+=0.02){
        const theta = angle + rot;
        const x = Math.sin(phi)*Math.cos(theta);
        const z = Math.sin(phi)*Math.sin(theta);
        if(x > 0){
          const sx = centerX + R * Math.sin(phi) * Math.cos(theta);
          const sy = y;
          if(angle===0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
      }
      ctx.strokeStyle = `rgba(150,180,255,${0.3+0.2*Math.sin(phi)})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(100,150,255,0.8)';
      ctx.shadowBlur = 8;
      ctx.stroke();
    }
    ctx.restore();
    
    // ==== PUNTOS BRILLANTES DE LA ESFERA ====
    for(const pt of points){
      const phi = pt.phi;
      const theta = pt.theta + rot;
      const x = Math.sin(phi)*Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi)*Math.sin(theta);
      
      if(x > 0){ // Solo lado visible
        const sx = centerX + R * Math.sin(phi) * Math.cos(theta);
        const sy = centerY - R * y;
        const brightness = 0.4 + 0.6*Math.pow(x, 1.5);
        const size = 1 + 1.5*x;
        
        ctx.save();
        ctx.globalAlpha = brightness;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, 2*Math.PI);
        ctx.fillStyle = `rgb(${180+75*x},${200+55*x},255)`;
        ctx.shadowColor = `rgba(100,150,255,${brightness})`;
        ctx.shadowBlur = 6+8*x;
        ctx.fill();
        ctx.restore();
      }
    }
    
    // ==== PARTÍCULAS FLOTANTES ====
    floatingDots.forEach(dot => {
      const pulse = Math.sin(t/1000 + dot.offset)*0.3+0.7;
      ctx.save();
      ctx.globalAlpha = pulse*0.6;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, 2*Math.PI);
      ctx.fillStyle = '#a8c8ff';
      ctx.shadowColor = 'rgba(168,200,255,0.8)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
      
      dot.y -= dot.speed;
      if(dot.y < centerY - R*1.5) dot.y = centerY + R*1.2;
    });
    
    // ==== PUNTOS CONECTORES LATERALES ====
    // Punto izquierdo (50)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX - R*0.7, centerY - R*0.3, 6, 0, 2*Math.PI);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(255,255,255,1)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.restore();
    
    // Punto derecho (40)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX + R*0.9, centerY + R*0.1, 6, 0, 2*Math.PI);
    ctx.fillStyle = '#8ab4ff';
    ctx.shadowColor = 'rgba(138,180,255,1)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.restore();
  }
  
  function animate(){
    drawFrame(performance.now());
    requestAnimationFrame(animate);
  }
  animate();
})();
