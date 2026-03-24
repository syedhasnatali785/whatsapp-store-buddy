import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import StoreSettings from "@/components/dashboard/StoreSettings";
import ProductManager from "@/components/dashboard/ProductManager";
import CustomReplies from "@/components/dashboard/CustomReplies";
import AiUsage from "@/components/dashboard/AiUsage";
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
      const { data } = await supabase
        .from("profiles")
        .select("store_name, status")
        .eq("user_id", user.id)
        .single();
      if (data) {
        if (data.status !== "approved") {
          await supabase.auth.signOut();
          navigate("/auth");
          return;
        }
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
            <span className="font-bold text-foreground">WA Store</span>
          </div>
          <div className="flex items-center gap-2">
            {storeName && (
              <Button variant="outline" size="sm" onClick={() => window.open(`/store/${storeSlug}`, "_blank")}>
                <ExternalLink className="w-4 h-4 mr-1" />
                View Store
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/auth"); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <Tabs defaultValue="store" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="replies">Replies</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>
          <TabsContent value="store"><StoreSettings userId={user.id} /></TabsContent>
          <TabsContent value="products"><ProductManager userId={user.id} /></TabsContent>
          <TabsContent value="replies"><CustomReplies userId={user.id} /></TabsContent>
          <TabsContent value="ai"><AiUsage userId={user.id} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
