import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, storeUserId, storeName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check AI limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_requests_count, ai_limit")
      .eq("user_id", storeUserId)
      .single();

    if (!profile || profile.ai_requests_count >= profile.ai_limit) {
      return new Response(JSON.stringify({ reply: "AI assistant is unavailable. Please contact via WhatsApp." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get products for context
    const { data: products } = await supabase
      .from("products")
      .select("name, price, variants")
      .eq("user_id", storeUserId);

    const productList = (products || []).map(p => `${p.name} - Rs ${p.price}${p.variants ? ` (${p.variants})` : ""}`).join("\n");

    const systemPrompt = `You are a store assistant for "${storeName}".
Products available:
${productList || "No products listed yet."}

Rules:
- Answer briefly and helpfully
- Encourage ordering via WhatsApp
- Do not answer questions unrelated to the store
- Be friendly and professional
- Use Pakistani Rupees (Rs) for prices`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ reply: "AI is busy right now. Please try again later or contact via WhatsApp." }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ reply: "AI assistant is temporarily unavailable. Please contact via WhatsApp." }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Please contact us on WhatsApp.";

    // Increment AI usage
    await supabase
      .from("profiles")
      .update({ ai_requests_count: profile.ai_requests_count + 1 })
      .eq("user_id", storeUserId);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("store-chat error:", e);
    return new Response(JSON.stringify({ reply: "Something went wrong. Please contact us on WhatsApp." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
