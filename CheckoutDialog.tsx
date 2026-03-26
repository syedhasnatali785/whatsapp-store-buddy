import { useState } from "react";
import { useCart } from "./CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Tag } from "lucide-react";

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
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("user_id", storeUserId)
      .eq("code", couponCode.trim().toUpperCase())
      .eq("active", true)
      .single();

    if (!data) {
      toast.error("Invalid or expired coupon");
      return;
    }

    const coupon = data as any;
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      toast.error("Coupon usage limit reached");
      return;
    }
    if (coupon.min_order > totalPrice) {
      toast.error(`Minimum order Rs ${coupon.min_order} required`);
      return;
    }

    let disc = 0;
    if (coupon.type === "percentage") {
      disc = Math.round(totalPrice * (coupon.value / 100));
    } else {
      disc = Math.min(coupon.value, totalPrice);
    }
    setDiscount(disc);
    setCouponApplied(coupon.id);
    toast.success(`Coupon applied! Rs ${disc.toLocaleString()} off`);
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponApplied("");
    setCouponCode("");
  };

  const finalTotal = Math.max(0, totalPrice - discount);

  const handleCheckout = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    setSubmitting(true);
    try {
      const orderProducts = items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image_url: i.image_url,
      }));

      // Save order to database
      await supabase.from("orders").insert({
        user_id: storeUserId,
        customer_name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        products: orderProducts as any,
        total_price: finalTotal,
        status: "pending",
      });

      // Increment coupon used_count
      if (couponApplied) {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("used_count")
          .eq("id", couponApplied)
          .single();
        if (coupon) {
          await supabase
            .from("coupons")
            .update({ used_count: (coupon as any).used_count + 1 } as any)
            .eq("id", couponApplied);
        }
      }

      // Build WhatsApp message without links and with better formatting
      const productList = items
        .map((product, idx) => {
          return `*${idx + 1}.* *${product.name}* (_x${product.quantity}_)\n   💲 _Rs ${(product.price * product.quantity).toLocaleString()}_`;
        })
        .join("\n\n");

      const discountLine = discount > 0 ? `\n💰 *Discount:* _-Rs ${discount.toLocaleString()}_` : "";

      const orderMessage = `🛒 *New Order Summary* 🛒\n\n📦 *Items:*\n${productList}\n\n━━━━━━━━━━━━━━━━━━\n📊 *Subtotal:* _Rs ${(totalPrice + discount).toLocaleString()}_${discountLine}\n🧾 *Total Amount:* *Rs ${finalTotal.toLocaleString()}*\n━━━━━━━━━━━━━━━━━━\n\n👤 *Customer Details:*\n📝 *Name:* _${form.name.trim()}_\n📞 *Phone:* _${form.phone.trim()}_\n📍 *Address:* _${form.address.trim()}_`;

      const encodedMessage = encodeURIComponent(orderMessage);

      clearCart();
      setForm({ name: "", phone: "", address: "" });
      removeCoupon();
      onClose();

      // Open WhatsApp with message
      window.open(`https://wa.me/${whatsapp}?text=${encodedMessage}`, "_blank");

      toast.success("Order placed! Opening WhatsApp...");
    } catch (error) {
      console.error("Checkout error:", error);
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
                <div className="flex-1">
                  <span className="font-medium">{i.name} x{i.quantity}</span>
                </div>
                <span className="font-medium">Rs {(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
            {discount > 0 && (
              <div className="flex justify-between text-primary mt-2">
                <span>Discount ({couponCode.toUpperCase()})</span>
                <span>-Rs {discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">Rs {finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Coupon */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="pl-8 text-sm"
                disabled={!!couponApplied}
              />
            </div>
            {couponApplied ? (
              <Button variant="outline" size="sm" onClick={removeCoupon}>
                Remove
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={applyCoupon}>
                Apply
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="03001234567"
              />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Delivery address"
              />
            </div>
          </div>

          <Button className="w-full rounded-full" onClick={handleCheckout} disabled={submitting || items.length === 0}>
            <Send className="w-4 h-4 mr-2" />
            {submitting ? "Placing Order..." : "Send Order via WhatsApp"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
