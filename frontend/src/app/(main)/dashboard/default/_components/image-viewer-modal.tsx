"use client";

import * as React from "react";
import Image from "next/image";
import { Download, ZoomIn, ZoomOut } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ============================================================================
// Types
// ============================================================================

interface ImageViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  location: string;
  ward: string;
  severity: string;
  status: string;
  reportedDate: string;
  reportedBy: string;
}

// ============================================================================
// Constants
// ============================================================================

const ZOOM_STEP = 25;
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const DEFAULT_ZOOM = 100;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get badge variant based on severity level
 */
function getSeverityBadgeVariant(severity: string): "destructive" | "default" | "outline" {
  switch (severity) {
    case "Critical":
      return "destructive";
    case "High":
      return "default";
    default:
      return "outline";
  }
}

/**
 * Format filename for download from location string
 */
function formatDownloadFilename(location: string): string {
  return `pothole-${location.replace(/\s+/g, "-")}.jpg`;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Modal component for viewing pothole images with zoom and download capabilities - Simplified
 */
export function ImageViewerModal({
  open,
  onOpenChange,
  imageUrl,
  location,
  ward,
  severity,
  status,
  reportedDate,
  reportedBy,
}: ImageViewerModalProps) {
  const [zoom, setZoom] = React.useState(DEFAULT_ZOOM);

  // Reset zoom when modal closes
  React.useEffect(() => {
    if (!open) {
      setZoom(DEFAULT_ZOOM);
    }
  }, [open]);

  const handleDownload = React.useCallback(() => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = formatDownloadFilename(location);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl, location]);

  const handleZoomIn = React.useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const formattedDate = React.useMemo(() => {
    return new Date(reportedDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [reportedDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl  p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold">{location}</h2>
            <p className="text-sm text-muted-foreground">{ward}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getSeverityBadgeVariant(severity)}>{severity}</Badge>
            <Badge variant="outline">{status}</Badge>
          </div>
        </div>

        {/* Image */}
        <div className="relative aspect-video bg-muted">
          <Image
            src={imageUrl}
            alt={`Pothole at ${location}`}
            fill
            className="object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100})`,
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Reported by {reportedBy} on {formattedDate}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM}
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="min-w-12 text-center text-sm">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= MAX_ZOOM}
              >
                <ZoomIn className="size-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="size-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}