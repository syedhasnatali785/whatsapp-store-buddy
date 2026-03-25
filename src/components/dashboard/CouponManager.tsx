import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Tag, Plus, Trash2, X, Check } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
}

interface Props {
  userId: string;
}

const CouponManager = ({ userId }: Props) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percentage", value: "", min_order: "0", max_uses: "" });

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setCoupons(data as unknown as Coupon[]);
  };

  useEffect(() => { load(); }, [userId]);

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.value) {
      toast.error("Code and value are required");
      return;
    }
    const { error } = await supabase.from("coupons").insert({
      user_id: userId,
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      min_order: parseFloat(form.min_order) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
    } as any);
    if (error) toast.error("Failed to create coupon");
    else { toast.success("Coupon created!"); setShowForm(false); setForm({ code: "", type: "percentage", value: "", min_order: "0", max_uses: "" }); load(); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ active: !active } as any).eq("id", id);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Coupon deleted");
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Tag className="w-5 h-5 text-primary" />Coupons</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>{showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 rounded-lg bg-secondary animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Coupon Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE10" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (Rs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Value</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "percentage" ? "10" : "200"} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min Order (Rs)</Label>
                <Input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Uses</Label>
                <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="∞" />
              </div>
            </div>
            <Button size="sm" onClick={handleSubmit}><Check className="w-4 h-4 mr-1" />Create Coupon</Button>
          </div>
        )}

        {coupons.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No coupons yet. Create your first coupon!</p>
        ) : (
          <div className="space-y-2">
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{c.code}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {c.type === "percentage" ? `${c.value}% off` : `Rs ${c.value} off`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Used: {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""} • Min: Rs {c.min_order}
                  </p>
                </div>
                <Switch checked={c.active} onCheckedChange={() => toggleActive(c.id, c.active)} />
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CouponManager;
