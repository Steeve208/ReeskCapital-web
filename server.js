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

// ===== RUTA APK - PRIMERO, ANTES DE CUALQUIER MIDDLEWARE =====
// Esta ruta maneja la descarga del APK de forma binaria pura
app.get('/downloads/rsc-mining.apk', (req, res) => {
    const apkPath = path.join(__dirname, 'public', 'downloads', 'rsc-mining.apk');
    
    // Verificar existencia
    if (!fs.existsSync(apkPath)) {
        console.error('❌ APK no encontrado:', apkPath);
        return res.status(404).send('APK no encontrado');
    }
    
    // Leer archivo completo como buffer binario
    fs.readFile(apkPath, (err, data) => {
        if (err) {
            console.error('❌ Error leyendo APK:', err);
            return res.status(500).send('Error al leer el archivo');
        }
        
        // Establecer headers
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="rsc-mining.apk"');
        res.setHeader('Content-Length', data.length);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Enviar buffer binario directamente
        res.send(data);
        
        console.log('✅ APK enviado:', data.length, 'bytes');
    });
});

// Middleware - EXCLUIR /downloads/ del procesamiento JSON
app.use(cors());
app.use((req, res, next) => {
    // No procesar JSON para rutas de descarga
    if (req.path.startsWith('/downloads/')) {
        return next();
    }
    express.json()(req, res, next);
});

// Middleware estático - EXCLUIR /downloads/ explícitamente
app.use((req, res, next) => {
    if (req.path.startsWith('/downloads/')) {
        return next(); // Ya manejado por la ruta específica arriba
    }
    express.static(path.join(__dirname), {
        setHeaders: (res, filePath, stat) => {
            // No hacer nada especial, dejar que Express maneje los tipos MIME
        }
    })(req, res, next);
});

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
