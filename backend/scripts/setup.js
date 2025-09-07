/**
 * RSC MINING BACKEND SETUP SCRIPT
 * 
 * Script de configuración automática para el backend
 * - Verificar dependencias
 * - Configurar base de datos
 * - Crear usuario de prueba
 * - Validar configuración
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BackendSetup {
    constructor() {
        this.supabase = null;
        this.config = this.loadConfig();
    }

    /**
     * Cargar configuración desde .env
     */
    loadConfig() {
        try {
            const envPath = join(__dirname, '../.env');
            const envContent = readFileSync(envPath, 'utf8');
            
            const config = {};
            envContent.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    config[key.trim()] = value.trim();
                }
            });
            
            return config;
        } catch (error) {
            console.error('❌ Error cargando configuración:', error.message);
            console.log('💡 Crea un archivo .env basado en env.example');
            process.exit(1);
        }
    }

    /**
     * Inicializar cliente de Supabase
     */
    initializeSupabase() {
        try {
            this.supabase = createClient(
                this.config.SUPABASE_URL,
                this.config.SUPABASE_SERVICE_ROLE_KEY
            );
            console.log('✅ Cliente de Supabase inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error.message);
            process.exit(1);
        }
    }

    /**
     * Verificar conexión a Supabase
     */
    async checkConnection() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('count')
                .limit(1);

            if (error) {
                throw new Error(error.message);
            }

            console.log('✅ Conexión a Supabase verificada');
            return true;
        } catch (error) {
            console.error('❌ Error conectando a Supabase:', error.message);
            return false;
        }
    }

    /**
     * Ejecutar script SQL de configuración
     */
    async setupDatabase() {
        try {
            console.log('📊 Configurando base de datos...');
            
            // Leer script SQL
            const sqlPath = join(__dirname, '../supabase-schema.sql');
            const sqlContent = readFileSync(sqlPath, 'utf8');
            
            // Ejecutar script
            const { error } = await this.supabase.rpc('exec_sql', {
                sql: sqlContent
            });

            if (error) {
                throw new Error(error.message);
            }

            console.log('✅ Base de datos configurada');
            return true;
        } catch (error) {
            console.error('❌ Error configurando base de datos:', error.message);
            console.log('💡 Ejecuta manualmente el script SQL en Supabase');
            return false;
        }
    }

    /**
     * Crear usuario de prueba
     */
    async createTestUser() {
        try {
            console.log('👤 Creando usuario de prueba...');
            
            const testUser = {
                email: 'test@rscchain.com',
                username: 'testuser',
                referralCode: 'TEST12345'
            };

            // Verificar si ya existe
            const { data: existingUser } = await this.supabase
                .from('users')
                .select('id')
                .eq('email', testUser.email)
                .single();

            if (existingUser) {
                console.log('ℹ️ Usuario de prueba ya existe');
                return existingUser.id;
            }

            // Crear usuario
            const { data, error } = await this.supabase.rpc('register_user', {
                p_email: testUser.email,
                p_username: testUser.username,
                p_referral_code: null
            });

            if (error) {
                throw new Error(error.message);
            }

            console.log('✅ Usuario de prueba creado:', data.user_id);
            console.log('📧 Email:', testUser.email);
            console.log('👤 Username:', testUser.username);
            console.log('🔑 Código de referral:', data.referral_code);
            
            return data.user_id;
        } catch (error) {
            console.error('❌ Error creando usuario de prueba:', error.message);
            return null;
        }
    }

    /**
     * Crear usuario referido de prueba
     */
    async createReferredUser(referralCode) {
        try {
            console.log('👥 Creando usuario referido de prueba...');
            
            const referredUser = {
                email: 'referred@rscchain.com',
                username: 'referreduser',
                referralCode: referralCode
            };

            const { data, error } = await this.supabase.rpc('register_user', {
                p_email: referredUser.email,
                p_username: referredUser.username,
                p_referral_code: referralCode
            });

            if (error) {
                throw new Error(error.message);
            }

            console.log('✅ Usuario referido creado:', data.user_id);
            console.log('📧 Email:', referredUser.email);
            console.log('👤 Username:', referredUser.username);
            console.log('🔗 Referido por:', referralCode);
            
            return data.user_id;
        } catch (error) {
            console.error('❌ Error creando usuario referido:', error.message);
            return null;
        }
    }

    /**
     * Probar funcionalidad de minería
     */
    async testMiningFunctionality(userId) {
        try {
            console.log('⛏️ Probando funcionalidad de minería...');
            
            // Crear sesión de minería
            const sessionId = `test-session-${Date.now()}`;
            const startTime = Date.now();
            const endTime = startTime + (24 * 60 * 60 * 1000); // 24 horas

            const { data: session, error: sessionError } = await this.supabase
                .from('mining_sessions')
                .insert({
                    user_id: userId,
                    session_id: sessionId,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                    duration_ms: endTime - startTime,
                    hash_rate: 1000,
                    efficiency: 100,
                    status: 'active'
                })
                .select()
                .single();

            if (sessionError) {
                throw new Error(sessionError.message);
            }

            console.log('✅ Sesión de minería creada:', sessionId);

            // Simular minería
            const tokensMined = 1.234567;
            const { error: updateError } = await this.supabase
                .from('mining_sessions')
                .update({
                    tokens_mined: tokensMined,
                    updated_at: new Date().toISOString()
                })
                .eq('session_id', sessionId);

            if (updateError) {
                throw new Error(updateError.message);
            }

            // Actualizar balance
            const { error: balanceError } = await this.supabase.rpc('update_user_balance', {
                p_user_id: userId,
                p_amount: tokensMined,
                p_transaction_type: 'mining',
                p_description: 'Test mining session'
            });

            if (balanceError) {
                throw new Error(balanceError.message);
            }

            console.log('✅ Funcionalidad de minería probada');
            return true;
        } catch (error) {
            console.error('❌ Error probando minería:', error.message);
            return false;
        }
    }

    /**
     * Validar configuración completa
     */
    async validateSetup() {
        try {
            console.log('🔍 Validando configuración...');
            
            // Verificar tablas
            const tables = ['users', 'referrals', 'mining_sessions', 'transactions', 'referral_codes'];
            
            for (const table of tables) {
                const { error } = await this.supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    throw new Error(`Tabla ${table} no encontrada: ${error.message}`);
                }
            }

            console.log('✅ Todas las tablas verificadas');

            // Verificar funciones
            const functions = ['generate_referral_code', 'process_referral_commission', 'register_user', 'update_user_balance'];
            
            for (const func of functions) {
                try {
                    await this.supabase.rpc(func, {});
                } catch (error) {
                    if (!error.message.includes('missing')) {
                        throw new Error(`Función ${func} no encontrada: ${error.message}`);
                    }
                }
            }

            console.log('✅ Todas las funciones verificadas');
            return true;
        } catch (error) {
            console.error('❌ Error validando configuración:', error.message);
            return false;
        }
    }

    /**
     * Ejecutar setup completo
     */
    async run() {
        console.log('🚀 Iniciando configuración del backend RSC Mining...\n');

        try {
            // 1. Inicializar Supabase
            this.initializeSupabase();

            // 2. Verificar conexión
            const isConnected = await this.checkConnection();
            if (!isConnected) {
                console.log('❌ No se pudo conectar a Supabase');
                process.exit(1);
            }

            // 3. Configurar base de datos
            const dbConfigured = await this.setupDatabase();
            if (!dbConfigured) {
                console.log('⚠️ Base de datos no configurada automáticamente');
            }

            // 4. Validar configuración
            const isValid = await this.validateSetup();
            if (!isValid) {
                console.log('❌ Configuración inválida');
                process.exit(1);
            }

            // 5. Crear usuario de prueba
            const testUserId = await this.createTestUser();
            if (testUserId) {
                // 6. Crear usuario referido
                const { data: testUser } = await this.supabase
                    .from('users')
                    .select('referral_code')
                    .eq('id', testUserId)
                    .single();

                if (testUser) {
                    await this.createReferredUser(testUser.referral_code);
                }

                // 7. Probar minería
                await this.testMiningFunctionality(testUserId);
            }

            console.log('\n🎉 ¡Configuración completada exitosamente!');
            console.log('\n📋 Próximos pasos:');
            console.log('1. Inicia el servidor: npm start');
            console.log('2. Verifica la API: http://localhost:3000/health');
            console.log('3. Prueba los endpoints con Postman o curl');
            console.log('4. Integra con el frontend usando rsc-mining-backend-integration.js');

        } catch (error) {
            console.error('❌ Error durante la configuración:', error.message);
            process.exit(1);
        }
    }
}

// Ejecutar setup
const setup = new BackendSetup();
setup.run();
