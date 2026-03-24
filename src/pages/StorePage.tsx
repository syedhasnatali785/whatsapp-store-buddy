import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ShoppingBag } from "lucide-react";
import ChatWidget from "@/components/store/ChatWidget";

interface Product {
  id: string;
  name: string;
  price: number;
  variants: string | null;
  image_url: string | null;
}

interface StoreProfile {
  user_id: string;
  store_name: string;
  whatsapp: string;
}

const StorePage = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!storeName) return;
      
      // Find profile by store_name slug
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, store_name, whatsapp")
        .eq("status", "approved");

      if (!profiles) { setNotFound(true); return; }

      const match = profiles.find(
        (p) => p.store_name.toLowerCase().replace(/\s+/g, "-") === storeName.toLowerCase()
      );

      if (!match) { setNotFound(true); return; }

      setProfile(match as StoreProfile);

      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", match.user_id)
        .order("created_at", { ascending: false });

      if (prods) setProducts(prods as Product[]);
    };
    load();
  }, [storeName]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground">Store Not Found</h1>
          <p className="text-muted-foreground mt-2">This store doesn't exist or hasn't been approved yet.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading store...</div>
      </div>
    );
  }

  const waLink = (productName: string) => {
    const msg = encodeURIComponent(`Hi, I want to order ${productName}. Please share details.`);
    return `https://wa.me/${profile.whatsapp}?text=${msg}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="whatsapp-gradient py-8 px-4">
        <div className="container max-w-3xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">{profile.store_name}</h1>
          <p className="text-primary-foreground/80 mt-1">Order via WhatsApp • Fast Delivery 🇵🇰</p>
        </div>
      </header>

      {/* Products */}
      <main className="container max-w-3xl px-4 py-8">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {p.image_url && (
                  <div className="aspect-square bg-muted">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <p className="text-lg font-bold text-primary mt-1">Rs {p.price}</p>
                  {p.variants && (
                    <p className="text-xs text-muted-foreground mt-1">{p.variants}</p>
                  )}
                  <Button asChild className="w-full mt-3" size="sm">
                    <a href={waLink(p.name)} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Order on WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <ChatWidget storeUserId={profile.user_id} storeName={profile.store_name} whatsapp={profile.whatsapp} />
    </div>
  );
};

export default StorePage;
