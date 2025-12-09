import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "bg-primary/10 text-primary",
  delay = 0,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn("rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-foreground break-words leading-tight" title={value}>{value}</p>
          {change && (
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
              title={change}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-3 flex-shrink-0", iconColor)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
