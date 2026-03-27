import { Megaphone } from "lucide-react";

interface Props {
  text: string;
}

const OfferBanner = ({ text }: Props) => {
  if (!text) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm font-medium overflow-hidden">
      <div className="flex items-center justify-center gap-2 animate-pulse">
        <Megaphone className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{text}</span>
      </div>
    </div>
  );
};

export default OfferBanner;
