/* ===== SERVIDOR PRINCIPAL RSC MINING SYSTEM ===== */

const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Importar base de datos y rutas
const MiningDatabase = require('./backend/database/database');
const miningRoutes = require('./backend/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== RUTA DIRECTA PARA EL APK EN LA RAÍZ - PRIMERO, ANTES DE MIDDLEWARES =====
app.get('/rsc-mining.apk', (req, res) => {
    const apkPath = path.join(__dirname, 'rsc-mining.apk');
    
    console.log('📦 [APK] Petición recibida');
    
    // Verificar existencia
    if (!fs.existsSync(apkPath)) {
        console.error('❌ [APK] Archivo no encontrado:', apkPath);
        return res.status(404).send('APK no encontrado');
    }
    
    const stats = fs.statSync(apkPath);
    console.log('📊 [APK] Tamaño:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Headers para Android
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="rsc-mining.apk"');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Usar sendFile - Express maneja archivos binarios correctamente
    res.sendFile(apkPath, (err) => {
        if (err) {
            console.error('❌ [APK] Error:', err.message);
            if (!res.headersSent) {
                res.status(500).send('Error al enviar el archivo');
            }
        } else {
            console.log('✅ [APK] Enviado exitosamente');
        }
    });
});

// Middleware CORS
app.use(cors());

// Middleware JSON
app.use(express.json());

// Middleware estático para el resto de archivos
app.use(express.static(path.join(__dirname)));

// Inicializar base de datos
let db = null;

async function initializeDatabase() {
    try {
        console.log('🗄️ Inicializando base de datos...');
        db = new MiningDatabase();
        await db.initialize();
        console.log('✅ Base de datos inicializada correctamente');
        
        // Hacer la base de datos disponible globalmente
        global.db = db;
        
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        process.exit(1);
    }
}

// Rutas de la API
app.use('/api', miningRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// MINERÍA DESACTIVADA - Redirigir a página de desactivación
app.get('/mine', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/mining-disabled.html'));
});

// Redirigir todas las rutas de minería a página desactivada
app.get('/pages/mining/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/mining-disabled.html'));
});

// Ruta de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/login.html'));
});

// Ruta de prueba del sistema híbrido
app.get('/test-hybrid', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-hybrid-mining.html'));
});

// Ruta de estado del sistema
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        database: db ? 'connected' : 'disconnected',
        version: '1.0.0',
        system: 'RSC Mining Simulator'
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('❌ Error del servidor:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// Inicializar y arrancar servidor
async function startServer() {
    try {
        // Inicializar base de datos primero
        await initializeDatabase();
        
        // Arrancar servidor
        app.listen(PORT, () => {
            console.log('🚀 Servidor RSC Mining System iniciado');
            console.log(`📍 Puerto: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`🔗 API: http://localhost:${PORT}/api`);
            console.log(`⛏️ Minería: http://localhost:${PORT}/mine`);
            console.log(`🧪 Test: http://localhost:${PORT}/test-hybrid`);
            console.log('');
            console.log('✅ Sistema completamente operativo');
            console.log('💡 Abre http://localhost:3000 en tu navegador');
        });
        
    } catch (error) {
        console.error('❌ Error arrancando servidor:', error);
        process.exit(1);
    }
}

// Manejar señales de terminación
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    if (db) {
        await db.close();
        console.log('🗄️ Base de datos cerrada');
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Cerrando servidor...');
    if (db) {
        await db.close();
        console.log('🗄️ Base de datos cerrada');
    }
    process.exit(0);
});

// Iniciar servidor
startServer();
