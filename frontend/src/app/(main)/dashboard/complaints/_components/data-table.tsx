"use client";
"use no memo";

import * as React from "react";

import { Plus, MapPin } from "lucide-react";
import Image from "next/image";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { withDndColumn } from "../../../../../components/data-table/table-utils";
import { getComplaintColumns } from "./columns";
import { MapDialog } from "./complaint-location-viewer";
import type { complaintSchema } from "./schema";
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from "./schema";

import { getComplaintPriorityColor, getComplaintStatusColor, getComplaintCategoryIcon, getPrimaryImageUrl, getReportedDate, getReporterName, getDaysSinceReported } from "./schema";

// Type definitions
type TabValue = "all-complaints" | "pending" | "resolved";
type Complaint = z.infer<typeof complaintSchema>;

interface FilterState {
  category: string;
  priority: string;
  status: string;
  overdue: string;
}

const INITIAL_FILTER_STATE: FilterState = {
  category: "all",
  priority: "all",
  status: "all",
  overdue: "all",
};

const DEFAULT_MAP_CENTER: [number, number] = [19.076, 72.8777];
const DEFAULT_MAP_ZOOM = 12;

// Utility functions
function applyFilters(data: z.infer<typeof complaintSchema>[], filters: FilterState): z.infer<typeof complaintSchema>[] {
  return data.filter((item) => {
    const matchesCategory = filters.category === "all" || item.category === filters.category;
    const matchesPriority = filters.priority === "all" || item.priority === filters.priority;
    const matchesStatus = filters.status === "all" || item.status === filters.status;

    // Overdue filter logic
    let matchesOverdue = true;
    if (filters.overdue !== "all") {
      const estimatedTime = item.estimated_resolution_time ? new Date(item.estimated_resolution_time) : null;
      const now = new Date();
      if (filters.overdue === "overdue" && estimatedTime) {
        matchesOverdue = estimatedTime < now && item.status !== "Resolved" && item.status !== "Closed";
      } else if (filters.overdue === "upcoming" && estimatedTime) {
        matchesOverdue = estimatedTime >= now;
      }
    }

    return matchesCategory && matchesPriority && matchesStatus && matchesOverdue;
  });
}

