import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { storeUserId, message } = await req.json();
    if (!storeUserId || !message) {
      return new Response(JSON.stringify({ reply: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: replies } = await supabase
      .from("custom_replies")
      .select("keyword, response")
      .eq("user_id", storeUserId);

    const lower = String(message).toLowerCase();
    const match = (replies ?? []).find((r) => lower.includes(String(r.keyword).toLowerCase()));

    return new Response(JSON.stringify({ reply: match?.response ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("match-reply error", e);
    return new Response(JSON.stringify({ reply: null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});