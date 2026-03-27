import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Store, Bot, Zap, ArrowRight, ShoppingBag, Tag, Mail, CheckCircle, Menu, X } from "lucide-react";
import { useState } from "react";

const WHATSAPP_CTA = "https://wa.me/923428688311?text=Hi%20Syedom!%20I%20want%20to%20get%20started.";

const Index = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first Nav */}
      <nav className="border-b bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg whatsapp-gradient flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Syedom</span>
          </div>
          <div className="hidden sm:flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
          <button className="sm:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="sm:hidden border-t px-4 py-3 space-y-2 bg-card animate-fade-in">
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild onClick={() => setMobileMenu(false)}>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" className="w-full" asChild onClick={() => setMobileMenu(false)}>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="container px-4 py-16 sm:py-20 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm mb-6">
          <Zap className="w-3 h-3" />
          Built for Pakistani sellers
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
          1 Click WhatsApp Ordering{" "}
          <span className="text-primary">& CRM System</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
          A simple alternative to Shopify for Pakistani sellers 🇵🇰. Create your online store, manage orders, and sell via WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button size="lg" asChild>
            <Link to="/auth">
              Create Your Store
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href={WHATSAPP_CTA} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat on WhatsApp
            </a>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container px-4 py-12 sm:py-16 max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: Store, title: "Simple Store", desc: "Create your store page with products, prices, and variants in minutes." },
            { icon: ShoppingBag, title: "Cart & Orders", desc: "Multi-product cart, order capture, and full order management dashboard." },
            { icon: Bot, title: "Smart Chatbot", desc: "Auto-respond with custom replies, pattern matching, and AI fallback." },
            { icon: Tag, title: "Coupons & Discounts", desc: "Create percentage or fixed-amount coupons to boost your sales." },
            { icon: Mail, title: "Email Notifications", desc: "Auto-send order confirmations to buyers and alerts to sellers." },
            { icon: MessageSquare, title: "WhatsApp CRM", desc: "Manage customer conversations and orders through WhatsApp." },
          ].map((f, i) => (
            <div key={i} className="p-5 sm:p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container px-4 py-12 sm:py-16 max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Simple Pricing</h2>
          <p className="text-muted-foreground mt-2">No monthly fees. Pay once, use forever.</p>
        </div>
        <div className="rounded-2xl border-2 border-primary bg-card p-6 sm:p-8 text-center shadow-lg">
          <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">Lifetime Access</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl sm:text-5xl font-extrabold text-foreground">PKR 2,000</span>
          </div>
          <p className="text-muted-foreground text-sm mt-2 mb-6">One-time payment • No recurring fees</p>
          <ul className="text-left space-y-3 mb-8">
            {["Unlimited Products", "Order Management", "WhatsApp Integration", "Smart Chatbot", "Coupons & Discounts", "Product Categories", "Custom Store Page"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Button size="lg" className="w-full rounded-full" asChild>
            <a href={WHATSAPP_CTA} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="w-4 h-4 mr-2" />
              Get Started on WhatsApp
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Syedom — A simple alternative to Shopify for Pakistani sellers 🇵🇰</p>
      </footer>
    </div>
  );
};

export default Index;
