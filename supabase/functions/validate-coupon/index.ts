import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { storeUserId, code, totalPrice } = await req.json();
    if (!storeUserId || !code || typeof totalPrice !== "number") {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: coupon } = await supabase
      .from("coupons")
      .select("id, type, value, min_order, max_uses, used_count, expires_at, active")
      .eq("user_id", storeUserId)
      .eq("code", String(code).trim().toUpperCase())
      .eq("active", true)
      .maybeSingle();

    if (!coupon) {
      return new Response(JSON.stringify({ error: "Invalid or expired coupon" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Coupon expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return new Response(JSON.stringify({ error: "Coupon usage limit reached" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (Number(coupon.min_order) > totalPrice) {
      return new Response(JSON.stringify({ error: `Minimum order Rs ${coupon.min_order} required` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const discount = coupon.type === "percentage"
      ? Math.round(totalPrice * (Number(coupon.value) / 100))
      : Math.min(Number(coupon.value), totalPrice);

    return new Response(JSON.stringify({ couponId: coupon.id, discount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("validate-coupon error", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});