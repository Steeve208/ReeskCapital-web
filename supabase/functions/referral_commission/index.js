// supabase/functions/referral_commission/index.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Supabase environment variables are not configured");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      success: false,
      error: "Method not allowed",
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const payload = await req.json();

    const referredUserId = payload?.referred_user_id;
    const explicitReferrerId = payload?.referrer_user_id;
    const miningAmount = Number(payload?.mining_amount ?? 0);
    const commissionLevel = Number(payload?.commission_level ?? 1) || 1;
    const metadata = payload?.metadata ?? {};

    if (!referredUserId) {
      return new Response(JSON.stringify({
        success: false,
        error: "referred_user_id is required",
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    if (!Number.isFinite(miningAmount) || miningAmount <= 0) {
      return new Response(JSON.stringify({
        success: true,
        commission_amount: 0,
        reason: "no_mining_amount",
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    let referrerId = explicitReferrerId;

    if (!referrerId) {
      const { data: referredUser, error: referredError } = await supabase
        .from("users")
        .select("referred_by")
        .eq("id", referredUserId)
        .maybeSingle();

      if (referredError) {
        console.error("Error fetching referred user:", referredError);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to resolve referrer",
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      referrerId = referredUser?.referred_by ?? null;
    }

    if (!referrerId) {
      return new Response(JSON.stringify({
        success: true,
        commission_amount: 0,
        reason: "no_referrer",
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Ensure referral relation exists
    const relationPayload = {
      referrer_id: referrerId,
      referred_id: referredUserId,
    };

    const { error: relationError } = await supabase
      .from("referrals")
      .upsert(relationPayload, { onConflict: "referrer_id,referred_id" });

    if (relationError) {
      console.warn("Referral relation upsert warning:", relationError);
    }

    // Execute RPC to process commission (fallback to two-arg version if needed)
    let commissionAmount = 0;

    let { data: rpcData, error: rpcError } = await supabase.rpc("process_referral_commission", {
      p_referred_user_id: referredUserId,
      p_mining_amount: miningAmount,
      p_commission_level: commissionLevel,
    });

    if (rpcError) {
      console.warn("Falling back to two-argument RPC for process_referral_commission", rpcError);
      const fallback = await supabase.rpc("process_referral_commission", {
        p_referred_user_id: referredUserId,
        p_mining_amount: miningAmount,
      });
      rpcData = fallback.data;
      rpcError = fallback.error;
    }

    if (rpcError) {
      console.error("Error processing referral commission RPC:", rpcError);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to process referral commission",
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    commissionAmount = Number(rpcData ?? 0) || 0;

    const { data: totalsRow } = await supabase
      .from("transactions")
      .select("total:sum(amount)")
      .eq("user_id", referrerId)
      .eq("type", "referral_commission")
      .maybeSingle();

    const totalEarned = Number(totalsRow?.total ?? 0) || 0;

    try {
      await supabase.from("referral_audit_log").insert({
        user_id: referrerId,
        action: "referral_commission_processed",
        referrer_user_id: referrerId,
        referred_user_id: referredUserId,
        details: {
          mining_amount: miningAmount,
          commission_amount: commissionAmount,
          metadata,
        },
      });
    } catch (auditError) {
      console.warn("Audit log insertion warning:", auditError);
    }

    return new Response(JSON.stringify({
      success: true,
      commission_amount: commissionAmount,
      referrer_user_id: referrerId,
      referred_user_id: referredUserId,
      mining_amount: miningAmount,
      totals: {
        total_commissions: totalEarned,
      },
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Unexpected error in referral_commission function:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Unexpected error",
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

