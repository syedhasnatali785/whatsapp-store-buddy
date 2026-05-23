import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Megaphone, Timer, Images, Star, Plus, Trash2, LayoutTemplate } from "lucide-react";

interface Props {
  userId: string;
}

interface HeroSlide {
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
}

const emptySlide: HeroSlide = {
  title: "Fresh deals for your family",
  subtitle: "Order instantly on WhatsApp with fast delivery.",
  image_url: "",
  cta_text: "Shop Now",
};

const StoreCustomization = ({ userId }: Props) => {
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerEnd, setTimerEnd] = useState("");
  const [timerLabel, setTimerLabel] = useState("Limited Time Offer!");
  const [headerAnnouncement, setHeaderAnnouncement] = useState("Fast WhatsApp ordering across Pakistan");
  const [heroEnabled, setHeroEnabled] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>([{ ...emptySlide }]);
  const [featuredEnabled, setFeaturedEnabled] = useState(true);
  const [featuredTitle, setFeaturedTitle] = useState("Featured Products");
  const [featuredLimit, setFeaturedLimit] = useState("4");
  const [footerText, setFooterText] = useState("Thank you for shopping with us.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("store_settings").select("*").eq("user_id", userId).single();
      if (data) {
        setBannerEnabled(data.offer_banner_enabled);
        setBannerText(data.offer_banner_text || "");
        setTimerEnabled(data.urgency_timer_enabled);
        setTimerEnd(data.urgency_timer_end ? new Date(data.urgency_timer_end).toISOString().slice(0, 16) : "");
        setTimerLabel(data.urgency_timer_label || "Limited Time Offer!");
        setHeaderAnnouncement((data as any).header_announcement || "Fast WhatsApp ordering across Pakistan");
        setHeroEnabled((data as any).hero_slider_enabled ?? true);
        const savedSlides = Array.isArray((data as any).hero_slides) ? (data as any).hero_slides : [];
        setSlides(savedSlides.length ? savedSlides.map((slide: any) => ({ ...emptySlide, ...slide })) : [{
          title: (data as any).hero_title || emptySlide.title,
          subtitle: (data as any).hero_subtitle || emptySlide.subtitle,
          image_url: (data as any).hero_image_url || "",
          cta_text: (data as any).hero_cta_text || emptySlide.cta_text,
        }]);
        setFeaturedEnabled((data as any).featured_enabled ?? true);
        setFeaturedTitle((data as any).featured_title || "Featured Products");
        setFeaturedLimit(String((data as any).featured_limit || 4));
        setFooterText((data as any).footer_text || "Thank you for shopping with us.");
      }
    };
    load();
  }, [userId]);

  const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
    setSlides((current) => current.map((slide, i) => i === index ? { ...slide, [field]: value } : slide));
  };

  const addSlide = () => setSlides((current) => [...current, { ...emptySlide }]);
  const removeSlide = (index: number) => setSlides((current) => current.length > 1 ? current.filter((_, i) => i !== index) : current);

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      user_id: userId,
      offer_banner_enabled: bannerEnabled,
      offer_banner_text: bannerText,
      urgency_timer_enabled: timerEnabled,
      urgency_timer_end: timerEnd ? new Date(timerEnd).toISOString() : null,
      urgency_timer_label: timerLabel,
      header_announcement: headerAnnouncement,
      hero_slider_enabled: heroEnabled,
      hero_slides: slides,
      hero_title: slides[0]?.title || "",
      hero_subtitle: slides[0]?.subtitle || "",
      hero_image_url: slides[0]?.image_url || "",
      hero_cta_text: slides[0]?.cta_text || "Shop Now",
      featured_enabled: featuredEnabled,
      featured_title: featuredTitle,
      featured_limit: Math.max(1, Math.min(12, Number(featuredLimit) || 4)),
      footer_text: footerText,
    };

    const { data: existing } = await supabase.from("store_settings").select("id").eq("user_id", userId).single();
    
    if (existing) {
      const { error } = await supabase.from("store_settings").update(payload).eq("user_id", userId);
      if (error) toast.error("Failed to save");
      else toast.success("Settings saved!");
    } else {
      const { error } = await supabase.from("store_settings").insert(payload);
      if (error) toast.error("Failed to save");
      else toast.success("Settings saved!");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="w-5 h-5 text-primary" />
            Offer Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Enable Banner</Label>
            <Switch checked={bannerEnabled} onCheckedChange={setBannerEnabled} />
          </div>
          {bannerEnabled && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-xs">Banner Text</Label>
              <Input value={bannerText} onChange={(e) => setBannerText(e.target.value)} placeholder="e.g. Free Delivery on orders above Rs 2000!" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="w-5 h-5 text-primary" />
            Urgency Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Enable Timer</Label>
            <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} />
          </div>
          {timerEnabled && (
            <div className="space-y-3 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-xs">Timer Label</Label>
                <Input value={timerLabel} onChange={(e) => setTimerLabel(e.target.value)} placeholder="Limited Time Offer!" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Ends At</Label>
                <Input type="datetime-local" value={timerEnd} onChange={(e) => setTimerEnd(e.target.value)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        Save Customization
      </Button>
    </div>
  );
};

export default StoreCustomization;
