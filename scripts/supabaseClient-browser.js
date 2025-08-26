/* ================================
   SUPABASE CLIENT CONFIGURATION (BROWSER VERSION)
================================ */

// Browser-compatible version without ES6 modules
(function() {
  'use strict';

  // Supabase configuration
  const SUPABASE_CONFIG = {
    url: 'https://unevdceponbnmhvpzlzf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4'
  };

  // Check if Supabase is loaded
  if (typeof supabase === 'undefined') {
    console.warn('Supabase client not loaded. Please include the Supabase CDN script.');
    return;
  }

  // Create Supabase client
  const supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

  // Helper functions for common operations
  const SupabaseHelpers = {
    // Save miner when starting mining
    async saveMiner(email, name, walletAddress = null) {
      try {
        const { data, error } = await supabaseClient
          .from('miners')
          .insert([
            { 
              email, 
              name, 
              wallet_address: walletAddress,
              hash_power: 0, 
              balance: 0,
              created_at: new Date().toISOString(),
              last_active: new Date().toISOString()
            }
          ])
          .select();

        if (error) {
          console.error("Error saving miner:", error);
          return { success: false, error };
        } else {
          console.log("Miner registered successfully:", data);
          return { success: true, data };
        }
      } catch (error) {
        console.error("Exception saving miner:", error);
        return { success: false, error };
      }
    },

    // Update mining progress
    async updateMiningProgress(email, newHashPower, newBalance) {
      try {
        const { data, error } = await supabaseClient
          .from('miners')
          .update({ 
            hash_power: newHashPower,
            balance: newBalance,
            last_active: new Date().toISOString()
          })
          .eq('email', email)
          .select();

        if (error) {
          console.error("Error updating mining progress:", error);
          return { success: false, error };
        } else {
          console.log("Mining progress updated:", data);
          return { success: true, data };
        }
      } catch (error) {
        console.error("Exception updating mining progress:", error);
        return { success: false, error };
      }
    },

    // Get miner data
    async getMiner(email) {
      try {
        const { data, error } = await supabaseClient
          .from('miners')
          .select('*')
          .eq('email', email)
          .single();

        if (error) {
          console.error("Error getting miner:", error);
          return { success: false, error };
        } else {
          return { success: true, data };
        }
      } catch (error) {
        console.error("Exception getting miner:", error);
        return { success: false, error };
      }
    },

    // Get all miners for leaderboard
    async getAllMiners() {
      try {
        const { data, error } = await supabaseClient
          .from('miners')
          .select('*')
          .order('hash_power', { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error getting all miners:", error);
          return { success: false, error };
        } else {
          return { success: true, data };
        }
      } catch (error) {
        console.error("Exception getting all miners:", error);
        return { success: false, error };
      }
    },

    // Save mining transaction
    async saveMiningTransaction(email, hashPower, reward, blockHash) {
      try {
        const { data, error } = await supabaseClient
          .from('mining_transactions')
          .insert([
            {
              email,
              hash_power: hashPower,
              reward,
              block_hash: blockHash,
              timestamp: new Date().toISOString()
            }
          ])
          .select();

        if (error) {
          console.error("Error saving mining transaction:", error);
          return { success: false, error };
        } else {
          console.log("Mining transaction saved:", data);
          return { success: true, data };
        }
      } catch (error) {
        console.error("Exception saving mining transaction:", error);
        return { success: false, error };
      }
    },

    // Check if user is already registered
    async checkMinerExists(email) {
      try {
        const { data, error } = await supabaseClient
          .from('miners')
          .select('id')
          .eq('email', email)
          .single();

        if (error && error.code === 'PGRST116') {
          // No rows returned
          return { exists: false, data: null };
        } else if (error) {
          console.error("Error checking miner existence:", error);
          return { exists: false, error };
        } else {
          return { exists: true, data };
        }
      } catch (error) {
        console.error("Exception checking miner existence:", error);
        return { exists: false, error };
      }
    }
  };

  // Make available globally
  window.SupabaseHelpers = SupabaseHelpers;
  window.supabaseClient = supabaseClient;

  console.log('Supabase client initialized successfully');
})();
