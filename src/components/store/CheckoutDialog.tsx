import { useState } from "react";
import { useCart } from "./CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  storeUserId: string;
  storeName: string;
  whatsapp: string;
}

const CheckoutDialog = ({ open, onClose, storeUserId, storeName, whatsapp }: Props) => {
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    setSubmitting(true);
    try {
      const orderProducts = items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }));

      await supabase.from("orders").insert({
        user_id: storeUserId,
        customer_name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        products: orderProducts as any,
        total_price: totalPrice,
        status: "pending",
      });

      // Build WhatsApp message
      const productList = items.map((i) => `• ${i.name} x${i.quantity} — Rs ${(i.price * i.quantity).toLocaleString()}`).join("\n");
      const msg = encodeURIComponent(
        `Hi ${storeName}! I want to order:\n\n${productList}\n\nTotal: Rs ${totalPrice.toLocaleString()}\n\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}`
      );

      clearCart();
      setForm({ name: "", phone: "", address: "" });
      onClose();

      window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
    } catch {
      toast.error("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-secondary p-3 space-y-1 text-sm">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span>{i.name} x{i.quantity}</span>
                <span className="font-medium">Rs {(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-1 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">Rs {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
            </div>
            <div className="space-y-1">
              <Label>Phone *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03001234567" />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Delivery address" />
            </div>
          </div>

          <Button className="w-full rounded-full" onClick={handleCheckout} disabled={submitting || items.length === 0}>
            <Send className="w-4 h-4 mr-2" />
            {submitting ? "Placing Order..." : "Place Order via WhatsApp"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
