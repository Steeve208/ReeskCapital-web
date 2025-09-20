/* ================================
   CLAN SYSTEM - RSC MINING
================================ */

/**
 * 👥 SISTEMA DE CLANES/GUILDS
 * 
 * Sistema completo de clanes para mineros
 * - Crear y unirse a clanes
 * - Competencia entre clanes
 * - Recompensas grupales
 * - Chat de clan
 * - Eventos de clan
 */

class ClanSystem {
    constructor() {
        this.userClan = {
            clanId: null,
            clanName: null,
            role: null, // 'leader', 'officer', 'member'
            joinedAt: null,
            contribution: 0,
            lastActive: null
        };

        this.clanData = {
            id: null,
            name: null,
            description: null,
            level: 1,
            xp: 0,
            members: [],
            maxMembers: 10,
            createdBy: null,
            createdAt: null,
            totalMining: 0,
            totalContribution: 0,
            achievements: [],
            chat: []
        };

        this.initializeClanSystem();
    }

    initializeClanSystem() {
        // Cargar datos del clan del usuario desde localStorage
        const stored = localStorage.getItem('rsc_user_clan');
        if (stored) {
            this.userClan = { ...this.userClan, ...JSON.parse(stored) };
        }

        // Si el usuario está en un clan, cargar datos del clan
        if (this.userClan.clanId) {
            this.loadClanData();
        }
    }

