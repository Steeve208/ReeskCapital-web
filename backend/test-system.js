#!/usr/bin/env node

/**
 * Script de prueba para verificar el sistema RSC Mining Backend
 * Uso: node test-system.js
 */

const config = require('./config/env');
const { testConnection } = require('./config/database');
const { getCacheStats } = require('./config/cache');

console.log('🧪 Iniciando pruebas del sistema RSC Mining Backend...\n');

async function testSystem() {
  try {
    console.log('📋 Configuración del sistema:');
    console.log(`  - Entorno: ${config.app.nodeEnv}`);
    console.log(`  - Puerto: ${config.app.port}`);
    console.log(`  - Base de datos: ${config.database.url.replace(/\/\/.*@/, '//***:***@')}`);
    console.log(`  - JWT Secret: ${config.jwt.secret.substring(0, 20)}...`);
    console.log(`  - Admin JWT Secret: ${config.jwt.adminSecret.substring(0, 20)}...`);
    console.log(`  - Rate Limit: ${config.security.rateLimitMax} requests/${config.security.rateLimitWindowMs}ms`);
    console.log(`  - Cooldown: ${config.mining.cooldownSeconds}s`);
    console.log(`  - Recompensa: ${config.mining.rewardMin} - ${config.mining.rewardMax}`);
    console.log(`  - Límite diario: ${config.mining.dailyCap}`);
    console.log(`  - Caché TTL: ${config.cache.ttlSeconds}s`);
    console.log('');

    // Probar caché
    console.log('💾 Probando sistema de caché...');
    const cacheStats = getCacheStats();
    console.log(`  - Keys en caché: ${cacheStats.keys}`);
    console.log(`  - Hits: ${cacheStats.hits}`);
    console.log(`  - Misses: ${cacheStats.misses}`);
    console.log('');

    // Probar conexión a base de datos
    console.log('🔌 Probando conexión a base de datos...');
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('  ✅ Conexión a base de datos exitosa');
    } else {
      console.log('  ❌ No se pudo conectar a la base de datos');
      console.log('  💡 Asegúrate de que PostgreSQL esté ejecutándose');
      console.log('  💡 O usa Docker: docker-compose up -d postgres');
    }
    console.log('');

    // Verificar módulos
    console.log('📦 Verificando módulos del sistema...');
    
    try {
      require('./security/auth');
      console.log('  ✅ Módulo de autenticación');
    } catch (error) {
      console.log('  ❌ Error en módulo de autenticación:', error.message);
    }
    
    try {
      require('./security/rateLimit');
      console.log('  ✅ Módulo de rate limiting');
    } catch (error) {
      console.log('  ❌ Error en módulo de rate limiting:', error.message);
    }
    
    try {
      require('./services/miningService');
      console.log('  ✅ Servicio de minería');
    } catch (error) {
      console.log('  ❌ Error en servicio de minería:', error.message);
    }
    
    try {
      require('./services/leaderboardService');
      console.log('  ✅ Servicio de leaderboard');
    } catch (error) {
      console.log('  ❌ Error en servicio de leaderboard:', error.message);
    }
    
    try {
      require('./routes/auth');
      console.log('  ✅ Rutas de autenticación');
    } catch (error) {
      console.log('  ❌ Error en rutas de autenticación:', error.message);
    }
    
    try {
      require('./routes/mine');
      console.log('  ✅ Rutas de minería');
    } catch (error) {
      console.log('  ❌ Error en rutas de minería:', error.message);
    }
    
    try {
      require('./routes/admin');
      console.log('  ✅ Rutas de administración');
    } catch (error) {
      console.log('  ❌ Error en rutas de administración:', error.message);
    }
    
    try {
      require('./routes/public');
      console.log('  ✅ Rutas públicas');
    } catch (error) {
      console.log('  ❌ Error en rutas públicas:', error.message);
    }
    console.log('');

    // Verificar utilidades
    console.log('🔧 Verificando utilidades...');
    
    try {
      require('./utils/pagination');
      console.log('  ✅ Utilidades de paginación');
    } catch (error) {
      console.log('  ❌ Error en utilidades de paginación:', error.message);
    }
    
    try {
      require('./utils/csv');
      console.log('  ✅ Utilidades de CSV');
    } catch (error) {
      console.log('  ❌ Error en utilidades de CSV:', error.message);
    }
    
    try {
      require('./utils/time');
      console.log('  ✅ Utilidades de tiempo');
    } catch (error) {
      console.log('  ❌ Error en utilidades de tiempo:', error.message);
    }
    console.log('');

    // Verificar migraciones
    console.log('🗄️ Verificando migraciones...');
    const fs = require('fs');
    const path = require('path');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
      console.log(`  ✅ Directorio de migraciones encontrado`);
      console.log(`  📁 Migraciones disponibles: ${migrationFiles.length}`);
      migrationFiles.forEach(file => {
        console.log(`    - ${file}`);
      });
    } else {
      console.log('  ❌ Directorio de migraciones no encontrado');
    }
    console.log('');

    // Verificar Docker
    console.log('🐳 Verificando archivos Docker...');
    
    if (fs.existsSync(path.join(__dirname, 'Dockerfile'))) {
      console.log('  ✅ Dockerfile encontrado');
    } else {
      console.log('  ❌ Dockerfile no encontrado');
    }
    
    if (fs.existsSync(path.join(__dirname, 'docker-compose.yml'))) {
      console.log('  ✅ docker-compose.yml encontrado');
    } else {
      console.log('  ❌ docker-compose.yml no encontrado');
    }
    console.log('');

    // Resumen
    console.log('📊 Resumen de la verificación:');
    if (dbConnected) {
      console.log('  🟢 Sistema listo para usar');
      console.log('  💡 Para iniciar: npm run dev');
      console.log('  💡 Para Docker: docker-compose up -d');
    } else {
      console.log('  🟡 Sistema configurado pero sin base de datos');
      console.log('  💡 Inicia PostgreSQL primero');
      console.log('  💡 O usa: docker-compose up -d postgres');
    }
    console.log('');

  } catch (error) {
    console.error('💥 Error durante la verificación:', error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
testSystem();
