"use client";

import * as React from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import type { Complaint } from "./schema";

interface ChartAreaInteractiveProps {
  data?: Complaint[];
}

const COLORS = {
  Infrastructure: "#8884d8",
  Sanitation: "#82ca9d",
  Traffic: "#ffc658",
  "Public Safety": "#ff7c7c",
  Utilities: "#8dd1e1",
  Environment: "#d084d0",
  Other: "#87ceeb",
};

const STATUS_COLORS = {
  Pending: "#fbbf24",
  "Under Review": "#f59e0b",
  Investigating: "#d97706",
  Resolved: "#10b981",
  Closed: "#059669",
  Rejected: "#ef4444",
};

export function ChartAreaInteractive({ data = [] }: ChartAreaInteractiveProps) {
  // Category distribution
  const categoryData = React.useMemo(() => {
    const categories = data.reduce((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
      fill: COLORS[category as keyof typeof COLORS] || "#8884d8",
    }));
  }, [data]);

  // Status distribution
  const statusData = React.useMemo(() => {
    const statuses = data.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statuses).map(([status, count]) => ({
      status,
      count,
      fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#8884d8",
    }));
  }, [data]);

  // Priority distribution
  const priorityData = React.useMemo(() => {
    const priorities = data.reduce((acc, complaint) => {
      acc[complaint.priority] = (acc[complaint.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorities)
      .sort(([, a], [, b]) => b - a)
      .map(([priority, count]) => ({
        priority,
        count,
      }));
  }, [data]);

  // Complaints over time (last 30 days)
  const timeData = React.useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const complaintsByDate = data.reduce((acc, complaint) => {
      if (complaint.created_at) {
        const date = new Date(complaint.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return last30Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      complaints: complaintsByDate[date] || 0,
    }));
  }, [data]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Category Distribution */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Complaints by Category</CardTitle>
          <CardDescription>Distribution of complaints across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Count",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Complaints by Status</CardTitle>
          <CardDescription>Current status of all complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Count",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="status" />
                <YAxis />
                <Bar dataKey="count" fill="#8884d8" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Complaints by Priority</CardTitle>
          <CardDescription>Priority levels of reported complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Count",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="priority" type="category" width={80} />
                <Bar dataKey="count" fill="#82ca9d" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Complaints Over Time */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Complaints Trend (30 Days)</CardTitle>
          <CardDescription>Daily complaint reports over the last month</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              complaints: {
                label: "Complaints",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Line type="monotone" dataKey="complaints" stroke="#8884d8" strokeWidth={2} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}