function groupComplaintsByLocation(complaints: z.infer<typeof complaintSchema>[]): Array<{
  id: string;
  latitude: number;
  longitude: number;
  complaints: z.infer<typeof complaintSchema>[];
  count: number;
}> {
  const groups: { [key: string]: z.infer<typeof complaintSchema>[] } = {};
  const radius = 0.001; // Approximately 100 meters

  complaints.forEach(complaint => {
    if (!complaint.coordinates || complaint.coordinates.length !== 2) return;

    const [lat, lng] = complaint.coordinates;

    // Find if this complaint is close to any existing group
    let foundGroup = false;
    for (const groupKey in groups) {
      const [groupLat, groupLng] = groupKey.split(',').map(Number);
      const distance = Math.sqrt(
        Math.pow(lat - groupLat, 2) + Math.pow(lng - groupLng, 2)
      );

      if (distance < radius) {
        groups[groupKey].push(complaint);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups[`${lat},${lng}`] = [complaint];
    }
  });

  return Object.entries(groups).map(([key, complaints]) => ({
    id: key,
    latitude: parseFloat(key.split(',')[0]),
    longitude: parseFloat(key.split(',')[1]),
    complaints,
    count: complaints.length
  }));
}

/**
 * Filter controls component
 */
function FilterControls({
  filters,
  onFiltersChange,
  data,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  data: Complaint[];
}) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="category-filter" className="text-sm font-medium">
          Category:
        </Label>
        <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
          <SelectTrigger className="w-36" size="sm" id="category-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {COMPLAINT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="priority-filter" className="text-sm font-medium">
          Priority:
        </Label>
        <Select value={filters.priority} onValueChange={(value) => updateFilter("priority", value)}>
          <SelectTrigger className="w-32" size="sm" id="priority-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {COMPLAINT_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="status-filter" className="text-sm font-medium">
          Status:
        </Label>
        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-32" size="sm" id="status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {COMPLAINT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="overdue-filter" className="text-sm font-medium">
          Due Date:
        </Label>
        <Select value={filters.overdue} onValueChange={(value) => updateFilter("overdue", value)}>
          <SelectTrigger className="w-32" size="sm" id="overdue-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/**
 * Bulk action controls for selected rows
 */
function BulkActions({
  selectedCount,
  onStatusChange,
  onClearSelection,
}: {
  selectedCount: number;
  onStatusChange: (status: string) => void;
  onClearSelection: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{selectedCount} selected</span>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="bulk-status" className="text-sm font-medium">
          Set Status:
        </Label>
        <Select onValueChange={onStatusChange}>
          <SelectTrigger className="w-36" size="sm" id="bulk-status">
            <SelectValue placeholder="Choose status" />
          </SelectTrigger>
          <SelectContent>
            {COMPLAINT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" size="sm" onClick={onClearSelection}>
        Clear Selection
      </Button>
    </div>
  );
}

/**
 * Dialog showing grouped complaints at a location
 */
function GroupedComplaintsDialog({
  complaints,
  onClose,
  onStatusChange,
}: {
  complaints: Complaint[] | null;
  onClose: () => void;
  onStatusChange?: (complaintId: number, status: string) => void;
}) {
  if (!complaints || complaints.length === 0) return null;

  return (
    <Dialog open={!!complaints} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            {complaints.length} Complaint{complaints.length > 1 ? "s" : ""} at this Location
          </DialogTitle>
          <DialogDescription>
            {complaints[0].location || complaints[0].location_address || "Unknown Location"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Complaint #{complaint.id}</h4>
                <div className="flex items-center gap-2">
                  <Badge className={`gap-1 border text-xs ${getComplaintPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-sm">{complaint.title}</h5>
                <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
              </div>

              {complaint.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                  <Image
                    src={complaint.imageUrl}
                    alt={`Complaint ${complaint.id}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <strong>Status:</strong>
                  {onStatusChange ? (
                    <Select
                      value={complaint.status}
                      onValueChange={(value) => onStatusChange(complaint.id, value)}
                    >
                      <SelectTrigger className="w-32 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPLAINT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {complaint.status}
                    </Badge>
                  )}
                </div>
                <p>
                  <strong>Reported:</strong>{" "}
                  {new Date(complaint.created_at || Date.now()).toLocaleDateString()}
                </p>
                {complaint.estimated_resolution_time && (
                  <p>
                    <strong>Target Resolution:</strong> {new Date(complaint.estimated_resolution_time).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function DataTable({ data: initialData }: { data: z.infer<typeof complaintSchema>[] }) {
  // State
  const [data, setData] = React.useState<Complaint[]>(initialData || []);
  const [activeTab, setActiveTab] = React.useState<TabValue>("all-complaints");
  const [filters, setFilters] = React.useState<FilterState>(INITIAL_FILTER_STATE);
  const [selectedComplaintGroup, setSelectedComplaintGroup] = React.useState<Complaint[] | null>(null);
  const [isMapDialogOpen, setIsMapDialogOpen] = React.useState(false);

  // Update data when initialData changes
  React.useEffect(() => {
    setData(initialData || []);
  }, [initialData]);

  // Filter data by tab
  const pendingData = React.useMemo(() => data.filter((item) => item.status === "Pending"), [data]);
  const resolvedData = React.useMemo(() => data.filter((item) => item.status === "Resolved" || item.status === "Closed"), [data]);

  // Apply filters to all complaints tab
  const filteredData = React.useMemo(() => applyFilters(data, filters), [data, filters]);

  // Group complaints for map display
  const groupedComplaints = React.useMemo(() => groupComplaintsByLocation(data), [data]);

  // Create columns
  const columnsWithDnd = React.useMemo(() => withDndColumn(getComplaintColumns(data, {
    onStatusChange: (complaintId, status) => {
      setData(prevData =>
        prevData.map(item =>
          item.id === complaintId ? { ...item, status: status as any } : item
        )
      );
    }
  })), [data]);
  const columnsWithoutDnd = React.useMemo(() => getComplaintColumns(data, {
    onStatusChange: (complaintId, status) => {
      setData(prevData =>
        prevData.map(item =>
          item.id === complaintId ? { ...item, status: status as any } : item
        )
      );
    }
  }), [data]);

  // Create table instances
  const allTable = useDataTableInstance({
    data: activeTab === "all-complaints" ? filteredData : data,
    columns: columnsWithDnd,
    getRowId: (row) => row.id.toString(),
  });

  const pendingTable = useDataTableInstance({
    data: pendingData,
    columns: columnsWithoutDnd,
    getRowId: (row) => row.id.toString(),
  });

  const resolvedTable = useDataTableInstance({
    data: resolvedData,
    columns: columnsWithoutDnd,
    getRowId: (row) => row.id.toString(),
  });

  // Handlers
  const handleMarkerClick = React.useCallback(
    (markerId: string | number) => {
      const group = groupedComplaints.find((g) => g.id === markerId.toString());
      if (group) {
        setSelectedComplaintGroup(group.complaints);
      }
    },
    [groupedComplaints]
  );

  const handleCloseGroupDialog = React.useCallback(() => {
    setSelectedComplaintGroup(null);
  }, []);

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <Select value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <SelectTrigger className="flex @4xl/main:hidden w-fit" size="sm" id="view-selector">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-complaints">All Complaints</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <TabsList className="hidden @4xl/main:flex">
            <TabsTrigger value="all-complaints">All Complaints</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <DataTableViewOptions table={allTable} />
          </div>
        </div>

        {/* Filters */}
        {activeTab === "all-complaints" && (
          <FilterControls filters={filters} onFiltersChange={setFilters} data={data} />
        )}

        {/* Bulk Actions */}
        {activeTab === "all-complaints" && allTable.getSelectedRowModel().rows.length > 0 && (
          <BulkActions
            selectedCount={allTable.getSelectedRowModel().rows.length}
            onStatusChange={(status) => {
              const selectedIds = allTable.getSelectedRowModel().rows.map(row => row.original.id);
              setData(prevData =>
                prevData.map(item =>
                  selectedIds.includes(item.id) ? { ...item, status: status as any } : item
                )
              );
              allTable.resetRowSelection();
            }}
            onClearSelection={() => allTable.resetRowSelection()}
          />
        )}

        {/* View Map Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMapDialogOpen(true)}
          >
            <MapPin className="size-4 mr-2" />
            View Map
          </Button>
        </div>

        <TabsContent value="all-complaints" className="relative flex flex-col gap-4 overflow-auto">
          <div className="overflow-hidden rounded-lg border">
            <DataTableNew dndEnabled table={allTable} columns={columnsWithDnd} onReorder={setData} />
          </div>
          <DataTablePagination table={allTable} />
        </TabsContent>

        <TabsContent value="pending" className="relative flex flex-col gap-4 overflow-auto">
          <div className="overflow-hidden rounded-lg border">
            <DataTableNew dndEnabled={false} table={pendingTable} columns={columnsWithoutDnd} />
          </div>
          <DataTablePagination table={pendingTable} />
        </TabsContent>

        <TabsContent value="resolved" className="relative flex flex-col gap-4 overflow-auto">
          <div className="overflow-hidden rounded-lg border">
            <DataTableNew dndEnabled={false} table={resolvedTable} columns={columnsWithoutDnd} />
          </div>
          <DataTablePagination table={resolvedTable} />
        </TabsContent>
      </Tabs>

      {/* All Complaints Map Dialog */}
      <MapDialog
        title="All Complaints"
        description="Click on markers to view complaints at that location."
        isOpen={isMapDialogOpen}
        onOpenChange={setIsMapDialogOpen}
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        size="fullscreen"
        markers={groupedComplaints.map(group => ({
          complaint: {
            ...group.complaints[0],
            coordinates: [group.latitude, group.longitude],
            location: `${group.count} complaint${group.count > 1 ? 's' : ''} at this location`
          },
          isCurrent: false,
          isSelectable: true,
          count: group.count,
          groupId: group.id
        }))}
        onMarkerClick={handleMarkerClick}
        selectedMarkerId={selectedComplaintGroup ? selectedComplaintGroup[0].id.toString() : null}
      />

      {/* Group Complaint Details Dialog */}
      <GroupedComplaintsDialog
        complaints={selectedComplaintGroup}
        onClose={handleCloseGroupDialog}
        onStatusChange={(complaintId, status) => {
          setData(prevData =>
            prevData.map(item =>
              item.id === complaintId ? { ...item, status: status as any } : item
            )
          );
        }}
      />
    </>
  );
}