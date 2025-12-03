// Supabase Edge Function para procesar comisiones pendientes automáticamente
// Esta función puede ser ejecutada por un cron job cada 30 días

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Manejar CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🚀 Iniciando procesamiento de comisiones pendientes...");

    // Obtener todos los usuarios con referidos
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username, email, referred_by, balance")
      .not("referred_by", "is", null);

    if (usersError) {
      throw new Error(`Error obteniendo usuarios: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No hay usuarios con referidos para procesar",
          processed: 0,
          totalCommissions: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`📊 Encontrados ${users.length} usuarios con referidos`);

    const results = {
      processed: 0,
      skipped: 0,
      errors: 0,
      totalCommissions: 0,
    };

    // Procesar cada usuario
    for (const user of users) {
      try {
        const referredUserId = user.id;
        const referrerId = user.referred_by;

        // Obtener total minado del usuario (sumando transacciones de tipo 'mining')
        const { data: miningTransactions } = await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", referredUserId)
          .eq("type", "mining");

        const totalMined = miningTransactions?.reduce(
          (sum, tx) => sum + parseFloat(tx.amount || 0),
          0
        ) || 0;

        if (totalMined <= 0) {
          results.skipped++;
          continue;
        }

        // Obtener tasa de comisión
        const { data: referral } = await supabase
          .from("referrals")
          .select("commission_rate")
          .eq("referrer_id", referrerId)
          .eq("referred_id", referredUserId)
          .maybeSingle();

        const commissionRate = parseFloat(referral?.commission_rate || "0.1");
        const totalCommissionShouldBe = totalMined * commissionRate;

        // Obtener comisiones ya pagadas
        const { data: paidCommissions } = await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", referrerId)
          .eq("type", "referral_commission")
          .eq("reference_id", referredUserId);

        const totalPaid =
          paidCommissions?.reduce(
            (sum, tx) => sum + parseFloat(tx.amount || 0),
            0
          ) || 0;

        const pendingCommission = totalCommissionShouldBe - totalPaid;

        if (pendingCommission <= 0) {
          results.skipped++;
          continue;
        }

        // Obtener balance actual del referrer
        const { data: referrer } = await supabase
          .from("users")
          .select("balance")
          .eq("id", referrerId)
          .single();

        if (!referrer) {
          results.errors++;
          continue;
        }

        const balanceBefore = parseFloat(referrer.balance || 0);
        const balanceAfter = balanceBefore + pendingCommission;

        // Actualizar balance usando la función RPC
        const { error: rpcError } = await supabase.rpc("update_user_balance", {
          p_user_id: referrerId,
          p_amount: pendingCommission,
          p_transaction_type: "referral_commission",
          p_description: `Comisión de referido pendiente - ${user.username} (${totalMined.toFixed(6)} RSC minados) - Procesado automáticamente`,
        });

        if (rpcError) {
          // Si falla RPC, actualizar manualmente
          const { error: updateError } = await supabase
            .from("users")
            .update({ balance: balanceAfter })
            .eq("id", referrerId);

          if (updateError) {
            results.errors++;
            continue;
          }

          // Registrar transacción manualmente
          await supabase.from("transactions").insert({
            user_id: referrerId,
            type: "referral_commission",
            amount: pendingCommission,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            reference_id: referredUserId,
            reference_type: "user",
            description: `Comisión de referido pendiente - ${user.username} (${totalMined.toFixed(6)} RSC minados) - Procesado automáticamente`,
            metadata: {
              referred_user_id: referredUserId,
              referred_username: user.username,
              total_mined: totalMined,
              commission_rate: commissionRate,
              total_commission_should_be: totalCommissionShouldBe,
              total_commission_paid_before: totalPaid,
              processed_at: new Date().toISOString(),
              automated: true,
            },
          });
        }

        // Actualizar total_commission en referrals
        await supabase
          .from("referrals")
          .update({
            total_commission: totalPaid + pendingCommission,
          })
          .eq("referrer_id", referrerId)
          .eq("referred_id", referredUserId);

        results.processed++;
        results.totalCommissions += pendingCommission;

        console.log(
          `✅ Comisión procesada: ${pendingCommission.toFixed(6)} RSC para referrer ${referrerId}`
        );
      } catch (error) {
        console.error(`❌ Error procesando usuario ${user.id}:`, error);
        results.errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Procesamiento de comisiones completado",
        results: {
          totalUsers: users.length,
          processed: results.processed,
          skipped: results.skipped,
          errors: results.errors,
          totalCommissions: results.totalCommissions,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error en procesamiento:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

