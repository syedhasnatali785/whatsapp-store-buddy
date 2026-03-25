import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, Image, ShoppingCart, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ChatWidget from "@/components/store/ChatWidget";
import { CartProvider, useCart } from "@/components/store/CartContext";
import CartDrawer from "@/components/store/CartDrawer";
import CheckoutDialog from "@/components/store/CheckoutDialog";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  variants: string | null;
  image_url: string | null;
  stock_count: number | null;
}

interface StoreProfile {
  user_id: string;
  store_name: string;
  whatsapp: string;
}

const StoreContent = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      if (!storeName) return;
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

      if (prods) setProducts(prods as unknown as Product[]);
    };
    load();
  }, [storeName]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Store Not Found</h1>
          <p className="text-muted-foreground mt-2 max-w-sm">This store doesn't exist or hasn't been approved yet.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading store...</p>
        </div>
      </div>
    );
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (p: Product) => {
    if (p.stock_count !== null && p.stock_count <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    addItem({ id: p.id, name: p.name, price: p.price, image_url: p.image_url });
    toast.success(`${p.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="whatsapp-gradient py-10 sm:py-16 px-4">
          <div className="container max-w-5xl mx-auto text-center relative z-10">
            <div className="w-20 h-20 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-2 border-primary-foreground/30">
              <ShoppingBag className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-foreground tracking-tight">
              {profile.store_name}
            </h1>
            <p className="text-primary-foreground/80 mt-2 text-sm sm:text-base">
              Order via WhatsApp • Fast Delivery 🇵🇰
            </p>
            <div className="mt-6 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="pl-10 bg-primary-foreground/95 border-0 shadow-lg text-foreground placeholder:text-muted-foreground h-11 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" className="w-full">
            <path d="M0 50V25C240 0 480 0 720 25C960 50 1200 50 1440 25V50H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </header>

      {/* Products */}
      <main className="container max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {filtered.length === 0 && products.length > 0 && (
          <p className="text-center text-muted-foreground py-12">No products match "{search}"</p>
        )}
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-16 text-lg">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="group bg-card rounded-xl border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Image */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                  )}
                  {/* Stock badge */}
                  {p.stock_count !== null && p.stock_count <= 5 && (
                    <Badge
                      variant={p.stock_count === 0 ? "destructive" : "secondary"}
                      className="absolute top-2 left-2 text-[10px]"
                    >
                      {p.stock_count === 0 ? "Out of Stock" : `Only ${p.stock_count} left`}
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 leading-tight">{p.name}</h3>
                  <p className="text-lg sm:text-xl font-bold text-primary mt-1">Rs {p.price.toLocaleString()}</p>
                  {p.variants && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.variants.split(",").map((v, i) => (
                        <span key={i} className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{v.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto pt-3">
                    <Button
                      className="w-full rounded-full"
                      size="sm"
                      onClick={() => handleAddToCart(p)}
                      disabled={p.stock_count !== null && p.stock_count <= 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t mt-8 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-primary">WA Store Builder</span>
        </p>
      </footer>

      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        storeUserId={profile.user_id}
        storeName={profile.store_name}
        whatsapp={profile.whatsapp}
      />
      <ChatWidget storeUserId={profile.user_id} storeName={profile.store_name} whatsapp={profile.whatsapp} />
    </div>
  );
};

const StorePage = () => (
  <CartProvider>
    <StoreContent />
  </CartProvider>
);

export default StorePage;
