import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Package, X, Check, Upload, Image, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  variants: string | null;
  image_url: string | null;
}

interface Props {
  userId: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ProductManager = ({ userId }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: "", variants: "", image_url: "", stock_count: "", video_url: "", description: "" });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setProducts(data as Product[]);
  };

  useEffect(() => { load(); }, [userId]);

  const resetForm = () => {
    setForm({ name: "", price: "", variants: "", image_url: "", stock_count: "", video_url: "", description: "" });
    setShowForm(false);
    setEditId(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageUpload = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      setImagePreview(urlData.publicUrl);
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }

    const payload = {
      user_id: userId,
      name: form.name,
      price: parseFloat(form.price),
      variants: form.variants || null,
      image_url: form.image_url || null,
      stock_count: form.stock_count ? parseInt(form.stock_count) : null,
      video_url: form.video_url || null,
      description: form.description || null,
    };

    if (editId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editId);
      if (error) toast.error("Failed to update");
      else toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast.error("Failed to add product");
      else toast.success("Product added!");
    }
    resetForm();
    load();
  };

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, price: p.price.toString(), variants: p.variants || "", image_url: p.image_url || "", stock_count: (p as any).stock_count?.toString() || "", video_url: (p as any).video_url || "" });
    setEditId(p.id);
    setImagePreview(p.image_url || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Product deleted"); load(); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Products
        </CardTitle>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 rounded-lg bg-secondary animate-fade-in">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-xs">Product Image</Label>
              <div className="flex items-start gap-3">
                <div
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                  ) : imagePreview || form.image_url ? (
                    <img src={imagePreview || form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Image className="w-6 h-6 text-muted-foreground mx-auto" />
                      <span className="text-[10px] text-muted-foreground">Upload</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    {uploading ? "Uploading..." : "Choose File"}
                  </Button>
                  <p className="text-[10px] text-muted-foreground">JPG, PNG, WEBP • Max 2MB</p>
                  <Input
                    value={form.image_url}
                    onChange={(e) => { setForm({ ...form, image_url: e.target.value }); setImagePreview(e.target.value); }}
                    placeholder="Or paste image URL"
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price (Rs)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="2500" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Variants (optional)</Label>
              <Input value={form.variants} onChange={(e) => setForm({ ...form, variants: e.target.value })} placeholder="Red, Blue, Large, Small" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Stock Count (optional)</Label>
                <Input type="number" value={form.stock_count} onChange={(e) => setForm({ ...form, stock_count: e.target.value })} placeholder="e.g. 50" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Video URL (optional)</Label>
                <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="YouTube link" />
              </div>
            </div>
            <Button onClick={handleSubmit} size="sm" disabled={uploading}>
              <Check className="w-4 h-4 mr-1" />
              {editId ? "Update" : "Add Product"}
            </Button>
          </div>
        )}

        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No products yet. Add your first product!</p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-md object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                    <Image className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-sm text-primary font-semibold">Rs {p.price}</p>
                  {p.variants && <p className="text-xs text-muted-foreground">{p.variants}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
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

export default ProductManager;
