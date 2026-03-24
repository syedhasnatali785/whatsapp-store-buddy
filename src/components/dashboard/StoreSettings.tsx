import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Store } from "lucide-react";

interface Props {
  userId: string;
}

const StoreSettings = ({ userId }: Props) => {
  const [storeName, setStoreName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("store_name, whatsapp")
        .eq("user_id", userId)
        .single();
      if (data) {
        setStoreName(data.store_name);
        setWhatsapp(data.whatsapp);
      }
    };
    load();
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ store_name: storeName, whatsapp })
      .eq("user_id", userId);
    if (error) toast.error("Failed to save");
    else toast.success("Store settings saved!");
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          Store Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Store Name</Label>
          <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="My Store" />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp Number</Label>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="923001234567" />
        </div>
        <p className="text-sm text-muted-foreground">
          Your store link: <span className="font-mono text-primary">/store/{storeName.toLowerCase().replace(/\s+/g, '-')}</span>
        </p>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default StoreSettings;
