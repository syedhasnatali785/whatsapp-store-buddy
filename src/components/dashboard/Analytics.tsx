import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, ShoppingCart, TrendingUp } from "lucide-react";

interface Props {
  userId: string;
}

const Analytics = ({ userId }: Props) => {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { count: pCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      setProductCount(pCount || 0);

      const { data: orders } = await supabase
        .from("orders")
        .select("total_price, status")
        .eq("user_id", userId);

      if (orders) {
        setOrderCount(orders.length);
        setRevenue(orders.reduce((sum, o) => sum + Number(o.total_price), 0));
        setPendingCount(orders.filter((o) => o.status === "pending").length);
      }
    };
    load();
  }, [userId]);

  const stats = [
    { label: "Products", value: productCount, icon: Package, color: "text-blue-500" },
    { label: "Total Orders", value: orderCount, icon: ShoppingCart, color: "text-primary" },
    { label: "Pending", value: pendingCount, icon: TrendingUp, color: "text-orange-500" },
    { label: "Revenue", value: `Rs ${revenue.toLocaleString()}`, icon: BarChart3, color: "text-green-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border bg-card p-4 text-center">
              <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Analytics;
