// supabase/functions/start_mining/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_CONCURRENT = Number(Deno.env.get("MAX_CONCURRENT_SESSIONS") || "1");

serve(async (req) => {
  try {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return new Response("Unauthorized", { status: 401 });

    // Parse the simple user token
    let userData;
    try {
      const decoded = atob(token);
      userData = JSON.parse(decoded);
    } catch (error) {
      return new Response("Invalid token format", { status: 401 });
    }

    const { user_email, user_name } = await req.json();
    
    if (!user_email || !user_name) {
      return new Response("Missing user_email or user_name", { status: 400 });
    }

    // cliente admin para DB writes
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Check if user exists in profiles, if not create one
    let { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", user_email)
      .single();

    if (!profile) {
      // Create a new profile for the user
      const { data: newProfile, error: profileError } = await admin
        .from("profiles")
        .insert({
          email: user_email,
          display_name: user_name,
          role: 'user'
        })
        .select()
        .single();

      if (profileError) throw profileError;
      profile = newProfile;
    }

    // Verificar sesiones activas existentes
    const { data: activeSessions } = await admin
      .from("mining_sessions")
      .select("id")
      .eq("user_id", profile.id)
      .eq("status", "active");

    if (activeSessions && activeSessions.length >= MAX_CONCURRENT) {
      return new Response(JSON.stringify({
        error: "Maximum concurrent sessions reached",
        maxSessions: MAX_CONCURRENT
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Crear nueva sesión
    const { data: session, error } = await admin
      .from("mining_sessions")
      .insert({
        user_id: profile.id,
        device_fingerprint: req.headers.get("User-Agent") || "unknown",
        ip: req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown"
      })
      .select()
      .single();

    if (error) throw error;

    // Crear evento de inicio
    await admin
      .from("mining_events")
      .insert({
        session_id: session.id,
        kind: "start"
      });

    return new Response(JSON.stringify({
      session_id: session.id,
      started_at: session.started_at,
      message: "Mining session started successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error starting mining:", error);
    return new Response(JSON.stringify({
      error: "Failed to start mining session"
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
