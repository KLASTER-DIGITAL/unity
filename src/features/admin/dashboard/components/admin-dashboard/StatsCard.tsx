import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

/**
 * Stats Card Component
 * Reusable card for displaying statistics
 */

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  subtitle: string;
  className?: string;
}

export function StatsCard({ icon: Icon, title, value, subtitle, className }: StatsCardProps) {
  return (
    <Card className={`border-border ${className || ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px]! font-normal! text-muted-foreground flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-[34px]! text-foreground">{value}</div>
        <p className="text-[13px]! text-muted-foreground font-normal! mt-1">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}