    async createClan(name, description) {
        try {
            const user = window.supabaseIntegration?.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Verificar si el usuario ya está en un clan
            if (this.userClan.clanId) {
                throw new Error('Ya estás en un clan');
            }

            // Verificar nivel mínimo (nivel 6)
            const userLevel = window.levelSystem?.userLevel?.level || 1;
            if (userLevel < 6) {
                throw new Error('Necesitas nivel 6 para crear un clan');
            }

            // Crear clan
            const clanId = `clan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const clanData = {
                id: clanId,
                name: name,
                description: description,
                level: 1,
                xp: 0,
                members: [{
                    userId: user.id,
                    username: user.username,
                    role: 'leader',
                    joinedAt: new Date().toISOString(),
                    contribution: 0
                }],
                maxMembers: 10,
                createdBy: user.id,
                createdAt: new Date().toISOString(),
                totalMining: 0,
                totalContribution: 0,
                achievements: [],
                chat: []
            };

            // Guardar en Supabase
            const response = await window.supabaseIntegration.makeRequest(
                'POST',
                '/rest/v1/clans',
                clanData
            );

            if (!response.ok) {
                throw new Error('Error creando clan');
            }

            // Actualizar datos del usuario
            this.userClan = {
                clanId: clanId,
                clanName: name,
                role: 'leader',
                joinedAt: new Date().toISOString(),
                contribution: 0,
                lastActive: new Date().toISOString()
            };

            this.clanData = clanData;
            this.saveClanData();

            console.log(`✅ Clan "${name}" creado exitosamente`);
            return {
                success: true,
                clan: clanData
            };

        } catch (error) {
            console.error('❌ Error creando clan:', error);
            throw error;
        }
    }

    async joinClan(clanId) {
        try {
            const user = window.supabaseIntegration?.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Verificar si el usuario ya está en un clan
            if (this.userClan.clanId) {
                throw new Error('Ya estás en un clan');
            }

            // Obtener datos del clan
            const clanResponse = await window.supabaseIntegration.makeRequest(
                'GET',
                `/rest/v1/clans?id=eq.${clanId}&select=*`
            );

            if (!clanResponse.ok) {
                throw new Error('Error obteniendo datos del clan');
            }

            const clans = await clanResponse.json();
            if (clans.length === 0) {
                throw new Error('Clan no encontrado');
            }

            const clan = clans[0];

            // Verificar si hay espacio
            if (clan.members.length >= clan.maxMembers) {
                throw new Error('El clan está lleno');
            }

            // Agregar usuario al clan
            const newMember = {
                userId: user.id,
                username: user.username,
                role: 'member',
                joinedAt: new Date().toISOString(),
                contribution: 0
            };

            clan.members.push(newMember);

            // Actualizar clan en Supabase
            const updateResponse = await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/clans?id=eq.${clanId}`,
                { members: clan.members }
            );

            if (!updateResponse.ok) {
                throw new Error('Error uniéndose al clan');
            }

            // Actualizar datos del usuario
            this.userClan = {
                clanId: clanId,
                clanName: clan.name,
                role: 'member',
                joinedAt: new Date().toISOString(),
                contribution: 0,
                lastActive: new Date().toISOString()
            };

            this.clanData = clan;
            this.saveClanData();

            console.log(`✅ Te uniste al clan "${clan.name}"`);
            return {
                success: true,
                clan: clan
            };

        } catch (error) {
            console.error('❌ Error uniéndose al clan:', error);
            throw error;
        }
    }

    async leaveClan() {
        try {
            if (!this.userClan.clanId) {
                throw new Error('No estás en un clan');
            }

            const user = window.supabaseIntegration?.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Remover usuario del clan
            this.clanData.members = this.clanData.members.filter(
                member => member.userId !== user.id
            );

            // Actualizar clan en Supabase
            const updateResponse = await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/clans?id=eq.${this.userClan.clanId}`,
                { members: this.clanData.members }
            );

            if (!updateResponse.ok) {
                throw new Error('Error dejando el clan');
            }

            // Limpiar datos del usuario
            this.userClan = {
                clanId: null,
                clanName: null,
                role: null,
                joinedAt: null,
                contribution: 0,
                lastActive: null
            };

            this.clanData = {
                id: null,
                name: null,
                description: null,
                level: 1,
                xp: 0,
                members: [],
                maxMembers: 10,
                createdBy: null,
                createdAt: null,
                totalMining: 0,
                totalContribution: 0,
                achievements: [],
                chat: []
            };

            this.saveClanData();

            console.log('✅ Dejaste el clan');
            return {
                success: true
            };

        } catch (error) {
            console.error('❌ Error dejando el clan:', error);
            throw error;
        }
    }

    async loadClanData() {
        try {
            if (!this.userClan.clanId) return;

            const response = await window.supabaseIntegration.makeRequest(
                'GET',
                `/rest/v1/clans?id=eq.${this.userClan.clanId}&select=*`
            );

            if (response.ok) {
                const clans = await response.json();
                if (clans.length > 0) {
                    this.clanData = clans[0];
                }
            }
        } catch (error) {
            console.error('❌ Error cargando datos del clan:', error);
        }
    }

    async searchClans(query = '', limit = 20) {
        try {
            let url = `/rest/v1/clans?select=*&limit=${limit}`;
            
            if (query) {
                url += `&name=ilike.%${query}%`;
            }

            const response = await window.supabaseIntegration.makeRequest('GET', url);
            
            if (response.ok) {
                const clans = await response.json();
                return clans.map(clan => ({
                    id: clan.id,
                    name: clan.name,
                    description: clan.description,
                    level: clan.level,
                    memberCount: clan.members.length,
                    maxMembers: clan.maxMembers,
                    totalMining: clan.totalMining,
                    createdAt: clan.createdAt
                }));
            }

            return [];
        } catch (error) {
            console.error('❌ Error buscando clanes:', error);
            return [];
        }
    }

    async addContribution(amount) {
        try {
            if (!this.userClan.clanId) return;

            // Actualizar contribución del usuario
            this.userClan.contribution += amount;
            this.userClan.lastActive = new Date().toISOString();

            // Actualizar contribución del clan
            this.clanData.totalContribution += amount;
            this.clanData.totalMining += amount;

            // Actualizar miembro en el clan
            const memberIndex = this.clanData.members.findIndex(
                member => member.userId === window.supabaseIntegration.user.id
            );
            
            if (memberIndex !== -1) {
                this.clanData.members[memberIndex].contribution += amount;
            }

            // Sincronizar con Supabase
            await this.syncClanToSupabase();

            this.saveClanData();

            console.log(`✅ Contribución agregada: +${amount} RSC`);
        } catch (error) {
            console.error('❌ Error agregando contribución:', error);
        }
    }

    async sendClanMessage(message) {
        try {
            if (!this.userClan.clanId) {
                throw new Error('No estás en un clan');
            }

            const user = window.supabaseIntegration?.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const chatMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: user.id,
                username: user.username,
                message: message,
                timestamp: new Date().toISOString(),
                role: this.userClan.role
            };

            // Agregar mensaje al chat del clan
            this.clanData.chat.push(chatMessage);

            // Mantener solo los últimos 100 mensajes
            if (this.clanData.chat.length > 100) {
                this.clanData.chat = this.clanData.chat.slice(-100);
            }

            // Sincronizar con Supabase
            await this.syncClanToSupabase();

            this.saveClanData();

            console.log(`✅ Mensaje enviado al clan`);
            return {
                success: true,
                message: chatMessage
            };

        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            throw error;
        }
    }

    getClanRanking() {
        if (!this.clanData.members) return [];

        return this.clanData.members
            .sort((a, b) => b.contribution - a.contribution)
            .map((member, index) => ({
                rank: index + 1,
                username: member.username,
                contribution: member.contribution,
                role: member.role,
                joinedAt: member.joinedAt
            }));
    }

    getClanStats() {
        if (!this.clanData.id) return null;

        return {
            name: this.clanData.name,
            level: this.clanData.level,
            xp: this.clanData.xp,
            memberCount: this.clanData.members.length,
            maxMembers: this.clanData.maxMembers,
            totalMining: this.clanData.totalMining,
            totalContribution: this.clanData.totalContribution,
            averageContribution: this.clanData.members.length > 0 
                ? this.clanData.totalContribution / this.clanData.members.length 
                : 0
        };
    }

    async syncClanToSupabase() {
        try {
            if (!this.userClan.clanId || !window.supabaseIntegration?.user?.isAuthenticated) return;

            // Sincronizar datos del clan
            const clanResponse = await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/clans?id=eq.${this.userClan.clanId}`,
                {
                    level: this.clanData.level,
                    xp: this.clanData.xp,
                    members: this.clanData.members,
                    totalMining: this.clanData.totalMining,
                    totalContribution: this.clanData.totalContribution,
                    chat: this.clanData.chat,
                    last_updated: new Date().toISOString()
                }
            );

            if (!clanResponse.ok) {
                throw new Error('Error sincronizando clan');
            }

            console.log('✅ Clan sincronizado con Supabase');
        } catch (error) {
            console.error('❌ Error sincronizando clan:', error);
        }
    }

    saveClanData() {
        localStorage.setItem('rsc_user_clan', JSON.stringify(this.userClan));
    }

    isInClan() {
        return !!this.userClan.clanId;
    }

    getClanRole() {
        return this.userClan.role;
    }

    canManageClan() {
        return this.userClan.role === 'leader' || this.userClan.role === 'officer';
    }
}

// Crear instancia global
window.clanSystem = new ClanSystem();

console.log('👥 Clan System cargado');

