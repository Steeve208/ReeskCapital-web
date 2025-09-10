/**
 * SISTEMA DE DIAGNÓSTICO RSC
 * 
 * Diagnóstica problemas del sistema y proporciona soluciones
 * - Detección de conflictos
 * - Análisis de rendimiento
 * - Verificación de integridad
 * - Recomendaciones de mejora
 */

class SystemDiagnostics {
    constructor() {
        this.diagnostics = [];
        this.recommendations = [];
        this.performanceMetrics = {};
    }

    /**
     * Ejecutar diagnóstico completo
     */
    async runFullDiagnostics() {
        console.log('🔍 Iniciando diagnóstico completo del sistema RSC...');
        
        this.diagnostics = [];
        this.recommendations = [];
        
        // Ejecutar diagnósticos
        await this.diagnoseSupabaseConfig();
        await this.diagnoseAuthSystem();
        await this.diagnoseMiningSystem();
        await this.diagnoseDataIntegrity();
        await this.diagnosePerformance();
        await this.diagnoseBrowserCompatibility();
        
        // Generar recomendaciones
        this.generateRecommendations();
        
        // Mostrar resultados
        this.displayResults();
        
        return {
            diagnostics: this.diagnostics,
            recommendations: this.recommendations,
            performance: this.performanceMetrics
        };
    }

    /**
     * Diagnosticar configuración de Supabase
     */
    async diagnoseSupabaseConfig() {
        const issues = [];
        const warnings = [];
        
        // Verificar múltiples configuraciones
        const supabaseConfigs = [
            { name: 'supabase (unified)', exists: !!window.supabase },
            { name: 'SUPABASE_CONFIG', exists: !!window.SUPABASE_CONFIG },
            { name: 'SupabaseDirect', exists: !!window.SupabaseDirect },
            { name: 'supabaseClient', exists: !!window.supabaseClient }
        ];
        
        const activeConfigs = supabaseConfigs.filter(config => config.exists);
        
        if (activeConfigs.length > 1) {
            issues.push({
                type: 'multiple_supabase_configs',
                severity: 'high',
                message: `Múltiples configuraciones de Supabase detectadas: ${activeConfigs.map(c => c.name).join(', ')}`,
                solution: 'Usar solo la configuración unificada en scripts/config/supabase.js'
            });
        }
        
        // Verificar conexión
        if (window.supabase) {
            try {
                const { data, error } = await window.supabase
                    .from('users')
                    .select('count')
                    .limit(1);
                
                if (error) {
                    issues.push({
                        type: 'supabase_connection_error',
                        severity: 'critical',
                        message: `Error conectando con Supabase: ${error.message}`,
                        solution: 'Verificar configuración de Supabase y conectividad de red'
                    });
                } else {
                    console.log('✅ Conexión con Supabase verificada');
                }
            } catch (error) {
                issues.push({
                    type: 'supabase_connection_failed',
                    severity: 'critical',
                    message: `No se pudo conectar con Supabase: ${error.message}`,
                    solution: 'Verificar configuración de Supabase'
                });
            }
        } else {
            issues.push({
                type: 'no_supabase_config',
                severity: 'critical',
                message: 'No hay configuración de Supabase disponible',
                solution: 'Cargar scripts/config/supabase.js'
            });
        }
        
        this.diagnostics.push({
            category: 'Supabase Configuration',
            issues: issues,
            warnings: warnings,
            status: issues.length === 0 ? 'ok' : 'error'
        });
    }

    /**
     * Diagnosticar sistema de autenticación
     */
    async diagnoseAuthSystem() {
        const issues = [];
        const warnings = [];
        
        // Verificar sistemas de autenticación
        const authSystems = [
            { name: 'RSCAuth (legacy)', exists: !!window.RSCAuth },
            { name: 'SecureAuth (new)', exists: !!window.SecureAuth }
        ];
        
        const activeAuthSystems = authSystems.filter(system => system.exists);
        
        if (activeAuthSystems.length > 1) {
            warnings.push({
                type: 'multiple_auth_systems',
                message: `Múltiples sistemas de autenticación: ${activeAuthSystems.map(s => s.name).join(', ')}`,
                solution: 'Migrar completamente a SecureAuth'
            });
        }
        
        // Verificar estado de autenticación
        if (window.RSCStore) {
            const state = window.RSCStore.getState();
            if (state.isAuthenticated && !state.user) {
                issues.push({
                    type: 'auth_state_inconsistent',
                    severity: 'medium',
                    message: 'Estado de autenticación inconsistente: isAuthenticated=true pero user=null',
                    solution: 'Sincronizar estado de autenticación'
                });
            }
        }
        
        this.diagnostics.push({
            category: 'Authentication System',
            issues: issues,
            warnings: warnings,
            status: issues.length === 0 ? 'ok' : 'warning'
        });
    }

