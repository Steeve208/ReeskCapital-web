// supabase/functions/heartbeat/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RATE = Number(Deno.env.get("RATE_RSC_PER_SEC") || "0.002");
const TIMEOUT = Number(Deno.env.get("SESSION_TIMEOUT_SEC") || "60");

serve(async (req) => {
  try {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return new Response("Unauthorized", { status: 401 });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const userClient = createClient(SUPABASE_URL, token);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const { session_id } = await req.json();

    // Cargar sesión
    const { data: s, error: sErr } = await admin
      .from("mining_sessions").select("*").eq("id", session_id).single();
    if (sErr || !s || s.user_id !== user.id || s.status !== "active")
      return new Response("Invalid session", { status: 400 });

    // Calcular segundos desde último heartbeat (usamos events)
    const { data: lastEvt } = await admin
      .from("mining_events")
      .select("ts").eq("session_id", session_id).order("ts", { ascending: false }).limit(1).single();

    const now = new Date();
    const lastTs = lastEvt?.ts ? new Date(lastEvt.ts) : new Date(s.started_at);
    const deltaSec = Math.min(Math.floor((now.getTime() - lastTs.getTime())/1000), TIMEOUT);

    const addTokens = deltaSec * RATE;

    // Actualizar sesión
    const { error: up1 } = await admin.rpc("update_session_and_balance", {
      p_session_id: session_id,
      p_user_id: user.id,
      p_add_seconds: deltaSec,
      p_add_tokens: addTokens
    });
    if (up1) throw up1;

    await admin.from("mining_events").insert({ session_id, kind: "heartbeat" });

    return new Response(JSON.stringify({ added_seconds: deltaSec, added_tokens: addTokens }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});
