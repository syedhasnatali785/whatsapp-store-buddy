import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface Props {
  endTime: string;
  label: string;
}

const UrgencyTimer = ({ endTime, label }: Props) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); setTimeLeft("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d > 0 ? `${d}d ` : ""}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (expired) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-3">
      <Timer className="w-5 h-5 text-destructive flex-shrink-0 animate-pulse" />
      <div>
        <p className="text-xs font-semibold text-destructive">{label}</p>
        <p className="text-lg font-bold font-mono text-foreground">{timeLeft}</p>
      </div>
    </div>
  );
};

export default UrgencyTimer;
