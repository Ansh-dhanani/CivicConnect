import { TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Usage example:
// With custom data from your API/state
// const potholeMetrics = [
//   {
//     title: "Total Potholes Reported",
//     value: apiData.totalPotholes,
//     trend: apiData.potholesTrend,
//     trendLabel: "Reports increased this month",
//     footerText: "Compared to last month"
//   },
//   // ... more metrics
// ];
// <SectionCards metrics={potholeMetrics} />
//
// Or use default data
// <SectionCards />

interface MetricCardData {
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  footerText: string;
}

interface SectionCardsProps {
  metrics?: MetricCardData[];
}

export function SectionCards({ metrics }: SectionCardsProps) {
  const defaultMetrics: MetricCardData[] = [
    {
      title: "Total Potholes Reported",
      value: "1,247",
      trend: 18.3,
      trendLabel: "Reports increased this month",
      footerText: "Compared to last month",
    },
    {
      title: "Potholes Repaired",
      value: "892",
      trend: -8.2,
      trendLabel: "Repair rate decreased",
      footerText: "Maintenance resources needed",
    },
    {
      title: "Active Citizen Reports",
      value: "3,456",
      trend: 24.7,
      trendLabel: "Strong community engagement",
      footerText: "Public participation growing",
    },
    {
      title: "Average Response Time",
      value: "4.2d",
      trend: -12.5,
      trendLabel: "Response time improved",
      footerText: "Faster than target (5 days)",
    },
  ];

  const displayMetrics = metrics || defaultMetrics;

  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      {displayMetrics.map((metric) => {
        const isPositiveTrend = metric.trend > 0;
        const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

        return (
          <Card key={metric.title} className="@container/card">
            <CardHeader>
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
                {metric.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon />
                  {isPositiveTrend ? "+" : ""}
                  {metric.trend}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {metric.trendLabel} <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">{metric.footerText}</div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export default SectionCards;
