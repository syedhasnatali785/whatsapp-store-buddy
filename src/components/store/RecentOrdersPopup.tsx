import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag } from "lucide-react";

interface Props {
  storeUserId: string;
}

const RecentOrdersPopup = ({ storeUserId }: Props) => {
  const [order, setOrder] = useState<{ customer_name: string; products: any[]; created_at: string } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("customer_name, products, created_at")
        .eq("user_id", storeUserId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!data || data.length === 0) return;

      let idx = 0;
      const show = () => {
        const o = data[idx % data.length];
        setOrder(o as any);
        setVisible(true);
        setTimeout(() => setVisible(false), 4000);
        idx++;
      };

      const timeout = setTimeout(show, 5000);
      const interval = setInterval(show, 15000);
      return () => { clearTimeout(timeout); clearInterval(interval); };
    };

    loadOrders();
  }, [storeUserId]);

  if (!order || !visible) return null;

  const firstName = order.customer_name.split(" ")[0];
  const productName = Array.isArray(order.products) && order.products.length > 0 ? order.products[0].name : "an item";
  const timeAgo = getTimeAgo(order.created_at);

  return (
    <div className="fixed bottom-20 left-4 z-40 animate-slide-up max-w-[280px]">
      <div className="bg-card border rounded-xl shadow-lg p-3 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {firstName} ordered {productName}
          </p>
          <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default RecentOrdersPopup;
