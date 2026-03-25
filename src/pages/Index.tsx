import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Store, Bot, Zap, ArrowRight, ShoppingBag, Tag, Mail } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg whatsapp-gradient flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Syedom</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="container px-4 py-20 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm mb-6">
          <Zap className="w-3 h-3" />
          Built for Pakistani sellers
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
          1 Click WhatsApp Ordering{" "}
          <span className="text-primary">& CRM System</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
          A simple alternative to Shopify for Pakistani sellers 🇵🇰. Create your online store, manage orders, and sell via WhatsApp.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="/auth">
              Create Your Store
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container px-4 py-16 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Store, title: "Simple Store", desc: "Create your store page with products, prices, and variants in minutes." },
            { icon: ShoppingBag, title: "Cart & Orders", desc: "Multi-product cart, order capture, and full order management dashboard." },
            { icon: Bot, title: "Smart Chatbot", desc: "Auto-respond with custom replies, pattern matching, and AI fallback." },
            { icon: Tag, title: "Coupons & Discounts", desc: "Create percentage or fixed-amount coupons to boost your sales." },
            { icon: Mail, title: "Email Notifications", desc: "Auto-send order confirmations to buyers and alerts to sellers." },
            { icon: MessageSquare, title: "WhatsApp CRM", desc: "Manage customer conversations and orders through WhatsApp." },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Syedom — A simple alternative to Shopify for Pakistani sellers 🇵🇰</p>
      </footer>
    </div>
  );
};

export default Index;
