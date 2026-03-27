import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) return "+92" + digits.slice(1);
  if (digits.startsWith("92")) return "+" + digits;
  return "+" + digits;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { app, sender, message, group_name, phone, seller_data, customer_exists, orders_data } = await req.json();

    const normalizedPhone = normalizePhone(phone || "");

    // Not a seller or is a customer
    if (!seller_data || customer_exists) {
      return new Response(JSON.stringify({ reply: "You are not registered as a seller." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build report
    const orders = orders_data || [];
    const lines = orders.map((o: { product_name: string; status: string; amount: number }, i: number) =>
      `${i + 1}. ${o.product_name} | ${o.status} | Rs ${Number(o.amount).toLocaleString()}`
    );

    const totalRevenue = orders.reduce((s: number, o: { amount: number }) => s + Number(o.amount), 0);
    const pendingCount = orders.filter((o: { status: string }) => o.status === "pending").length;

    const reply = [
      `📊 Dashboard Report for ${seller_data.name}:`,
      ...lines,
      `Total Orders: ${orders.length} | Total Revenue: Rs ${totalRevenue.toLocaleString()} | Pending: ${pendingCount}`,
    ].join("\n");

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("whatsapp-dashboard-report error:", e);
    return new Response(JSON.stringify({ reply: "Something went wrong generating your report." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
