import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  whatsapp: string;
  storeName: string;
}

const ContactButtons = ({ whatsapp, storeName }: Props) => {
  const msg = encodeURIComponent(`Hi ${storeName}! I'm interested in your products.`);
  const callNumber = whatsapp.startsWith("+") ? whatsapp : `+${whatsapp}`;

  return (
    <div className="fixed bottom-6 left-4 z-40 flex flex-col gap-2">
      <a href={`tel:${callNumber}`} className="w-12 h-12 rounded-full bg-blue-500 shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
        <Phone className="w-5 h-5 text-white" />
      </a>
      <a href={`https://wa.me/${whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full whatsapp-gradient shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
        <MessageCircle className="w-5 h-5 text-white" />
      </a>
    </div>
  );
};

export default ContactButtons;
