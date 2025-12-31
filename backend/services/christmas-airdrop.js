/* ================================
   CHRISTMAS AIRDROP SERVICE
   Servicio para distribución de airdrop
   ================================ */

import { createClient } from '@supabase/supabase-js';

class ChristmasAirdropService {
    constructor(supabaseConfig) {
        this.supabase = createClient(
            supabaseConfig.url,
            supabaseConfig.serviceKey || supabaseConfig.anonKey
        );
        this.config = {
            eventEndDate: new Date('2026-01-02T23:59:59'),
            rewards: {
                top1: 10000,
                top2_3: 5000,
                top4_10: 2500,
                top11_25: 1000,
                top26_50: 500,
                top51_100: 250
            }
        };
    }
    
    isEventActive() {
        const now = new Date();
        const startDate = new Date('2024-12-25T00:00:00');
        const endDate = new Date('2026-01-02T23:59:59');
        return now >= startDate && now <= endDate;
    }
    
    isEventEnded() {
        return new Date() > this.config.eventEndDate;
    }
    
    getAirdropReward(rank) {
        if (rank === 1) {
            return this.config.rewards.top1;
        } else if (rank >= 2 && rank <= 3) {
            return this.config.rewards.top2_3;
        } else if (rank >= 4 && rank <= 10) {
            return this.config.rewards.top4_10;
        } else if (rank >= 11 && rank <= 25) {
            return this.config.rewards.top11_25;
        } else if (rank >= 26 && rank <= 50) {
            return this.config.rewards.top26_50;
        } else if (rank >= 51 && rank <= 100) {
            return this.config.rewards.top51_100;
        }
        return 0;
    }
    
    async distributeAirdrop() {
        if (!this.isEventEnded()) {
            throw new Error('El evento aún no ha terminado');
        }
        
        try {
            // Obtener top 100 del leaderboard
            const { data: leaderboard, error: leaderboardError } = await this.supabase
                .from('christmas_leaderboard')
                .select('user_id, rank, total_points')
                .order('rank', { ascending: true })
                .limit(100);
            
            if (leaderboardError) throw leaderboardError;
            
            const claims = [];
            
            // Crear claims para cada ganador
            for (const entry of leaderboard) {
                const reward = this.getAirdropReward(entry.rank);
                
                if (reward > 0) {
                    // Verificar si ya existe un claim
                    const { data: existing } = await this.supabase
                        .from('christmas_airdrop_claims')
                        .select('id')
                        .eq('user_id', entry.user_id)
                        .eq('rank', entry.rank)
                        .single();
                    
                    if (!existing) {
                        const { data: claim, error: claimError } = await this.supabase
                            .from('christmas_airdrop_claims')
                            .insert({
                                user_id: entry.user_id,
                                rank: entry.rank,
                                reward_amount: reward,
                                claimed: false
                            })
                            .select()
                            .single();
                        
                        if (claimError) {
                            console.error(`Error creando claim para usuario ${entry.user_id}:`, claimError);
                        } else {
                            claims.push(claim);
                        }
                    }
                }
            }
            
            console.log(`✅ Airdrop distribuido: ${claims.length} claims creados`);
            return claims;
        } catch (error) {
            console.error('❌ Error distribuyendo airdrop:', error);
            throw error;
        }
    }
    
    async processAirdropClaim(userId) {
        try {
            // Obtener claim del usuario
            const { data: claim, error: claimError } = await this.supabase
                .from('christmas_airdrop_claims')
                .select('*')
                .eq('user_id', userId)
                .eq('claimed', false)
                .single();
            
            if (claimError || !claim) {
                throw new Error('No hay airdrop disponible para reclamar');
            }
            
            // Verificar anti-fraude (verificar que el usuario realmente está en el ranking)
            const { data: userPoints } = await this.supabase
                .from('christmas_points')
                .select('total_points')
                .eq('user_id', userId)
                .single();
            
            if (!userPoints || parseFloat(userPoints.total_points) <= 0) {
                throw new Error('Usuario no elegible para airdrop');
            }
            
            // Agregar recompensa al balance del usuario
            const { error: updateError } = await this.supabase
                .rpc('update_user_balance_advanced', {
                    p_user_id: userId,
                    p_amount: parseFloat(claim.reward_amount),
                    p_transaction_type: 'christmas_airdrop',
                    p_description: `Airdrop navideño - Rank #${claim.rank}`,
                    p_metadata: {
                        rank: claim.rank,
                        event: 'christmas_competition_2024'
                    }
                });
            
            if (updateError) {
                throw updateError;
            }
            
            // Marcar como reclamado
            const { error: markError } = await this.supabase
                .from('christmas_airdrop_claims')
                .update({
                    claimed: true,
                    claimed_at: new Date().toISOString()
                })
                .eq('id', claim.id);
            
            if (markError) {
                throw markError;
            }
            
            return {
                success: true,
                reward: parseFloat(claim.reward_amount),
                rank: claim.rank
            };
        } catch (error) {
            console.error('❌ Error procesando claim de airdrop:', error);
            throw error;
        }
    }
    
    async getUserAirdropStatus(userId) {
        try {
            const { data: claim, error } = await this.supabase
                .from('christmas_airdrop_claims')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            
            return claim || null;
        } catch (error) {
            console.error('❌ Error obteniendo status de airdrop:', error);
            return null;
        }
    }
}

export default ChristmasAirdropService;

