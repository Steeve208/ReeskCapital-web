// supabase/functions/stop_mining/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    const { data: s } = await admin.from("mining_sessions")
      .select("user_id,status").eq("id", session_id).single();
    if (!s || s.user_id !== user.id || s.status !== "active")
      return new Response("Invalid session", { status: 400 });

    await admin.from("mining_sessions").update({
      status: "ended",
      ended_at: new Date().toISOString()
    }).eq("id", session_id);

    await admin.from("mining_events").insert({ session_id, kind: "stop" });

    return new Response("ok");
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});
