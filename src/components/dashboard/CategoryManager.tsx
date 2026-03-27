import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, FolderOpen, X, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Props {
  userId: string;
}

const CategoryManager = ({ userId }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setCategories(data as Category[]);
  };

  useEffect(() => { load(); }, [userId]);

  const handleAdd = async () => {
    if (!name.trim()) { toast.error("Category name is required"); return; }
    const { error } = await supabase.from("categories").insert({ user_id: userId, name: name.trim() });
    if (error) toast.error("Failed to add");
    else { toast.success("Category added!"); setName(""); setShowForm(false); load(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Category deleted"); load(); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Categories
        </CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="flex gap-2 p-3 rounded-lg bg-secondary animate-fade-in">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="flex-1" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
            <Button onClick={handleAdd} size="sm"><Check className="w-4 h-4" /></Button>
          </div>
        )}
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No categories yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-card text-sm">
                <span>{c.name}</span>
                <button onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