    /**
     * Diagnosticar sistema de minería
     */
    async diagnoseMiningSystem() {
        const issues = [];
        const warnings = [];
        
        // Verificar sistemas de minería
        const miningSystems = [
            { name: 'RSCMiningCore (legacy)', exists: !!window.RSCMiningCore },
            { name: 'MiningEngine (new)', exists: !!window.MiningEngine }
        ];
        
        const activeMiningSystems = miningSystems.filter(system => system.exists);
        
        if (activeMiningSystems.length > 1) {
            warnings.push({
                type: 'multiple_mining_systems',
                message: `Múltiples sistemas de minería: ${activeMiningSystems.map(s => s.name).join(', ')}`,
                solution: 'Migrar completamente a MiningEngine'
            });
        }
        
        // Verificar estado de minería
        if (window.RSCStore) {
            const state = window.RSCStore.getState();
            if (state.mining.isActive && !state.mining.sessionId) {
                issues.push({
                    type: 'mining_state_inconsistent',
                    severity: 'medium',
                    message: 'Estado de minería inconsistente: isActive=true pero sessionId=null',
                    solution: 'Reiniciar sesión de minería'
                });
            }
        }
        
        this.diagnostics.push({
            category: 'Mining System',
            issues: issues,
            warnings: warnings,
            status: issues.length === 0 ? 'ok' : 'warning'
        });
    }

