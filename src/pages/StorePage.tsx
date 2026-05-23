import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, Image, ShoppingCart, Menu, X, MessageCircle, Phone, Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ChatWidget from "@/components/store/ChatWidget";
import { CartProvider, useCart } from "@/components/store/CartContext";
import CartDrawer from "@/components/store/CartDrawer";
import CheckoutDialog from "@/components/store/CheckoutDialog";
import OfferBanner from "@/components/store/OfferBanner";
import RecentOrdersPopup from "@/components/store/RecentOrdersPopup";
import ContactButtons from "@/components/store/ContactButtons";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  variants: string | null;
  image_url: string | null;
  stock_count: number | null;
  category_id: string | null;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface StoreProfile {
  user_id: string;
  store_name: string;
  whatsapp: string;
}

interface StoreSettingsData {
  header_announcement: string | null;
  offer_banner_enabled: boolean;
  offer_banner_text: string;
  urgency_timer_enabled: boolean;
  urgency_timer_end: string | null;
  urgency_timer_label: string;
  hero_slider_enabled: boolean;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_cta_text: string | null;
  hero_slides: unknown;
  featured_enabled: boolean;
  featured_title: string | null;
  featured_limit: number;
  footer_text: string | null;
}

interface HeroSlide {
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
}

const normalizePhone = (phone: string) => phone.replace(/\D/g, "").replace(/^0/, "92");

