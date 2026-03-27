import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Megaphone, Timer } from "lucide-react";

interface Props {
  userId: string;
}

const StoreCustomization = ({ userId }: Props) => {
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerEnd, setTimerEnd] = useState("");
  const [timerLabel, setTimerLabel] = useState("Limited Time Offer!");
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
      }
    };
    load();
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      user_id: userId,
      offer_banner_enabled: bannerEnabled,
      offer_banner_text: bannerText,
      urgency_timer_enabled: timerEnabled,
      urgency_timer_end: timerEnd ? new Date(timerEnd).toISOString() : null,
      urgency_timer_label: timerLabel,
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
