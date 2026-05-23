import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, MessageCircle, X, Check, Edit2 } from "lucide-react";

interface Reply {
  id: string;
  keyword: string;
  response: string;
}

interface Props {
  userId: string;
}

const CustomReplies = ({ userId }: Props) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ keyword: "", response: "" });

  const load = async () => {
    const { data } = await supabase.from("custom_replies").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setReplies(data as Reply[]);
  };

  useEffect(() => { load(); }, [userId]);

  const resetForm = () => {
    setForm({ keyword: "", response: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.keyword || !form.response) {
      toast.error("Both keyword and response are required");
      return;
    }

    const payload = {
      user_id: userId,
      keyword: form.keyword.toLowerCase().trim(),
      response: form.response.trim(),
    };

    const { error } = editId
      ? await supabase.from("custom_replies").update(payload).eq("id", editId).eq("user_id", userId)
      : await supabase.from("custom_replies").insert(payload);

    if (error) toast.error(editId ? "Failed to update" : "Failed to add");
    else { toast.success(editId ? "Reply updated!" : "Reply added!"); resetForm(); load(); }
  };

  const handleEdit = (reply: Reply) => {
    setForm({ keyword: reply.keyword, response: reply.response });
    setEditId(reply.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("custom_replies").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Reply deleted"); load(); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Custom Replies
        </CardTitle>
        <Button size="sm" onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 rounded-lg bg-secondary animate-fade-in">
            <div className="space-y-1">
              <Label className="text-xs">Keyword</Label>
              <Input value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} placeholder="e.g. price, delivery, available" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Response</Label>
              <Textarea value={form.response} onChange={(e) => setForm({ ...form, response: e.target.value })} placeholder="The response to send when this keyword is detected" rows={3} />
            </div>
            <Button onClick={handleSave} size="sm">
              <Check className="w-4 h-4 mr-1" />
              {editId ? "Update Reply" : "Add Reply"}
            </Button>
          </div>
        )}

        {replies.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No custom replies yet. Add keywords to auto-respond to customers!</p>
        ) : (
          <div className="space-y-2">
            {replies.map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-1">
                    {r.keyword}
                  </span>
                  <p className="text-sm text-muted-foreground">{r.response}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
                    <Edit2 className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomReplies;