const StoreContent = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettingsData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      if (!storeName) return;
      const { data: profiles } = await (supabase as any)
        .from("public_stores")
        .select("user_id, store_name, whatsapp");

      if (!profiles) { setNotFound(true); return; }
      const match = profiles.find(
        (p) => p.store_name.toLowerCase().replace(/\s+/g, "-") === storeName.toLowerCase()
      );
      if (!match) { setNotFound(true); return; }
      setProfile(match as StoreProfile);

      // Load products, categories, settings in parallel
      const [prodsRes, catsRes, settingsRes] = await Promise.all([
        supabase.from("products").select("*").eq("user_id", match.user_id).order("created_at", { ascending: false }),
        supabase.from("categories").select("*").eq("user_id", match.user_id).order("created_at", { ascending: true }),
        supabase.from("store_settings").select("*").eq("user_id", match.user_id).single(),
      ]);

      if (prodsRes.data) setProducts(prodsRes.data as unknown as Product[]);
      if (catsRes.data) setCategories(catsRes.data as Category[]);
      if (settingsRes.data) setStoreSettings(settingsRes.data as unknown as StoreSettingsData);
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
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || p.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const whatsappNumber = normalizePhone(profile.whatsapp);
  const callNumber = profile.whatsapp.startsWith("+") ? profile.whatsapp : `+${whatsappNumber}`;
  const whatsappMsg = encodeURIComponent(`Hi ${profile.store_name}! I'm interested in your products.`);
  const savedSlides = Array.isArray(storeSettings?.hero_slides) ? storeSettings?.hero_slides as HeroSlide[] : [];
  const heroSlides = savedSlides.length ? savedSlides : [{
    title: storeSettings?.hero_title || `Shop ${profile.store_name}`,
    subtitle: storeSettings?.hero_subtitle || "Discover products, add to cart, and order instantly on WhatsApp.",
    image_url: storeSettings?.hero_image_url || "",
    cta_text: storeSettings?.hero_cta_text || "Shop Now",
  }];
  const featuredProducts = products
    .filter((p) => p.featured)
    .slice(0, storeSettings?.featured_limit || 4);

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
      {/* Offer Banner */}
      {storeSettings?.offer_banner_enabled && storeSettings.offer_banner_text && (
        <OfferBanner text={storeSettings.offer_banner_text} />
      )}

      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        {storeSettings?.header_announcement && (
          <div className="bg-primary px-4 py-1.5 text-center text-xs font-medium text-primary-foreground">
            {storeSettings.header_announcement}
          </div>
        )}
        <div className="container max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <Link to={`/store/${storeName}`} className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl whatsapp-gradient">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="truncate text-base font-extrabold text-foreground">{profile.store_name}</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground sm:flex">
            <a href="#featured" className="hover:text-foreground">Featured</a>
            <a href="#products" className="hover:text-foreground">Products</a>
            <a href={`tel:${callNumber}`} className="hover:text-foreground">Call</a>
            <Button size="sm" className="rounded-full" asChild>
              <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-1.5 h-4 w-4" />WhatsApp
              </a>
            </Button>
          </nav>
          <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {menuOpen && (
          <div className="border-t bg-card px-4 py-3 sm:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild><a href="#products" onClick={() => setMenuOpen(false)}>Products</a></Button>
              <Button variant="outline" asChild><a href={`tel:${callNumber}`}>Call Now</a></Button>
              <Button className="col-span-2" asChild><a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></Button>
            </div>
          </div>
        )}
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {storeSettings?.hero_slider_enabled !== false && (
          <section className="mb-6 sm:mb-10">
            <Carousel opts={{ loop: heroSlides.length > 1 }} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <CarouselContent className="ml-0">
                {heroSlides.map((slide, index) => (
                  <CarouselItem key={index} className="pl-0">
                    <div className="relative grid min-h-[330px] overflow-hidden bg-secondary sm:min-h-[390px] md:grid-cols-[1.05fr_0.95fr]">
                      <div className="relative z-10 flex flex-col justify-center p-6 sm:p-10">
                        <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                          <Sparkles className="h-3.5 w-3.5" /> Fast WhatsApp checkout
                        </div>
                        <h1 className="max-w-xl text-3xl font-extrabold leading-tight text-foreground sm:text-5xl">{slide.title || profile.store_name}</h1>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">{slide.subtitle}</p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                          <Button className="rounded-full" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>
                            {slide.cta_text || "Shop Now"}<ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button variant="outline" className="rounded-full" asChild>
                            <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">WhatsApp Store</a>
                          </Button>
                        </div>
                      </div>
                      <div className="relative min-h-[190px] md:min-h-full">
                        {slide.image_url ? (
                          <img src={slide.image_url} alt={slide.title || profile.store_name} className="absolute inset-0 h-full w-full object-cover" loading={index === 0 ? "eager" : "lazy"} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center whatsapp-gradient">
                            <ShoppingBag className="h-24 w-24 text-primary-foreground/75" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {heroSlides.length > 1 && (
                <>
                  <CarouselPrevious className="left-3 top-auto bottom-3 sm:left-4 sm:top-1/2 sm:bottom-auto" />
                  <CarouselNext className="left-14 top-auto bottom-3 sm:left-auto sm:right-4 sm:top-1/2 sm:bottom-auto" />
                </>
              )}
            </Carousel>
          </section>
        )}

        <div className="mb-5 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-10 h-11 rounded-full bg-card shadow-sm" />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !activeCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {storeSettings?.featured_enabled !== false && featuredProducts.length > 0 && (
          <section id="featured" className="mb-8 sm:mb-12">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Best picks</p>
                <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">{storeSettings?.featured_title || "Featured Products"}</h2>
              </div>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>View all</Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((p) => (
                <div key={p.id} className="group grid grid-cols-[108px_1fr] overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:block">
                  <Link to={`/store/${storeName}/product/${p.id}`} className="block bg-muted">
                    <div className="aspect-square overflow-hidden">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center"><Image className="h-10 w-10 text-muted-foreground/40" /></div>}
                    </div>
                  </Link>
                  <div className="flex min-w-0 flex-col p-3">
                    <Badge className="mb-2 w-fit">Featured</Badge>
                    <Link to={`/store/${storeName}/product/${p.id}`} className="font-semibold leading-tight line-clamp-2 hover:text-primary">{p.name}</Link>
                    <p className="mt-1 text-lg font-extrabold text-primary">Rs {p.price.toLocaleString()}</p>
                    <Button size="sm" className="mt-auto rounded-full" onClick={() => handleAddToCart(p)} disabled={p.stock_count !== null && p.stock_count <= 0}>Add</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && products.length > 0 && (
          <p className="text-center text-muted-foreground py-12">No products match your search</p>
        )}
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-16 text-lg">No products available yet.</p>
        ) : (
          <section id="products">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Catalog</p>
            <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">All Products</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((p) => (
              <div key={p.id} className="group bg-card rounded-xl border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <Link to={`/store/${storeName}/product/${p.id}`} className="block">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Image className="w-12 h-12 text-muted-foreground/40" /></div>
                    )}
                    {p.stock_count !== null && p.stock_count <= 5 && (
                      <Badge variant={p.stock_count === 0 ? "destructive" : "secondary"} className="absolute top-2 left-2 text-[10px]">
                        {p.stock_count === 0 ? "Out of Stock" : `Only ${p.stock_count} left`}
                      </Badge>
                    )}
                  </div>
                </Link>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <Link to={`/store/${storeName}/product/${p.id}`}>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 leading-tight hover:text-primary transition-colors">{p.name}</h3>
                  </Link>
                  {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                  <p className="text-lg sm:text-xl font-bold text-primary mt-1">Rs {p.price.toLocaleString()}</p>
                  {p.variants && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.variants.split(",").slice(0, 3).map((v, i) => (
                        <span key={i} className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{v.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto pt-3">
                    <Button className="w-full rounded-full" size="sm" onClick={() => handleAddToCart(p)} disabled={p.stock_count !== null && p.stock_count <= 0}>
                      <ShoppingCart className="w-4 h-4 mr-1.5" />Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </section>
        )}
      </main>

      <footer className="border-t bg-card mt-8 py-8">
        <div className="container max-w-6xl mx-auto px-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-bold text-foreground">{profile.store_name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{storeSettings?.footer_text || "Thank you for shopping with us."}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full" asChild><a href={`tel:${callNumber}`}><Phone className="mr-1.5 h-4 w-4" />Call</a></Button>
            <Button size="sm" className="rounded-full" asChild><a href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1.5 h-4 w-4" />WhatsApp</a></Button>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Powered by <span className="font-semibold text-primary">Syedom</span></p>
      </footer>

      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutDialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} storeUserId={profile.user_id} storeName={profile.store_name} whatsapp={profile.whatsapp} />
      <ContactButtons whatsapp={profile.whatsapp} storeName={profile.store_name} />
      <RecentOrdersPopup storeUserId={profile.user_id} />
      <ChatWidget storeUserId={profile.user_id} storeName={profile.store_name} whatsapp={profile.whatsapp} />
    </div>
  );
};

const StorePage = () => (
  <CartProvider><StoreContent /></CartProvider>
);

export default StorePage;
