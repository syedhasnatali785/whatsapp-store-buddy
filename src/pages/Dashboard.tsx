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
import CategoryManager from "@/components/dashboard/CategoryManager";
import StoreCustomization from "@/components/dashboard/StoreCustomization";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

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
            <span className="font-bold text-foreground hidden sm:inline">Syedom</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {storeName && (
              <Button variant="outline" size="sm" onClick={() => window.open(`/store/${storeSlug}`, "_blank")}>
                <ExternalLink className="w-4 h-4 mr-1" />View Store
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/auth"); }}><LogOut className="w-4 h-4" /></Button>
          </div>
          <div className="flex sm:hidden items-center gap-2">
            {storeName && (
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.open(`/store/${storeSlug}`, "_blank")}>
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { signOut(); navigate("/auth"); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-4 sm:py-6 max-w-2xl">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Dashboard</h2>
        <Tabs defaultValue="orders" className="space-y-4">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-max gap-1">
              <TabsTrigger value="orders" className="text-xs px-3">Orders</TabsTrigger>
              <TabsTrigger value="store" className="text-xs px-3">Store</TabsTrigger>
              <TabsTrigger value="products" className="text-xs px-3">Products</TabsTrigger>
              <TabsTrigger value="categories" className="text-xs px-3">Categories</TabsTrigger>
              <TabsTrigger value="coupons" className="text-xs px-3">Coupons</TabsTrigger>
              <TabsTrigger value="replies" className="text-xs px-3">Replies</TabsTrigger>
              <TabsTrigger value="customize" className="text-xs px-3">Customize</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs px-3">Stats</TabsTrigger>
              <TabsTrigger value="ai" className="text-xs px-3">AI</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <TabsContent value="orders"><OrdersDashboard userId={user.id} /></TabsContent>
          <TabsContent value="store"><StoreSettings userId={user.id} /></TabsContent>
          <TabsContent value="products"><ProductManager userId={user.id} /></TabsContent>
          <TabsContent value="categories"><CategoryManager userId={user.id} /></TabsContent>
          <TabsContent value="coupons"><CouponManager userId={user.id} /></TabsContent>
          <TabsContent value="replies"><CustomReplies userId={user.id} /></TabsContent>
          <TabsContent value="customize"><StoreCustomization userId={user.id} /></TabsContent>
          <TabsContent value="analytics"><Analytics userId={user.id} /></TabsContent>
          <TabsContent value="ai"><AiUsage userId={user.id} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
