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
import { getPotholeColumns } from "./columns";
import { MapDialog } from "./pothole-location-viewer";
import type { potholeSchema } from "./schema";
import { REPAIR_TEAMS } from "./schema";
import { getSeverityIcon, getSeverityClasses } from "@/lib/severity-utils";

// Type definitions
type TabValue = "all-reports" | "critical" | "pending" | "completed";
type Pothole = z.infer<typeof potholeSchema>;

interface FilterState {
  severity: string;
  status: string;
  overdue: string;
  team: string;
  duplicate: string;
}

const INITIAL_FILTER_STATE: FilterState = {
  severity: "all",
  status: "all",
  overdue: "all",
  team: "all",
  duplicate: "all",
};

const DEFAULT_MAP_CENTER: [number, number] = [19.076, 72.8777];
const DEFAULT_MAP_ZOOM = 12;

// Utility functions
function applyFilters(data: z.infer<typeof potholeSchema>[], filters: FilterState): z.infer<typeof potholeSchema>[] {
  return data.filter((item) => {
    const matchesSeverity = filters.severity === "all" || item.severity === filters.severity;
    const matchesStatus = filters.status === "all" || item.status === filters.status;
    const matchesTeam = filters.team === "all" || item.assignedTeam?.team_name === filters.team;
    const matchesDuplicate = filters.duplicate === "all" ||
      (filters.duplicate === "originals" && !item.isDuplicate) ||
      (filters.duplicate === "duplicates" && item.isDuplicate);

    // Overdue filter logic
    let matchesOverdue = true;
    if (filters.overdue !== "all") {
      const targetDate = item.targetRepairDate ? new Date(item.targetRepairDate) : null;
      const now = new Date();
      if (filters.overdue === "overdue" && targetDate) {
        matchesOverdue = targetDate < now;
      } else if (filters.overdue === "upcoming" && targetDate) {
        matchesOverdue = targetDate >= now;
      }
    }

    return matchesSeverity && matchesStatus && matchesTeam && matchesOverdue && matchesDuplicate;
  });
}

