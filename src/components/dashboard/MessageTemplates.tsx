import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Props { userId: string }

export type TemplateKey = "confirm" | "dispatch" | "delivery" | "cancel";

export const DEFAULT_TEMPLATES: Record<TemplateKey, string> = {
  confirm: `Assalam o Alaikum {name}, aapka order confirm ho gaya hai.\n\nProducts:\n{products}\n\nTotal: Rs {price}\nAddress: {address}\n\nShukriya! 🙏`,
  dispatch: `Assalam o Alaikum {name}, aapka order dispatch ho gaya hai! 🎉\n\nProducts:\n{products}\n\nTotal: Rs {price}\nAddress: {address}\n\nJald aapko mil jayega, InshaAllah!`,
  delivery: `Assalam o Alaikum {name}, aapka order delivery ke liye nikal chuka hai! 🚚\n\nProducts:\n{products}\n\nTotal: Rs {price}\nAddress: {address}\n\nPlease apna phone on rakhein. Shukriya!`,
  cancel: `Assalam o Alaikum {name}, maazrat ke saath aapka order cancel karna par raha hai.\n\nProducts:\n{products}\n\nTotal: Rs {price}\n\nAgar koi sawal ho toh zaroor poochein. Shukriya!`,
};

const META: Record<TemplateKey, { label: string }> = {
  confirm: { label: "✅ Confirm" },
  dispatch: { label: "📦 Dispatch" },
  delivery: { label: "🚚 Delivery" },
  cancel: { label: "❌ Cancel" },
};

const MessageTemplates = ({ userId }: Props) => {
  const [templates, setTemplates] = useState<Record<TemplateKey, string>>(DEFAULT_TEMPLATES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("whatsapp_templates")
        .eq("user_id", userId)
        .maybeSingle();
      const t = (data as any)?.whatsapp_templates ?? {};
      setTemplates({ ...DEFAULT_TEMPLATES, ...t });
    };
    load();
  }, [userId]);

  const save = async () => {
    setSaving(true);
    const { data: existing } = await supabase
      .from("store_settings").select("id").eq("user_id", userId).maybeSingle();
    const payload = { whatsapp_templates: templates as any } as any;
    const { error } = existing
      ? await supabase.from("store_settings").update(payload).eq("user_id", userId)
      : await supabase.from("store_settings").insert({ user_id: userId, ...payload });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Templates saved");
  };

  const reset = (key: TemplateKey) =>
    setTemplates((prev) => ({ ...prev, [key]: DEFAULT_TEMPLATES[key] }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> WhatsApp Message Templates
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Use <code>{"{name}"}</code>, <code>{"{products}"}</code>, <code>{"{price}"}</code>, <code>{"{address}"}</code> as placeholders.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.keys(META) as TemplateKey[]).map((k) => (
          <div key={k} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">{META[k].label}</Label>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => reset(k)}>
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
            </div>
            <Textarea
              rows={6}
              value={templates[k]}
              onChange={(e) => setTemplates((p) => ({ ...p, [k]: e.target.value }))}
              className="text-xs font-mono"
            />
          </div>
        ))}
        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Templates"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MessageTemplates;