    /**
     * Diagnosticar integridad de datos
     */
    async diagnoseDataIntegrity() {
        const issues = [];
        const warnings = [];
        
        // Verificar datos en localStorage
        const requiredKeys = [
            'rsc_user',
            'rsc_wallet_balance',
            'rsc_mining_state'
        ];
        
        const missingKeys = requiredKeys.filter(key => !localStorage.getItem(key));
        
        if (missingKeys.length > 0) {
            warnings.push({
                type: 'missing_localStorage_data',
                message: `Datos faltantes en localStorage: ${missingKeys.join(', ')}`,
                solution: 'Esto es normal para usuarios nuevos'
            });
        }
        
        // Verificar integridad de datos de usuario
        const userData = localStorage.getItem('rsc_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (!user.email || !user.username) {
                    issues.push({
                        type: 'invalid_user_data',
                        severity: 'medium',
                        message: 'Datos de usuario inválidos: faltan email o username',
                        solution: 'Reautenticar usuario'
                    });
                }
            } catch (error) {
                issues.push({
                    type: 'corrupted_user_data',
                    severity: 'high',
                    message: 'Datos de usuario corruptos en localStorage',
                    solution: 'Limpiar datos y reautenticar'
                });
            }
        }
        
        this.diagnostics.push({
            category: 'Data Integrity',
            issues: issues,
            warnings: warnings,
            status: issues.length === 0 ? 'ok' : 'warning'
        });
    }

    /**
     * Diagnosticar rendimiento
     */
    async diagnosePerformance() {
        const issues = [];
        const warnings = [];
        
        // Métricas de memoria
        if (performance.memory) {
            const memory = performance.memory;
            const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
            
            this.performanceMetrics.memory = {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
                usage: memoryUsage
            };
            
            if (memoryUsage > 0.8) {
                warnings.push({
                    type: 'high_memory_usage',
                    message: `Uso alto de memoria: ${(memoryUsage * 100).toFixed(1)}%`,
                    solution: 'Considerar optimizaciones de memoria'
                });
            }
        }
        
        // Verificar scripts cargados
        const scripts = document.querySelectorAll('script[src]');
        const scriptCount = scripts.length;
        
        this.performanceMetrics.scripts = {
            count: scriptCount,
            total: scripts.length
        };
        
        if (scriptCount > 20) {
            warnings.push({
                type: 'too_many_scripts',
                message: `Muchos scripts cargados: ${scriptCount}`,
                solution: 'Considerar consolidar scripts'
            });
        }
        
        this.diagnostics.push({
            category: 'Performance',
            issues: issues,
            warnings: warnings,
            status: issues.length === 0 ? 'ok' : 'warning'
        });
    }

    /**
     * Diagnosticar compatibilidad del navegador
     */
    async diagnoseBrowserCompatibility() {
        const issues = [];
        const warnings = [];
        
        // Verificar soporte de ES6 modules
        const supportsES6Modules = 'noModule' in HTMLScriptElement.prototype;
        
        if (!supportsES6Modules) {
            warnings.push({
                type: 'no_es6_modules_support',
                message: 'Navegador no soporta ES6 modules',
                solution: 'Usar sistema legacy o actualizar navegador'
            });
        }
        
        // Verificar soporte de localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (error) {
            issues.push({
                type: 'no_localStorage_support',
                severity: 'critical',
                message: 'localStorage no disponible',
                solution: 'Usar navegador compatible o modo incógnito'
            });
        }
        
        // Verificar soporte de fetch
        if (!window.fetch) {
            issues.push({
                type: 'no_fetch_support',
                severity: 'critical',
                message: 'Fetch API no disponible',
                solution: 'Actualizar navegador o usar polyfill'
            });
        }
        
        this.diagnostics.push({
            category: 'Browser Compatibility',
            issues: issues,
            warnings: warnings,
            status: issues.length === 0 ? 'ok' : 'warning'
        });
    }

    /**
     * Generar recomendaciones
     */
    generateRecommendations() {
        const allIssues = this.diagnostics.flatMap(d => d.issues);
        const allWarnings = this.diagnostics.flatMap(d => d.warnings);
        
        // Recomendaciones basadas en problemas críticos
        const criticalIssues = allIssues.filter(i => i.severity === 'critical');
        if (criticalIssues.length > 0) {
            this.recommendations.push({
                priority: 'high',
                title: 'Problemas Críticos Detectados',
                description: 'Hay problemas críticos que impiden el funcionamiento del sistema',
                actions: criticalIssues.map(i => i.solution)
            });
        }
        
        // Recomendaciones de migración
        const migrationWarnings = allWarnings.filter(w => w.type.includes('multiple'));
        if (migrationWarnings.length > 0) {
            this.recommendations.push({
                priority: 'medium',
                title: 'Migración Recomendada',
                description: 'Hay sistemas duplicados que deberían migrarse al sistema unificado',
                actions: [
                    'Ejecutar MigrationManager.startMigration()',
                    'Usar solo el sistema unificado RSC',
                    'Eliminar referencias a sistemas legacy'
                ]
            });
        }
        
        // Recomendaciones de rendimiento
        const performanceWarnings = allWarnings.filter(w => w.type.includes('performance') || w.type.includes('memory'));
        if (performanceWarnings.length > 0) {
            this.recommendations.push({
                priority: 'low',
                title: 'Optimización de Rendimiento',
                description: 'Se pueden hacer mejoras de rendimiento',
                actions: [
                    'Consolidar scripts',
                    'Optimizar uso de memoria',
                    'Implementar lazy loading'
                ]
            });
        }
    }

    /**
     * Mostrar resultados
     */
    displayResults() {
        console.log('📊 Resultados del diagnóstico:');
        
        this.diagnostics.forEach(diagnostic => {
            console.log(`\n📋 ${diagnostic.category}:`);
            console.log(`   Estado: ${diagnostic.status}`);
            
            if (diagnostic.issues.length > 0) {
                console.log('   ❌ Problemas:');
                diagnostic.issues.forEach(issue => {
                    console.log(`      - ${issue.message}`);
                });
            }
            
            if (diagnostic.warnings.length > 0) {
                console.log('   ⚠️ Advertencias:');
                diagnostic.warnings.forEach(warning => {
                    console.log(`      - ${warning.message}`);
                });
            }
        });
        
        if (this.recommendations.length > 0) {
            console.log('\n💡 Recomendaciones:');
            this.recommendations.forEach(rec => {
                console.log(`\n   ${rec.priority.toUpperCase()}: ${rec.title}`);
                console.log(`   ${rec.description}`);
                rec.actions.forEach(action => {
                    console.log(`   - ${action}`);
                });
            });
        }
    }

    /**
     * Obtener resumen
     */
    getSummary() {
        const totalIssues = this.diagnostics.reduce((sum, d) => sum + d.issues.length, 0);
        const totalWarnings = this.diagnostics.reduce((sum, d) => sum + d.warnings.length, 0);
        const criticalIssues = this.diagnostics
            .flatMap(d => d.issues)
            .filter(i => i.severity === 'critical').length;
        
        return {
            totalIssues,
            totalWarnings,
            criticalIssues,
            status: criticalIssues > 0 ? 'critical' : totalIssues > 0 ? 'warning' : 'ok',
            diagnostics: this.diagnostics.length,
            recommendations: this.recommendations.length
        };
    }
}

// Crear instancia global
const systemDiagnostics = new SystemDiagnostics();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.SystemDiagnostics = systemDiagnostics;
}

export default systemDiagnostics;
