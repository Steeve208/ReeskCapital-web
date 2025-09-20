#!/usr/bin/env node

/**
 * 🔍 VERIFICADOR DE ESTADO DE BASE DE DATOS
 * Verifica qué tablas existen y cuáles faltan
 */

const SUPABASE_URL = 'https://unevdceponbnmhvpzlzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4';

async function checkDatabaseStatus() {
    console.log('🔍 Verificando estado de la base de datos...\n');
    
    const requiredTables = [
        'users',
        'referrals', 
        'mining_sessions',
        'transactions',
        'user_equipment',
        'user_levels',
        'user_algorithms',
        'clans',
        'clan_members',
        'clan_chat',
        'marketplace_listings',
        'marketplace_purchases',
        'events',
        'user_event_progress',
        'seasons',
        'user_season_progress'
    ];
    
    const existingTables = [];
    const missingTables = [];
    
    for (const table of requiredTables) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            
            if (response.ok) {
                existingTables.push(table);
                console.log(`✅ ${table}: EXISTE`);
            } else {
                missingTables.push(table);
                console.log(`❌ ${table}: FALTA`);
            }
        } catch (error) {
            missingTables.push(table);
            console.log(`❌ ${table}: ERROR - ${error.message}`);
        }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Tablas existentes: ${existingTables.length}/${requiredTables.length}`);
    console.log(`❌ Tablas faltantes: ${missingTables.length}/${requiredTables.length}`);
    
    if (missingTables.length > 0) {
        console.log('\n🔧 TABLAS FALTANTES:');
        missingTables.forEach(table => console.log(`   - ${table}`));
        
        console.log('\n💡 SOLUCIÓN:');
        console.log('1. Ejecuta: node backend/run-advanced-migrations.js');
        console.log('2. O ejecuta manualmente el SQL en Supabase Dashboard');
        console.log('3. Archivo SQL: backend/advanced-systems-schema.sql');
    } else {
        console.log('\n🎉 ¡Todas las tablas están creadas!');
    }
}

checkDatabaseStatus().catch(console.error);
