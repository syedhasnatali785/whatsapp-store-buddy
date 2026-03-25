import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Package, CheckCircle, Clock } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  products: { name: string; price: number; quantity: number }[];
  total_price: number;
  status: string;
  created_at: string;
}

interface Props {
  userId: string;
}

const OrdersDashboard = ({ userId }: Props) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setOrders(data as unknown as Order[]);
  };

  useEffect(() => { load(); }, [userId]);

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "pending" ? "completed" : "pending";
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    load();
  };

  const pending = orders.filter((o) => o.status === "pending").length;
  const completed = orders.filter((o) => o.status === "completed").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-secondary p-3 text-center">
            <Package className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold">{orders.length}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-3 text-center">
            <Clock className="w-5 h-5 mx-auto text-orange-500 mb-1" />
            <p className="text-xl font-bold">{pending}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-green-500 mb-1" />
            <p className="text-xl font-bold">{completed}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No orders yet. Share your store link!</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="p-3 rounded-lg border bg-card space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.phone}</p>
                    {o.address && <p className="text-xs text-muted-foreground">{o.address}</p>}
                  </div>
                  <Badge variant={o.status === "pending" ? "secondary" : "default"} className="text-[10px]">
                    {o.status}
                  </Badge>
                </div>
                <div className="text-xs space-y-0.5">
                  {o.products.map((p, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{p.name} x{p.quantity}</span>
                      <span>Rs {(p.price * p.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="font-bold text-sm text-primary">Rs {o.total_price.toLocaleString()}</span>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toggleStatus(o.id, o.status)}>
                    {o.status === "pending" ? "Mark Completed" : "Mark Pending"}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersDashboard;
