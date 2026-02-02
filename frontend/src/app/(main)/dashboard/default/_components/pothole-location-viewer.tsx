"use client";

import * as React from "react";
import Image from "next/image";
import { MapPin, Navigation, Maximize, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Map as MapComponent, MapMarker, MapPopup, MapTileLayer, MapZoomControl } from "@/components/ui/map";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { getSeverityIcon, getSeverityClasses } from "@/lib/severity-utils";

import type { Pothole } from "./schema";

// ============================================================================
// Utility Functions
// ============================================================================

function getWardDisplayName(ward: any): string {
  if (!ward) return "Unknown";
  return typeof ward === "string" ? ward : ward.ward_name;
}

function getReportedDate(pothole: Pothole): string {
  return pothole.created_at || pothole.reportedDate || "";
}

// ============================================================================
// Types
// ============================================================================

interface PotholeLocationViewerProps {
  item: Pothole;
  coordinates?: [number, number];
  allPotholes?: Pothole[];
  onStatusChange?: (potholeId: number, status: string) => void;
}

interface PotholeMapMarkerProps {
  pothole: Pothole;
  isCurrent?: boolean;
  isSelected?: boolean;
  isSelectable?: boolean;
  count?: number;
  onClick?: () => void;
}

interface MapDialogProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  center: [number, number];
  zoom?: number;
  size?: "compact" | "fullscreen" | "large";
  markers?: Array<{
    pothole: Pothole;
    isCurrent?: boolean;
    isSelectable?: boolean;
    count?: number;
    groupId?: string;
  }>;
  onMarkerClick?: (markerId: string | number) => void;
  selectedMarkerId?: string | number | null;
  showExternalLink?: boolean;
  children?: React.ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_COORDINATES: [number, number] = [19.076, 72.8777];
const COMPACT_MAP_ZOOM = 16;
const FULLSCREEN_MAP_ZOOM = 17;

const MAP_SIZE_CLASSES = {
  compact: "max-w-md h-96",
  fullscreen: "max-w-5xl h-[85vh]",
  large: "max-w-4xl h-[70vh]",
} as const;

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Map marker component for individual potholes
 */
function PotholeMapMarker({
  pothole,
  isCurrent,
  isSelected,
  isSelectable,
  count,
  onClick,
}: PotholeMapMarkerProps) {
  const getMarkerIcon = () => {
    if (isCurrent) return <MapPin className="size-6 text-blue-600" />;
    if (isSelected) return <MapPin className="size-6 text-green-600" />;
    return <MapPin className="size-6 text-gray-400" />;
  };

  const wardDisplay = pothole.ward
    ? typeof pothole.ward === "string"
      ? pothole.ward
      : pothole.ward.ward_name
    : "Unknown";

  return (
    <MapMarker
      position={pothole.coordinates || DEFAULT_COORDINATES}
      icon={getMarkerIcon()}
      iconAnchor={[12, 24]}
      popupAnchor={[0, -24]}
      eventHandlers={isSelectable ? { click: onClick } : undefined}
    >
      {(!count || count <= 1) && (
        <MapPopup>
          <div className="space-y-2 min-w-48">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">
                {pothole.location || pothole.location_address || "Unknown Location"}
              </p>
              {isCurrent && <Badge variant="secondary" className="text-xs">Current</Badge>}
              {isSelected && <Badge variant="default" className="text-xs">Selected</Badge>}
            </div>
            <p className="text-muted-foreground text-xs">{wardDisplay}</p>
            <Badge className={`gap-1 border text-xs ${getSeverityClasses(pothole.severity || "Low")}`}>
              {getSeverityIcon(pothole.severity || "Low")}
              {pothole.severity || "Low"}
            </Badge>
            <p className="text-xs text-muted-foreground">ID: #{pothole.id}</p>
          </div>
        </MapPopup>
      )}
    </MapMarker>
  );
}

/**
 * Compact map view for drawer display
 */
function CompactMap({ pothole }: { pothole: Pothole }) {
  return (
    <div className="h-48 w-full rounded-lg border overflow-hidden relative">
      <MapComponent
        center={pothole.coordinates || DEFAULT_COORDINATES}
        zoom={COMPACT_MAP_ZOOM}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <MapTileLayer />
        <PotholeMapMarker pothole={pothole} />
      </MapComponent>
    </div>
  );
}

/**
 * Fullscreen map dialog with customizable markers
 */
