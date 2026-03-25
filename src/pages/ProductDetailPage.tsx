import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Image, MessageCircle, AlertTriangle } from "lucide-react";
import { CartProvider, useCart } from "@/components/store/CartContext";
import CartDrawer from "@/components/store/CartDrawer";
import CheckoutDialog from "@/components/store/CheckoutDialog";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  variants: string | null;
  image_url: string | null;
  video_url: string | null;
  stock_count: number | null;
  user_id: string;
}

interface StoreProfile {
  user_id: string;
  store_name: string;
  whatsapp: string;
}

const ProductDetailContent = () => {
  const { storeName, productId } = useParams<{ storeName: string; productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      if (!storeName || !productId) return;

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

      const { data: prod } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("user_id", match.user_id)
        .single();

      if (!prod) { setNotFound(true); return; }
      setProduct(prod as unknown as Product);
    };
    load();
  }, [storeName, productId]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
          <Link to={`/store/${storeName}`} className="text-primary mt-4 inline-block hover:underline">
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  if (!product || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock_count !== null && product.stock_count <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    toast.success(`${product.name} added to cart`);
  };

  const whatsappMsg = encodeURIComponent(`Hi ${profile.store_name}! I'm interested in ${product.name} (Rs ${product.price.toLocaleString()}). Please share more details.`);
  const outOfStock = product.stock_count !== null && product.stock_count <= 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto flex items-center h-14 px-4">
          <Link to={`/store/${storeName}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{profile.store_name}</span>
          </Link>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Image */}
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="w-20 h-20 text-muted-foreground/30" />
              </div>
            )}
            {product.stock_count !== null && product.stock_count <= 5 && (
              <Badge variant={outOfStock ? "destructive" : "secondary"} className="absolute top-4 left-4">
                {outOfStock ? "Out of Stock" : `Only ${product.stock_count} left`}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="text-3xl font-extrabold text-primary mt-2">Rs {product.price.toLocaleString()}</p>

            {product.variants && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.variants.split(",").map((v, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{v.trim()}</span>
                ))}
              </div>
            )}

            {product.description && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</h2>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <div className="mt-auto pt-6 space-y-3">
              <Button className="w-full rounded-full h-12 text-base" onClick={handleAddToCart} disabled={outOfStock}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {outOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button variant="outline" className="w-full rounded-full h-12 text-base" asChild>
                <a href={`https://wa.me/${profile.whatsapp}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </a>
              </Button>
            </div>

            {product.video_url && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Product Video</h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                  <iframe src={product.video_url.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen title="Product video" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t mt-8 py-6 text-center">
        <p className="text-xs text-muted-foreground">Powered by <span className="font-semibold text-primary">Syedom</span></p>
      </footer>

      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutDialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} storeUserId={profile.user_id} storeName={profile.store_name} whatsapp={profile.whatsapp} />
    </div>
  );
};

const ProductDetailPage = () => (
  <CartProvider>
    <ProductDetailContent />
  </CartProvider>
);

export default ProductDetailPage;
