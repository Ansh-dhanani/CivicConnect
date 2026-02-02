import * as React from "react";
import Image from "next/image";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { EllipsisVertical, Image as ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { DataTableColumnHeader } from "../../../../../components/data-table/data-table-column-header";
import { getSeverityIcon, getSeverityClasses } from "@/lib/severity-utils";

import { ImageViewerModal } from "./image-viewer-modal";
import { PotholeLocationViewer } from "./pothole-location-viewer";
import type { Pothole } from "./schema";
import { REPAIR_TEAMS } from "./schema";

// ============================================================================
// Utility Functions
// ============================================================================

function getWardDisplayName(ward: any): string {
  if (!ward) return "Unknown";
  return typeof ward === "string" ? ward : ward.ward_name;
}

function getPrimaryImageUrl(pothole: Pothole): string | null {
  if (pothole.images && pothole.images.length > 0) {
    return pothole.images[0].image_url;
  }
  return pothole.imageUrl || null;
}

function getReportedDate(pothole: Pothole): string {
  return pothole.created_at || pothole.reportedDate || "";
}

function getReporterName(pothole: Pothole): string {
  return pothole.createdBy?.full_name || pothole.reportedBy || "Unknown";
}

// ============================================================================
// Column Cell Components
// ============================================================================

interface ImageCellProps {
  row: Row<Pothole>;
}

/**
 * Displays pothole image thumbnail with click-to-expand functionality
 */
function ImageCell({ row }: ImageCellProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const imageUrl = getPrimaryImageUrl(row.original);

  const handleOpenModal = React.useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const renderImageThumbnail = () => {
    if (!imageUrl) {
      return (
        <div className="flex size-12 items-center justify-center rounded-md bg-muted">
          <ImageIcon className="size-6 text-muted-foreground" />
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={handleOpenModal}
        className="group relative cursor-pointer"
        aria-label={`View image for ${row.original.location_address || row.original.location}`}
      >
        <Image
          src={imageUrl}
          alt={`Pothole at ${row.original.location_address || row.original.location}`}
          width={48}
          height={48}
          className="size-12 rounded-md border object-cover transition-opacity group-hover:opacity-75"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-12 items-center justify-center rounded-md bg-black/60">
            <ImageIcon className="size-5 text-white" />
          </div>
        </div>
      </button>
    );
  };

  return (
    <>
      <div className="flex items-center justify-center">
        {renderImageThumbnail()}
      </div>

      {imageUrl && (
        <ImageViewerModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          imageUrl={imageUrl}
          location={row.original.location_address || row.original.location || ""}
          ward={getWardDisplayName(row.original.ward)}
          severity={row.original.severity || "Low"}
          status={row.original.status || "Unknown"}
          reportedDate={getReportedDate(row.original)}
          reportedBy={getReporterName(row.original)}
        />
      )}
    </>
  );
}

interface SeverityCellProps {
  row: Row<Pothole>;
}

/**
 * Displays severity badge with appropriate styling
 */
function SeverityCell({ row }: SeverityCellProps) {
  const severity = row.original.severity || "Low";
  
  return (
    <div className="w-28">
      <Badge className={`gap-1 border ${getSeverityClasses(severity)}`}>
        {getSeverityIcon(severity, "size-4")}
        {severity}
      </Badge>
    </div>
  );
}

interface StatusCellProps {
  row: Row<Pothole>;
  onStatusChange?: (potholeId: number, newStatus: string) => void;
}

/**
 * Interactive status selector with dropdown
 */
function StatusCell({ row, onStatusChange }: StatusCellProps) {
  const handleStatusChange = React.useCallback((value: string) => {
    if (onStatusChange) {
      onStatusChange(row.original.id, value);
    } else {
      console.log(`Status updated to ${value} for pothole ${row.original.id}`);
    }
  }, [row.original.id, onStatusChange]);

  return (
    <div className="w-32">
      <Select
        value={row.original.status}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="h-8 w-full border-transparent bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:focus-visible:bg-input/30 dark:hover:bg-input/30">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Under_Review">Under Review</SelectItem>
          <SelectItem value="Verified">Verified</SelectItem>
          <SelectItem value="Assigned">Assigned</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Rejected">Rejected</SelectItem>
          <SelectItem value="Duplicate">Duplicate</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

interface DuplicateCellProps {
  row: Row<Pothole>;
}

/**
 * Shows duplicate status and original pothole reference
 */
function DuplicateCell({ row }: DuplicateCellProps) {
  if (!row.original.isDuplicate) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  return (
    <Badge variant="outline" className="text-xs">
      Duplicate
      {row.original.originalId && ` (#${row.original.originalId})`}
    </Badge>
  );
}

interface AssignedCrewCellProps {
  row: Row<Pothole>;
  onCrewChange?: (potholeId: number, newCrew: string) => void;
}

/**
 * Interactive crew assignment selector
 */
function AssignedCrewCell({ row, onCrewChange }: AssignedCrewCellProps) {
  const handleCrewChange = React.useCallback((value: string) => {
    if (onCrewChange) {
      onCrewChange(row.original.id, value);
    } else {
      console.log(`Assigned to ${value} for pothole ${row.original.id}`);
    }
  }, [row.original.id, onCrewChange]);

  return (
    <div className="w-32">
      <Select
        value={row.original.assignedCrew}
        onValueChange={handleCrewChange}
      >
        <SelectTrigger className="h-8 w-full border-transparent bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:focus-visible:bg-input/30 dark:hover:bg-input/30">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="Unassigned">Unassigned</SelectItem>
          {REPAIR_TEAMS.map((team) => (
            <SelectItem key={team} value={team}>
              {team}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ActionsCellProps {
  row: Row<Pothole>;
}

/**
 * Dropdown menu with row-specific actions
 */
function ActionsCell({ row }: ActionsCellProps) {
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const imageUrl = getPrimaryImageUrl(row.original);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => setIsImageModalOpen(true)}
            disabled={!imageUrl}
          >
            View Image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {imageUrl && (
        <ImageViewerModal
          open={isImageModalOpen}
          onOpenChange={setIsImageModalOpen}
          imageUrl={imageUrl}
          location={row.original.location_address || row.original.location || ""}
          ward={getWardDisplayName(row.original.ward)}
          severity={row.original.severity || "Low"}
          status={row.original.status || "Unknown"}
          reportedDate={getReportedDate(row.original)}
          reportedBy={getReporterName(row.original)}
        />
      )}
    </>
  );
}

// ============================================================================
// Column Definitions
// ============================================================================

interface ColumnOptions {
  onStatusChange?: (potholeId: number, newStatus: string) => void;
  onCrewChange?: (potholeId: number, newCrew: string) => void;
}

/**
 * Generates table column definitions for pothole data
 */
export function getPotholeColumns(
  allPotholes: Pothole[] = [],
  options: ColumnOptions = {}
): ColumnDef<Pothole>[] {
  return [
    // Selection column
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // Image column
    {
      accessorKey: "images",
      header: "Photo",
      cell: ImageCell,
      enableSorting: false,
    },

    // Location column
    {
      accessorKey: "location_address",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
      cell: ({ row }) => (
        <PotholeLocationViewer
          item={row.original}
          coordinates={row.original.coordinates}
          allPotholes={allPotholes}
          onStatusChange={options.onStatusChange}
        />
      ),
      enableSorting: true,
    },

    // Severity column
    {
      accessorKey: "severity",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Severity" />,
      cell: SeverityCell,
      enableSorting: true,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },

    // Status column
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusCell row={row} onStatusChange={options.onStatusChange} />,
      enableSorting: true,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },

    // Duplicate indicator column
    {
      id: "duplicate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Duplicate" />,
      cell: DuplicateCell,
      enableSorting: true,
      enableHiding: true,
      sortingFn: (rowA, rowB) => {
        if (rowA.original.isDuplicate && !rowB.original.isDuplicate) return -1;
        if (!rowA.original.isDuplicate && rowB.original.isDuplicate) return 1;
        return 0;
      },
    },

    // Reported date column
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reported Date" />,
      cell: ({ row }) => {
        const dateValue = getReportedDate(row.original);
        const date = dateValue ? new Date(dateValue) : new Date();
        return (
          <div className="w-24 text-sm">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        );
      },
      enableSorting: true,
    },

    // Assigned crew column
    {
      accessorKey: "assignedCrew",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned Crew" />,
      cell: ({ row }) => <AssignedCrewCell row={row} onCrewChange={options.onCrewChange} />,
      enableSorting: true,
    },

    // Source/Reporter column
    {
      accessorKey: "createdBy",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {getReporterName(row.original)}
        </div>
      ),
      enableSorting: false,
    },

    // Actions column
    {
      id: "actions",
      cell: ActionsCell,
      enableSorting: false,
    },
  ];
}