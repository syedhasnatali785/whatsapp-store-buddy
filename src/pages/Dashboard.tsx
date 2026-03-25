import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import StoreSettings from "@/components/dashboard/StoreSettings";
import ProductManager from "@/components/dashboard/ProductManager";
import CustomReplies from "@/components/dashboard/CustomReplies";
import AiUsage from "@/components/dashboard/AiUsage";
import OrdersDashboard from "@/components/dashboard/OrdersDashboard";
import Analytics from "@/components/dashboard/Analytics";
import CouponManager from "@/components/dashboard/CouponManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, LogOut, ExternalLink } from "lucide-react";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("profiles").select("store_name, status").eq("user_id", user.id).single();
      if (data) {
        if (data.status !== "approved") { await supabase.auth.signOut(); navigate("/auth"); return; }
        setStoreName(data.store_name);
      }
    };
    load();
  }, [user, navigate]);

  if (loading || !user) return null;

  const storeSlug = storeName.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg whatsapp-gradient flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Syedom</span>
          </div>
          <div className="flex items-center gap-2">
            {storeName && (
              <Button variant="outline" size="sm" onClick={() => window.open(`/store/${storeSlug}`, "_blank")}>
                <ExternalLink className="w-4 h-4 mr-1" />View Store
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/auth"); }}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="orders" className="text-xs">Orders</TabsTrigger>
            <TabsTrigger value="store" className="text-xs">Store</TabsTrigger>
            <TabsTrigger value="products" className="text-xs">Products</TabsTrigger>
            <TabsTrigger value="coupons" className="text-xs">Coupons</TabsTrigger>
            <TabsTrigger value="replies" className="text-xs">Replies</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">Stats</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">AI</TabsTrigger>
          </TabsList>
          <TabsContent value="orders"><OrdersDashboard userId={user.id} /></TabsContent>
          <TabsContent value="store"><StoreSettings userId={user.id} /></TabsContent>
          <TabsContent value="products"><ProductManager userId={user.id} /></TabsContent>
          <TabsContent value="coupons"><CouponManager userId={user.id} /></TabsContent>
          <TabsContent value="replies"><CustomReplies userId={user.id} /></TabsContent>
          <TabsContent value="analytics"><Analytics userId={user.id} /></TabsContent>
          <TabsContent value="ai"><AiUsage userId={user.id} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
