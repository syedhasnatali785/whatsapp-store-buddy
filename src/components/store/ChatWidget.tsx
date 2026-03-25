import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  role: "user" | "bot";
  content: string;
  showWhatsApp?: boolean;
}

interface Props {
  storeUserId: string;
  storeName: string;
  whatsapp: string;
}

const PATTERN_RESPONSES: Record<string, string> = {
  price: "Please check the product listing above for prices. You can also order via WhatsApp!",
  delivery: "We deliver across Pakistan! Delivery usually takes 2-5 business days.",
  available: "Please check our product list above. If a product is listed, it's available!",
  payment: "We accept Cash on Delivery (COD) and bank transfer. Details shared on WhatsApp.",
  return: "Returns accepted within 7 days of delivery. Contact us on WhatsApp for returns.",
  hello: "Hello! 👋 Welcome to our store. How can I help you today?",
  hi: "Hi there! 👋 How can I help you?",
  order: "To place an order, add items to your cart and checkout!",
};

const SELLER_ENGAGEMENT_KEYWORDS = ["custom", "bulk", "wholesale", "negotiate", "special", "urgent", "complaint", "refund", "exchange", "damaged", "broken", "wrong", "issue", "problem", "talk", "speak", "call", "manager"];

const ChatWidget = ({ storeUserId, storeName, whatsapp }: Props) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: `Welcome to ${storeName}! 👋 How can I help you today?` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getResponse = async (userMsg: string): Promise<{ text: string; showWhatsApp: boolean }> => {
    const lower = userMsg.toLowerCase();

    // Check if this needs seller engagement
    const needsSeller = SELLER_ENGAGEMENT_KEYWORDS.some((k) => lower.includes(k));
    if (needsSeller) {
      return {
        text: "This seems like something our team can help with directly. Would you like to chat with us on WhatsApp?",
        showWhatsApp: true,
      };
    }

    // Step 1: Custom replies
    const { data: replies } = await supabase.from("custom_replies").select("keyword, response").eq("user_id", storeUserId);
    if (replies) {
      for (const r of replies) {
        if (lower.includes(r.keyword.toLowerCase())) return { text: r.response, showWhatsApp: false };
      }
    }

    // Step 2: Pattern matching
    for (const [key, resp] of Object.entries(PATTERN_RESPONSES)) {
      if (lower.includes(key)) return { text: resp, showWhatsApp: false };
    }

    // Step 3: AI fallback
    try {
      const { data: profile } = await supabase.from("profiles").select("ai_requests_count, ai_limit").eq("user_id", storeUserId).single();
      if (!profile || profile.ai_requests_count >= profile.ai_limit) {
        return { text: "I'm not sure about that. Would you like to chat with us on WhatsApp?", showWhatsApp: true };
      }
      const resp = await supabase.functions.invoke("store-chat", { body: { message: userMsg, storeUserId, storeName } });
      if (resp.data?.reply) return { text: resp.data.reply, showWhatsApp: false };
    } catch { /* fallback */ }

    return { text: "I'm not sure about that. Would you like to chat with us on WhatsApp?", showWhatsApp: true };
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const { text, showWhatsApp } = await getResponse(userMsg);
    setMessages((prev) => [...prev, { role: "bot", content: text, showWhatsApp }]);
    setLoading(false);
  };

  const openWhatsApp = (context?: string) => {
    const msg = encodeURIComponent(`Hi ${storeName}! ${context || "I need help with something."}`);
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full whatsapp-gradient shadow-lg flex items-center justify-center z-50 hover:scale-105 transition-transform">
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] bg-card border rounded-2xl shadow-2xl flex flex-col z-50 animate-slide-up overflow-hidden">
          <div className="whatsapp-gradient px-4 py-3 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">{storeName}</p>
                <p className="text-xs text-primary-foreground/70">Online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-whatsapp-chat">
            {messages.map((m, i) => (
              <div key={i}>
                <div className={`chat-bubble ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
                {m.showWhatsApp && m.role === "bot" && (
                  <div className="mr-auto mt-2 max-w-[80%]">
                    <Button size="sm" variant="outline" className="rounded-full text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => openWhatsApp()}>
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat on WhatsApp
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble-bot"><p className="text-sm text-muted-foreground">Typing...</p></div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t bg-card">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1" disabled={loading} />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}><Send className="w-4 h-4" /></Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
