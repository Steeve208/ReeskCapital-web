#!/usr/bin/env node

/**
 * Script rápido para iniciar el backend
 * Uso: node start-backend.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando backend RSC Mining...\n');

// Verificar si estamos en el directorio correcto
const backendDir = __dirname;
const packageJson = require('./package.json');

console.log('📦 Verificando dependencias...');

// Iniciar el servidor
const server = spawn('node', ['index.js'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Error iniciando servidor:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Servidor terminó con código ${code}`);
    process.exit(code);
  }
});

// Manejar señales
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo servidor...');
  server.kill('SIGTERM');
  process.exit(0);
});

