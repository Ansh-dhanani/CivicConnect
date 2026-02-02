"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { Complaint } from "./schema";

interface SectionCardsProps {
  data?: Complaint[];
}

export function SectionCards({ data = [] }: SectionCardsProps) {
  // Calculate statistics
  const totalComplaints = data.length;
  const pendingComplaints = data.filter(c => c.status === "Pending").length;
  const resolvedComplaints = data.filter(c => c.status === "Resolved" || c.status === "Closed").length;
  const criticalComplaints = data.filter(c => c.priority === "Critical").length;

  // Calculate resolution rate
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

  // Calculate average resolution time for resolved complaints
  const resolvedComplaintsWithTime = data.filter(c =>
    (c.status === "Resolved" || c.status === "Closed") &&
    c.created_at &&
    c.resolved_at
  );

  const avgResolutionTime = resolvedComplaintsWithTime.length > 0
    ? Math.round(
        resolvedComplaintsWithTime.reduce((acc, c) => {
          const created = new Date(c.created_at!);
          const resolved = new Date(c.resolved_at!);
          return acc + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / resolvedComplaintsWithTime.length
      )
    : 0;

  const cards = [
    {
      title: "Total Complaints",
      value: totalComplaints,
      description: "All reported complaints",
      icon: AlertTriangle,
      color: "text-blue-600",
    },
    {
      title: "Pending",
      value: pendingComplaints,
      description: "Awaiting resolution",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Resolved",
      value: resolvedComplaints,
      description: "Successfully resolved",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Resolution Rate",
      value: `${resolutionRate}%`,
      description: "Complaints resolved",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Critical Issues",
      value: criticalComplaints,
      description: "High priority complaints",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Avg. Resolution Time",
      value: `${avgResolutionTime} days`,
      description: "Time to resolve complaints",
      icon: Clock,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}