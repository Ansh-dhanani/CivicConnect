import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTableColumnHeader } from "../../../../../components/data-table/data-table-column-header";
import { ComplaintLocationViewer } from "./complaint-location-viewer";
import type { Complaint } from "./schema";
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from "./schema";

import { getComplaintPriorityColor, getComplaintStatusColor, getPrimaryImageUrl, getReportedDate, getReporterName, getDaysSinceReported } from "./schema";

interface ColumnOptions {
  onStatusChange?: (complaintId: number, status: string) => void;
}

/**
 * Generates table column definitions for complaint data
 */
export function getComplaintColumns(
  allComplaints: Complaint[] = [],
  options: ColumnOptions = {}
): ColumnDef<Complaint>[] {
  return [
    // Selection column
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // ID column
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
      enableSorting: true,
      enableHiding: false,
    },

    // Title column
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const description = row.original.description;
        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{title}</div>
            <div className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
              {description}
            </div>
          </div>
        );
      },
      enableSorting: true,
    },

    // Category column
    {
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return (
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        );
      },
      enableSorting: true,
    },

    // Priority column
    {
      accessorKey: "priority",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return (
          <Badge className={`text-xs ${getComplaintPriorityColor(priority)}`}>
            {priority}
          </Badge>
        );
      },
      enableSorting: true,
    },

    // Status column
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return options.onStatusChange ? (
          <Select
            value={status}
            onValueChange={(value) => options.onStatusChange?.(row.original.id, value)}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPLAINT_STATUSES.map((statusOption) => (
                <SelectItem key={statusOption} value={statusOption}>
                  {statusOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
      },
      enableSorting: true,
    },

    // Reported Date column
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reported" />,
      cell: ({ row }) => {
        const date = getReportedDate(row.original);
        const daysSince = getDaysSinceReported(row.original);
        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm">{new Date(date).toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">
              {daysSince} day{daysSince !== 1 ? 's' : ''} ago
            </div>
          </div>
        );
      },
      enableSorting: true,
    },

    // Reporter column
    {
      accessorKey: "reportedBy",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reporter" />,
      cell: ({ row }) => {
        const reporter = getReporterName(row.original);
        return <div className="text-sm">{reporter}</div>;
      },
      enableSorting: true,
    },

    // Location column
    {
      accessorKey: "location_address",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
      cell: ({ row }) => (
        <ComplaintLocationViewer
          item={row.original}
          coordinates={row.original.coordinates}
          allComplaints={allComplaints}
          onStatusChange={options.onStatusChange}
        />
      ),
      enableSorting: true,
    },
  ];
}