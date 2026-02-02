"use client";

import * as React from "react";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

export const description = "Pothole reports and repairs tracking chart";

interface PotholeChartData {
  date: string;
  reported: number;
  repaired: number;
}

interface ChartAreaInteractiveProps {
  data?: PotholeChartData[];
  title?: string;
  description?: string;
}

// With API data
// const potholeData = await fetchPotholeStats();
// <ChartAreaInteractive
//   data={potholeData}
//   title="Municipal Pothole Tracking"
//   description="Daily reports and repair completion rates"
// />
// With default data
// <ChartAreaInteractive />

const defaultChartData: PotholeChartData[] = [
  { date: "2024-04-01", reported: 45, repaired: 32 },
  { date: "2024-04-02", reported: 52, repaired: 28 },
  { date: "2024-04-03", reported: 38, repaired: 41 },
  { date: "2024-04-04", reported: 61, repaired: 35 },
  { date: "2024-04-05", reported: 73, repaired: 58 },
  { date: "2024-04-06", reported: 55, repaired: 47 },
  { date: "2024-04-07", reported: 42, repaired: 39 },
  { date: "2024-04-08", reported: 68, repaired: 52 },
  { date: "2024-04-09", reported: 31, repaired: 29 },
  { date: "2024-04-10", reported: 49, repaired: 44 },
  { date: "2024-04-11", reported: 71, repaired: 63 },
  { date: "2024-04-12", reported: 58, repaired: 51 },
  { date: "2024-04-13", reported: 82, repaired: 69 },
  { date: "2024-04-14", reported: 44, repaired: 38 },
  { date: "2024-04-15", reported: 39, repaired: 35 },
  { date: "2024-04-16", reported: 47, repaired: 42 },
  { date: "2024-04-17", reported: 91, repaired: 76 },
  { date: "2024-04-18", reported: 78, repaired: 71 },
  { date: "2024-04-19", reported: 53, repaired: 48 },
  { date: "2024-04-20", reported: 34, repaired: 31 },
  { date: "2024-04-21", reported: 46, repaired: 40 },
  { date: "2024-04-22", reported: 51, repaired: 44 },
  { date: "2024-04-23", reported: 43, repaired: 39 },
  { date: "2024-04-24", reported: 79, repaired: 68 },
  { date: "2024-04-25", reported: 56, repaired: 50 },
  { date: "2024-04-26", reported: 29, repaired: 27 },
  { date: "2024-04-27", reported: 85, repaired: 77 },
  { date: "2024-04-28", reported: 41, repaired: 36 },
  { date: "2024-04-29", reported: 64, repaired: 55 },
  { date: "2024-04-30", reported: 93, repaired: 81 },
  { date: "2024-05-01", reported: 48, repaired: 43 },
  { date: "2024-05-02", reported: 67, repaired: 59 },
  { date: "2024-05-03", reported: 54, repaired: 47 },
  { date: "2024-05-04", reported: 88, repaired: 76 },
  { date: "2024-05-05", reported: 96, repaired: 84 },
  { date: "2024-05-06", reported: 102, repaired: 91 },
  { date: "2024-05-07", reported: 76, repaired: 68 },
  { date: "2024-05-08", reported: 45, repaired: 41 },
  { date: "2024-05-09", reported: 52, repaired: 46 },
  { date: "2024-05-10", reported: 69, repaired: 62 },
  { date: "2024-05-11", reported: 72, repaired: 65 },
  { date: "2024-05-12", reported: 51, repaired: 47 },
  { date: "2024-05-13", reported: 49, repaired: 44 },
  { date: "2024-05-14", reported: 95, repaired: 86 },
  { date: "2024-05-15", reported: 98, repaired: 87 },
  { date: "2024-05-16", reported: 74, repaired: 68 },
  { date: "2024-05-17", reported: 101, repaired: 89 },
  { date: "2024-05-18", reported: 70, repaired: 63 },
  { date: "2024-05-19", reported: 55, repaired: 49 },
  { date: "2024-05-20", reported: 47, repaired: 43 },
  { date: "2024-05-21", reported: 33, repaired: 30 },
  { date: "2024-05-22", reported: 32, repaired: 29 },
  { date: "2024-05-23", reported: 61, repaired: 55 },
  { date: "2024-05-24", reported: 66, repaired: 58 },
  { date: "2024-05-25", reported: 52, repaired: 47 },
  { date: "2024-05-26", reported: 50, repaired: 45 },
  { date: "2024-05-27", reported: 89, repaired: 79 },
  { date: "2024-05-28", reported: 57, repaired: 51 },
  { date: "2024-05-29", reported: 31, repaired: 28 },
  { date: "2024-05-30", reported: 73, repaired: 65 },
  { date: "2024-05-31", reported: 48, repaired: 44 },
  { date: "2024-06-01", reported: 46, repaired: 42 },
  { date: "2024-06-02", reported: 94, repaired: 84 },
  { date: "2024-06-03", reported: 37, repaired: 34 },
  { date: "2024-06-04", reported: 91, repaired: 81 },
  { date: "2024-06-05", reported: 35, repaired: 32 },
  { date: "2024-06-06", reported: 65, repaired: 58 },
  { date: "2024-06-07", reported: 71, repaired: 64 },
  { date: "2024-06-08", reported: 80, repaired: 72 },
  { date: "2024-06-09", reported: 92, repaired: 83 },
  { date: "2024-06-10", reported: 44, repaired: 40 },
  { date: "2024-06-11", reported: 36, repaired: 33 },
  { date: "2024-06-12", reported: 99, repaired: 88 },
  { date: "2024-06-13", reported: 33, repaired: 30 },
  { date: "2024-06-14", reported: 87, repaired: 78 },
  { date: "2024-06-15", reported: 69, repaired: 62 },
  { date: "2024-06-16", reported: 77, repaired: 69 },
  { date: "2024-06-17", reported: 103, repaired: 92 },
  { date: "2024-06-18", reported: 39, repaired: 36 },
  { date: "2024-06-19", reported: 72, repaired: 65 },
  { date: "2024-06-20", reported: 86, repaired: 77 },
  { date: "2024-06-21", reported: 46, repaired: 42 },
  { date: "2024-06-22", reported: 68, repaired: 61 },
  { date: "2024-06-23", reported: 97, repaired: 87 },
  { date: "2024-06-24", reported: 41, repaired: 38 },
  { date: "2024-06-25", reported: 43, repaired: 39 },
  { date: "2024-06-26", reported: 88, repaired: 79 },
  { date: "2024-06-27", reported: 94, repaired: 84 },
  { date: "2024-06-28", reported: 45, repaired: 41 },
  { date: "2024-06-29", reported: 38, repaired: 35 },
  { date: "2024-06-30", reported: 95, repaired: 85 },
];

const chartConfig = {
  potholes: {
    label: "Potholes",
  },
  reported: {
    label: "Reported",
    color: "var(--chart-1)",
  },
  repaired: {
    label: "Repaired",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  data,
  title = "Pothole Reports & Repairs",
  description,
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  const chartData = data || defaultChartData;

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date(chartData[chartData.length - 1].date);
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  const defaultDescription =
    timeRange === "90d"
      ? "Total for the last 3 months"
      : timeRange === "30d"
        ? "Total for the last 30 days"
        : "Total for the last 7 days";

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">{description || defaultDescription}</span>
          <span className="@[540px]/card:hidden">
            {timeRange === "90d" ? "Last 3 months" : timeRange === "30d" ? "Last 30 days" : "Last 7 days"}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden *:data-[slot=toggle-group-item]:px-4!"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex @[767px]/card:hidden w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-62 w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillReported" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-reported)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-reported)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillRepaired" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-repaired)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-repaired)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="repaired"
              type="natural"
              fill="url(#fillRepaired)"
              stroke="var(--color-repaired)"
              stackId="a"
            />
            <Area
              dataKey="reported"
              type="natural"
              fill="url(#fillReported)"
              stroke="var(--color-reported)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
