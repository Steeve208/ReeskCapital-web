/**
 * 📱 TELEGRAM SERVICE
 * Servicio para interactuar con Telegram Bot API
 * 
 * Requiere:
 * - Bot token de Telegram (obtenido de @BotFather)
 * - Bot agregado al grupo de Telegram
 */

const axios = require('axios');
const { supabase } = require('../config/supabase');

class TelegramService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.groupId = process.env.TELEGRAM_GROUP_ID;
        this.apiUrl = this.botToken ? `https://api.telegram.org/bot${this.botToken}` : null;
    }

    /**
     * Verificar si un usuario está en el grupo
     */
    async checkUserInGroup(telegramUserId, chatId = null) {
        if (!this.apiUrl) {
            console.warn('Telegram Bot Token no configurado');
            return false;
        }

        try {
            const targetChatId = chatId || this.groupId;
            const response = await axios.get(`${this.apiUrl}/getChatMember`, {
                params: {
                    chat_id: targetChatId,
                    user_id: telegramUserId
                }
            });

            const status = response.data.result?.status;
            return status && status !== 'left' && status !== 'kicked';
        } catch (error) {
            console.error('Error checking Telegram user:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Obtener número de miembros del grupo
     */
    async getGroupMemberCount(chatId = null) {
        if (!this.apiUrl) {
            console.warn('Telegram Bot Token no configurado');
            return 0;
        }

        try {
            const targetChatId = chatId || this.groupId;
            const response = await axios.get(`${this.apiUrl}/getChatMembersCount`, {
                params: {
                    chat_id: targetChatId
                }
            });

            return response.data.result || 0;
        } catch (error) {
            console.error('Error getting member count:', error.response?.data || error.message);
            return 0;
        }
        }

    /**
     * Registrar actividad de usuario en Telegram
     */
    async registerUserActivity(telegramUserId, username, messageCount = 1) {
        try {
            const { error } = await supabase
                .from('telegram_activity')
                .upsert([{
                    telegram_user_id: telegramUserId,
                    username: username,
                    message_count: supabase.raw(`COALESCE(message_count, 0) + ${messageCount}`),
                    last_activity: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }], {
                    onConflict: 'telegram_user_id'
                });

            if (error) {
                console.error('Error registering Telegram activity:', error);
                return false;
            }

            // Actualizar progreso del desafío de Telegram para usuarios vinculados
            const { data: users } = await supabase
                .from('users')
                .select('id')
                .eq('telegram_user_id', telegramUserId);

            if (users && users.length > 0) {
                for (const user of users) {
                    await supabase
                        .from('christmas_event_challenges')
                        .upsert([{
                            user_id: user.id,
                            challenge_id: 'telegramActivity',
                            progress: supabase.raw(`COALESCE(progress, 0) + ${messageCount}`),
                            reward: 10,
                            last_updated: new Date().toISOString()
                        }], {
                            onConflict: 'user_id,challenge_id'
                        });
                }
            }

            return true;
        } catch (error) {
            console.error('Error registering Telegram activity:', error);
            return false;
        }
    }

    /**
     * Vincular usuario de Telegram con usuario de la plataforma
     */
    async linkTelegramUser(platformUserId, telegramUserId, telegramUsername) {
        try {
            // Actualizar usuario con telegram_user_id
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    telegram_user_id: telegramUserId
                })
                .eq('id', platformUserId);

            if (updateError) {
                throw updateError;
            }

            // Registrar en tabla de actividad
            await this.registerUserActivity(telegramUserId, telegramUsername, 0);

            return true;
        } catch (error) {
            console.error('Error linking Telegram user:', error);
            return false;
        }
    }

    /**
     * Obtener estadísticas de actividad de Telegram
     */
    async getTelegramStats() {
        try {
            // Obtener número de miembros del grupo
            const memberCount = await this.getGroupMemberCount();

            // Obtener usuarios activos en la última semana
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const { data: activeUsers, error } = await supabase
                .from('telegram_activity')
                .select('*')
                .gte('last_activity', weekAgo.toISOString());

            return {
                totalMembers: memberCount,
                activeUsers: activeUsers?.length || 0,
                totalMessages: activeUsers?.reduce((sum, user) => sum + (user.message_count || 0), 0) || 0
            };
        } catch (error) {
            console.error('Error getting Telegram stats:', error);
            return {
                totalMembers: 0,
                activeUsers: 0,
                totalMessages: 0
            };
        }
    }
}

module.exports = new TelegramService();

