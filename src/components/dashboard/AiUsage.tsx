import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, AlertTriangle } from "lucide-react";

interface Props {
  userId: string;
}

const AiUsage = ({ userId }: Props) => {
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(30);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("ai_requests_count, ai_limit")
        .eq("user_id", userId)
        .single();
      if (data) {
        setUsed(data.ai_requests_count);
        setLimit(data.ai_limit);
      }
    };
    load();
  }, [userId]);

  const percentage = Math.min((used / limit) * 100, 100);
  const isExhausted = used >= limit;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Requests Used</span>
          <span className="font-semibold">{used} / {limit}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        {isExhausted && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>You've reached your AI usage limit. To continue using AI, a monthly subscription is required. Your store will continue working without AI.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiUsage;