function MapDialog({
  title,
  description,
  isOpen,
  onOpenChange,
  center,
  zoom = COMPACT_MAP_ZOOM,
  size = "fullscreen",
  markers = [],
  onMarkerClick,
  selectedMarkerId,
  showExternalLink = true,
  children,
}: MapDialogProps) {
  const handleOpenInMaps = React.useCallback(() => {
    const [lat, lng] = center;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  }, [center]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${MAP_SIZE_CLASSES[size]} p-0 gap-0 overflow-hidden flex flex-col`}>
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                {title}
              </DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
            <div className="flex items-center gap-2">
              {showExternalLink && (
                <Button variant="outline" size="sm" onClick={handleOpenInMaps}>
                  <Navigation className="size-4 mr-2" />
                  Open in Maps
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <MapComponent center={center} zoom={zoom} className="h-full w-full">
            <MapTileLayer />
            <MapZoomControl />
            {markers.map(({ pothole, isCurrent, isSelectable, count, groupId }) => (
              <PotholeMapMarker
                key={pothole.id}
                pothole={pothole}
                isCurrent={isCurrent}
                isSelected={selectedMarkerId === (groupId || pothole.id)}
                isSelectable={isSelectable}
                count={count}
                onClick={isSelectable ? () => onMarkerClick?.(groupId || pothole.id) : undefined}
              />
            ))}
          </MapComponent>
        </div>

        {children && (
          <div className="flex-shrink-0 p-6 pt-4 border-t bg-background">{children}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Formats date for display
 */
function formatDisplayDate(dateString: string): string {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Location viewer with drawer and fullscreen map capabilities
 */
function PotholeLocationViewer({ item, coordinates, allPotholes = [], onStatusChange }: PotholeLocationViewerProps) {
  const isMobile = useIsMobile();
  const [isFullscreenMapOpen, setIsFullscreenMapOpen] = React.useState(false);

  const mapCoordinates = item.coordinates || coordinates || DEFAULT_COORDINATES;
  const wardDisplay = getWardDisplayName(item.ward);
  const reportedDate = getReportedDate(item);

  const handleOpenFullscreen = React.useCallback(() => {
    setIsFullscreenMapOpen(true);
  }, []);

  return (
    <>
      <Drawer direction={isMobile ? "bottom" : "right"}>
        <DrawerTrigger asChild>
          <Button variant="link" className="w-fit justify-start px-0 text-left text-foreground h-auto">
            <div className="flex flex-col gap-1">
              <span className="font-medium">
                {item.location || item.location_address || "Unknown Location"}
              </span>
              <span className="text-muted-foreground text-xs">{wardDisplay}</span>
            </div>
          </Button>
        </DrawerTrigger>

        <DrawerContent className="h-full overflow-hidden">
          <DrawerHeader className="pb-4 flex-shrink-0">
            <DrawerTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              {item.location || item.location_address || "Unknown Location"}
              {item.isDuplicate && (
                <Badge variant="outline" className="text-xs">Duplicate</Badge>
              )}
            </DrawerTitle>
            <DrawerDescription>{wardDisplay}</DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-4 px-4 pb-4 overflow-y-auto flex-1 min-h-0">
            {/* Map */}
            <CompactMap pothole={item} />

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenFullscreen} className="flex-1">
                <Maximize className="size-4 mr-2" />
                Full Map
              </Button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Severity</p>
                <Badge className={getSeverityClasses(item.severity || "Low")}>
                  {getSeverityIcon(item.severity || "Low")}
                  {item.severity || "Low"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <Badge variant="outline">{item.status || "Unknown"}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Reported</p>
                <p>{formatDisplayDate(reportedDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Assigned Team</p>
                <p>{item.assignedTeam?.team_name || item.assignedCrew || "Unassigned"}</p>
              </div>
            </div>

            {/* Image */}
            {item.imageUrl && (
              <div>
                <p className="text-muted-foreground text-sm mb-2">Photo</p>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={item.imageUrl}
                    alt={`Pothole at ${item.location_address || item.location}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="flex-shrink-0 border-t bg-background">
            <div className="flex gap-2 w-full">
              <Button className="flex-1">Update Details</Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <MapDialog
        title={item.location || item.location_address || "Unknown Location"}
        description={wardDisplay}
        isOpen={isFullscreenMapOpen}
        onOpenChange={setIsFullscreenMapOpen}
        center={mapCoordinates}
        zoom={FULLSCREEN_MAP_ZOOM}
        size="fullscreen"
        markers={[{ pothole: item }]}
      />
    </>
  );
}

export { PotholeLocationViewer, MapDialog, PotholeMapMarker };