function groupPotholesByLocation(potholes: z.infer<typeof potholeSchema>[]): Array<{
  id: string;
  latitude: number;
  longitude: number;
  potholes: z.infer<typeof potholeSchema>[];
  count: number;
}> {
  const groups: { [key: string]: z.infer<typeof potholeSchema>[] } = {};
  const radius = 0.001; // Approximately 100 meters

  potholes.forEach(pothole => {
    if (!pothole.coordinates || pothole.coordinates.length !== 2) return;

    const [lat, lng] = pothole.coordinates;

    // Find if this pothole is close to any existing group
    let foundGroup = false;
    for (const groupKey in groups) {
      const [groupLat, groupLng] = groupKey.split(',').map(Number);
      const distance = Math.sqrt(
        Math.pow(lat - groupLat, 2) + Math.pow(lng - groupLng, 2)
      );

      if (distance < radius) {
        groups[groupKey].push(pothole);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups[`${lat},${lng}`] = [pothole];
    }
  });

  return Object.entries(groups).map(([key, potholes]) => ({
    id: key,
    latitude: parseFloat(key.split(',')[0]),
    longitude: parseFloat(key.split(',')[1]),
    potholes,
    count: potholes.length
  }));
}

/**
 * Filter controls component - Simplified and cleaner design
 */
function FilterControls({
  filters,
  onFiltersChange,
  data,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  data: Pothole[];
}) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== "all").length;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Select value={filters.severity} onValueChange={(value) => updateFilter("severity", value)}>
          <SelectTrigger className="w-28 h-8" size="sm">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-32 h-8" size="sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Under Review">Under Review</SelectItem>
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="Assigned">Assigned</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Duplicate">Duplicate</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.team} onValueChange={(value) => updateFilter("team", value)}>
          <SelectTrigger className="w-28 h-8" size="sm">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {REPAIR_TEAMS.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {Object.values(filters).some(value => value !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange(INITIAL_FILTER_STATE)}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Bulk action controls for selected rows - Simplified design
 */
function BulkActions({
  selectedCount,
  onStatusChange,
  onCrewChange,
  onClearSelection,
}: {
  selectedCount: number;
  onStatusChange: (status: string) => void;
  onCrewChange: (crew: string) => void;
  onClearSelection: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-3">
        <Badge variant="default" className="px-2 py-1">
          {selectedCount} selected
        </Badge>
        <div className="flex items-center gap-2">
          <Select onValueChange={onStatusChange}>
            <SelectTrigger className="w-36 h-8" size="sm">
              <SelectValue placeholder="Set status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={onCrewChange}>
            <SelectTrigger className="w-32 h-8" size="sm">
              <SelectValue placeholder="Assign team" />
            </SelectTrigger>
            <SelectContent>
              {REPAIR_TEAMS.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8">
        Clear
      </Button>
    </div>
  );
}

/**
 * Dialog showing grouped potholes at a location
 */
function GroupedPotholesDialog({
  potholes,
  onClose,
  onStatusChange,
}: {
  potholes: Pothole[] | null;
  onClose: () => void;
  onStatusChange?: (potholeId: number, status: string) => void;
}) {
  if (!potholes || potholes.length === 0) return null;

  return (
    <Dialog open={!!potholes} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            {potholes.length} Pothole{potholes.length > 1 ? "s" : ""} at this Location
          </DialogTitle>
          <DialogDescription>
            {potholes[0].location || potholes[0].location_address || "Unknown Location"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {potholes.map((pothole) => (
            <div key={pothole.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Pothole #{pothole.id}</h4>
                <div className="flex items-center gap-2">
                  <Badge className={`gap-1 border text-xs ${getSeverityClasses(pothole.severity || "Low")}`}>
                    {getSeverityIcon(pothole.severity || "Low")}
                    {pothole.severity || "Low"}
                  </Badge>
                  {pothole.isDuplicate && (
                    <Badge variant="secondary" className="text-xs">
                      Duplicate
                    </Badge>
                  )}
                </div>
              </div>

              {pothole.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                  <Image
                    src={pothole.imageUrl}
                    alt={`Pothole ${pothole.id}`}
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
                      value={pothole.status}
                      onValueChange={(value) => onStatusChange(pothole.id, value)}
                    >
                      <SelectTrigger className="w-32 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Verified">Verified</SelectItem>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Duplicate">Duplicate</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{pothole.status}</span>
                  )}
                </div>
                <p>
                  <strong>Reported:</strong>{" "}
                  {new Date(pothole.created_at || pothole.reportedDate || Date.now()).toLocaleDateString()}
                </p>
                {pothole.targetRepairDate && (
                  <p>
                    <strong>Target Repair:</strong> {new Date(pothole.targetRepairDate).toLocaleDateString()}
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

export function DataTable({ data: initialData }: { data: z.infer<typeof potholeSchema>[] }) {
  // State
  const [data, setData] = React.useState<Pothole[]>(initialData || []);
  const [activeTab, setActiveTab] = React.useState<TabValue>("all-reports");
  const [filters, setFilters] = React.useState<FilterState>(INITIAL_FILTER_STATE);
  const [selectedPotholeGroup, setSelectedPotholeGroup] = React.useState<Pothole[] | null>(null);
  const [isMapDialogOpen, setIsMapDialogOpen] = React.useState(false);

  // Update data when initialData changes
  React.useEffect(() => {
    setData(initialData || []);
  }, [initialData]);

  // Filter data by tab
  const criticalData = React.useMemo(
    () => data.filter((item) => item.severity === "Critical" || item.severity === "High"),
    [data]
  );
  const pendingData = React.useMemo(() => data.filter((item) => item.status === "Pending"), [data]);
  const completedData = React.useMemo(() => data.filter((item) => item.status === "Completed"), [data]);

  // Apply filters to all reports tab
  const filteredData = React.useMemo(() => applyFilters(data, filters), [data, filters]);

  // Group potholes for map display
  const groupedPotholes = React.useMemo(() => groupPotholesByLocation(data), [data]);

  // Create columns
  const columnsWithDnd = React.useMemo(() => withDndColumn(getPotholeColumns(data, {
    onStatusChange: (potholeId, status) => {
      setData(prevData =>
        prevData.map(item =>
          item.id === potholeId ? { ...item, status: status as any } : item
        )
      );
    }
  })), [data]);
  const columnsWithoutDnd = React.useMemo(() => getPotholeColumns(data, {
    onStatusChange: (potholeId, status) => {
      setData(prevData =>
        prevData.map(item =>
          item.id === potholeId ? { ...item, status: status as any } : item
        )
      );
    }
  }), [data]);

  // Create table instances
  const allTable = useDataTableInstance({
    data: activeTab === "all-reports" ? filteredData : data,
    columns: columnsWithDnd,
    getRowId: (row) => row.id.toString(),
  });

  const criticalTable = useDataTableInstance({
    data: criticalData,
    columns: columnsWithoutDnd,
    getRowId: (row) => row.id.toString(),
  });

  const pendingTable = useDataTableInstance({
    data: pendingData,
    columns: columnsWithoutDnd,
    getRowId: (row) => row.id.toString(),
  });

  const completedTable = useDataTableInstance({
    data: completedData,
    columns: columnsWithoutDnd,
    getRowId: (row) => row.id.toString(),
  });

  // Handlers
  const handleFilterChange = React.useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = React.useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
  }, []);

  const handleBulkStatusChange = React.useCallback(
    (status: string) => {
      const selectedIds = allTable.getSelectedRowModel().rows.map((row) => row.original.id);
      setData((prevData) =>
        prevData.map((item) =>
          selectedIds.includes(item.id) ? { ...item, status: status as any } : item
        )
      );
      allTable.resetRowSelection();
    },
    [allTable]
  );

  const handleBulkCrewChange = React.useCallback(
    (crew: string) => {
      const selectedIds = allTable.getSelectedRowModel().rows.map((row) => row.original.id);
      setData((prevData) =>
        prevData.map((item) => (selectedIds.includes(item.id) ? { ...item, assignedCrew: crew } : item))
      );
      allTable.resetRowSelection();
    },
    [allTable]
  );

  const handleMarkerClick = React.useCallback(
    (markerId: string | number) => {
      const group = groupedPotholes.find((g) => g.id === markerId.toString());
      if (group) {
        setSelectedPotholeGroup(group.potholes);
      }
    },
    [groupedPotholes]
  );

  const handleCloseGroupDialog = React.useCallback(() => {
    setSelectedPotholeGroup(null);
  }, []);

  return (
    <>
      {/* Header Section - Clean and organized */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Pothole Reports</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track pothole repair requests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DataTableViewOptions table={allTable} />
          <Button size="sm" onClick={() => setIsMapDialogOpen(true)}>
            <MapPin className="size-4 mr-2" />
            Map View
          </Button>
        </div>
      </div>

      {/* Tabs and Controls */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="all-reports" className="text-sm">
              All Reports
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-sm">
              Pending
              {pendingData.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {pendingData.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">
              Completed
              {completedData.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {completedData.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filters - Only show for all-reports tab */}
        {activeTab === "all-reports" && (
          <div className="mb-4">
            <FilterControls
              filters={filters}
              onFiltersChange={setFilters}
              data={data}
            />
          </div>
        )}

        {/* Bulk Actions - Only show for all-reports tab */}
        {activeTab === "all-reports" && (
          <div className="mb-4">
            <BulkActions
              selectedCount={allTable.getSelectedRowModel().rows.length}
              onStatusChange={handleBulkStatusChange}
              onCrewChange={handleBulkCrewChange}
              onClearSelection={() => allTable.resetRowSelection()}
            />
          </div>
        )}

        {/* Tab Content */}
        <TabsContent value="all-reports" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <DataTableNew dndEnabled table={allTable} columns={columnsWithDnd} onReorder={setData} />
          </div>
          <DataTablePagination table={allTable} />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <DataTableNew dndEnabled={false} table={pendingTable} columns={columnsWithoutDnd} />
          </div>
          <DataTablePagination table={pendingTable} />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <DataTableNew dndEnabled={false} table={completedTable} columns={columnsWithoutDnd} />
          </div>
          <DataTablePagination table={completedTable} />
        </TabsContent>
      </Tabs>

      <MapDialog
        title="All Potholes"
        description="Click on markers to view potholes at that location."
        isOpen={isMapDialogOpen}
        onOpenChange={setIsMapDialogOpen}
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        size="fullscreen"
        markers={groupedPotholes.map((group) => ({
          pothole: {
            ...group.potholes[0],
            coordinates: [group.latitude, group.longitude],
            location: `${group.count} pothole${group.count > 1 ? "s" : ""} at this location`,
          },
          isCurrent: false,
          isSelectable: true,
          count: group.count,
          groupId: group.id,
        }))}
        onMarkerClick={handleMarkerClick}
        selectedMarkerId={selectedPotholeGroup ? selectedPotholeGroup[0].id.toString() : null}
      />

      <GroupedPotholesDialog
        potholes={selectedPotholeGroup}
        onClose={handleCloseGroupDialog}
        onStatusChange={(potholeId, status) => {
          setData(prevData =>
            prevData.map(item =>
              item.id === potholeId ? { ...item, status: status as any } : item
            )
          );
        }}
      />
    </>
  );
}