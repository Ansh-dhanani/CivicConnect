"use client";

import * as React from "react";
import Image from "next/image";
import { MapPin, Navigation, Maximize, X, Star, MessageSquare, AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Map as MapComponent, MapMarker, MapPopup, MapTileLayer, MapZoomControl } from "@/components/ui/map";
import { useIsMobile } from "@/hooks/use-mobile";

import type { Complaint } from "./schema";
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from "./schema";

import { getComplaintPriorityColor, getComplaintStatusColor, getPrimaryImageUrl, getReportedDate, getReporterName, getDaysSinceReported } from "./schema";

// ============================================================================
// Types
// ============================================================================

interface ComplaintLocationViewerProps {
  item: Complaint;
  coordinates?: [number, number];
  allComplaints?: Complaint[];
  onStatusChange?: (complaintId: number, status: string) => void;
  onEscalate?: (complaintId: number, priority: string) => void;
  onAddNote?: (complaintId: number, note: string) => void;
  onFeedback?: (complaintId: number, rating: number, comment: string) => void;
}

interface ComplaintMapMarkerProps {
  complaint: Complaint;
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
    complaint: Complaint;
    isCurrent?: boolean;
    isSelectable?: boolean;
    count?: number;
    groupId?: string;
  }>;
  onMarkerClick?: (markerId: string | number) => void;
  selectedMarkerId?: string | null;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_COORDINATES: [number, number] = [19.076, 72.8777];
const FULLSCREEN_MAP_ZOOM = 15;

// ============================================================================
// Utility Components
// ============================================================================

function CompactMap({ complaint }: { complaint: Complaint }) {
  const coordinates = complaint.coordinates || DEFAULT_COORDINATES;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
      <MapComponent center={coordinates} zoom={15} className="h-full w-full">
        <MapTileLayer />
        <MapMarker position={coordinates}>
          <MapPopup>
            <div className="p-2">
              <h4 className="font-medium">{complaint.title}</h4>
              <p className="text-sm text-muted-foreground">{complaint.location || complaint.location_address}</p>
            </div>
          </MapPopup>
        </MapMarker>
      </MapComponent>
    </div>
  );
}

function ComplaintMapMarker({ complaint, isCurrent, isSelected, isSelectable, count, onClick }: ComplaintMapMarkerProps) {
  const coordinates = complaint.coordinates || DEFAULT_COORDINATES;

  return (
    <MapMarker
      position={coordinates}
      eventHandlers={{
        click: onClick,
      }}
    >
      <div
        className={`
          relative flex items-center justify-center rounded-full border-2 bg-background p-1 shadow-lg
          ${isCurrent ? 'border-primary' : 'border-border'}
          ${isSelected ? 'ring-2 ring-primary' : ''}
          ${isSelectable ? 'cursor-pointer hover:scale-110' : ''}
          transition-transform
        `}
      >
        {count && count > 1 ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {count}
          </div>
        ) : (
          <MapPin className="h-4 w-4 text-primary" />
        )}
      </div>
    </MapMarker>
  );
}

function MapDialog({
  title,
  description,
  isOpen,
  onOpenChange,
  center,
  zoom = 12,
  size = "large",
  markers = [],
  onMarkerClick,
  selectedMarkerId,
}: MapDialogProps) {
  const sizeClasses = {
    compact: "max-w-md",
    large: "max-w-4xl",
    fullscreen: "max-w-[95vw] max-h-[95vh]",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClasses[size]} h-[80vh]`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex-1 overflow-hidden rounded-lg border">
          <MapComponent center={center} zoom={zoom} className="h-full w-full">
            <MapTileLayer />
            <MapZoomControl />
            {markers.map((marker, index) => (
              <ComplaintMapMarker
                key={marker.groupId || marker.complaint.id || index}
                complaint={marker.complaint}
                isCurrent={false}
                isSelected={selectedMarkerId === (marker.groupId || marker.complaint.id?.toString())}
                isSelectable={marker.isSelectable}
                count={marker.count}
                onClick={() => marker.groupId && onMarkerClick?.(marker.groupId)}
              />
            ))}
          </MapComponent>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function ComplaintLocationViewer({ item, coordinates, allComplaints = [], onStatusChange, onEscalate, onAddNote, onFeedback }: ComplaintLocationViewerProps) {
  const isMobile = useIsMobile();
  const [isFullscreenMapOpen, setIsFullscreenMapOpen] = React.useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false);
  const [feedbackRating, setFeedbackRating] = React.useState(0);
  const [feedbackComment, setFeedbackComment] = React.useState("");
  const [noteText, setNoteText] = React.useState("");
  const [showNoteForm, setShowNoteForm] = React.useState(false);

  const mapCoordinates = item.coordinates || coordinates || DEFAULT_COORDINATES;
  const reportedDate = getReportedDate(item);
  const daysSince = getDaysSinceReported(item);

  const handleOpenFullscreen = React.useCallback(() => {
    setIsFullscreenMapOpen(true);
  }, []);

  const handleEscalate = React.useCallback(() => {
    if (onEscalate && item.priority !== "Critical") {
      const newPriority = item.priority === "Low" ? "Medium" : item.priority === "Medium" ? "High" : "Critical";
      onEscalate(item.id, newPriority);
    }
  }, [onEscalate, item]);

  const handleAddNote = React.useCallback(() => {
    if (onAddNote && noteText.trim()) {
      onAddNote(item.id, noteText.trim());
      setNoteText("");
      setShowNoteForm(false);
    }
  }, [onAddNote, item.id, noteText]);

  const handleSubmitFeedback = React.useCallback(() => {
    if (onFeedback && feedbackRating > 0) {
      onFeedback(item.id, feedbackRating, feedbackComment.trim());
      setFeedbackRating(0);
      setFeedbackComment("");
      setShowFeedbackForm(false);
    }
  }, [onFeedback, item.id, feedbackRating, feedbackComment]);

  const canEscalate = item.priority !== "Critical" && onEscalate;
  const canAddFeedback = (item.status === "Resolved" || item.status === "Closed") && !item.feedback_rating && onFeedback;

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MapPin className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[96vh]">
          <DrawerHeader className="gap-1">
            <DrawerTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              {item.title}
              <Badge className={`text-xs ${getComplaintPriorityColor(item.priority)}`}>
                {item.priority}
              </Badge>
            </DrawerTitle>
            <DrawerDescription>
              {item.location || item.location_address || "Unknown Location"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
            <CompactMap complaint={item} />

            <Button variant="outline" size="sm" onClick={handleOpenFullscreen} className="w-full">
              <Maximize className="size-4 mr-2" />
              View Full Map
            </Button>

            <Separator />

            {/* Complaint Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-muted-foreground text-xs">Category</p>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
              <div>
                <p className="mb-1 text-muted-foreground text-xs">Status</p>
                {onStatusChange ? (
                  <Select
                    value={item.status}
                    onValueChange={(value) => onStatusChange(item.id, value)}
                  >
                    <SelectTrigger className="w-full">
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
                    {item.status}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-muted-foreground text-xs">Reported Date</p>
                <p className="font-medium">{new Date(reportedDate).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">{daysSince} days ago</p>
              </div>
              <div>
                <p className="mb-1 text-muted-foreground text-xs">Target Resolution</p>
                <p className="font-medium">
                  {item.estimated_resolution_time ? new Date(item.estimated_resolution_time).toLocaleDateString() : "Not set"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-muted-foreground text-xs">Reported By</p>
                <p className="font-medium">{getReporterName(item)}</p>
              </div>
              <div>
                <p className="mb-1 text-muted-foreground text-xs">Priority</p>
                <Badge className={`text-xs ${getComplaintPriorityColor(item.priority)}`}>
                  {item.priority}
                </Badge>
              </div>
            </div>

            {item.description && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-muted-foreground text-xs">Description</p>
                  <p className="text-sm">{item.description}</p>
                </div>
              </>
            )}

            {item.imageUrl && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-muted-foreground text-xs">Complaint Image</p>
                  <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    <Image
                      src={item.imageUrl}
                      alt={`Complaint: ${item.title}`}
                      fill
                      className="rounded-lg border object-cover"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Quick Actions */}
            <Separator />
            <div>
              <p className="mb-3 text-muted-foreground text-xs font-medium">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {canEscalate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEscalate}
                    className="text-xs"
                  >
                    <AlertTriangle className="size-3 mr-1" />
                    Escalate
                  </Button>
                )}
                {onAddNote && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNoteForm(!showNoteForm)}
                    className="text-xs"
                  >
                    <MessageSquare className="size-3 mr-1" />
                    Add Note
                  </Button>
                )}
                {canAddFeedback && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                    className="text-xs"
                  >
                    <Star className="size-3 mr-1" />
                    Rate Service
                  </Button>
                )}
              </div>
            </div>

            {/* Add Note Form */}
            {showNoteForm && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-muted-foreground text-xs">Add Note</p>
                  <Textarea
                    placeholder="Enter your note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>
                      Add Note
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowNoteForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Feedback Form */}
            {showFeedbackForm && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-muted-foreground text-xs">Rate Our Service</p>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-8 w-8"
                        onClick={() => setFeedbackRating(star)}
                      >
                        <Star
                          className={`size-4 ${
                            star <= feedbackRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Share your feedback (optional)..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleSubmitFeedback} disabled={feedbackRating === 0}>
                      Submit Feedback
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowFeedbackForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Existing Feedback Display */}
            {item.feedback_rating && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-muted-foreground text-xs">Your Feedback</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-4 ${
                            star <= item.feedback_rating!
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.feedback_rating}/5
                    </span>
                  </div>
                  {item.feedback_comment && (
                    <p className="text-sm text-muted-foreground italic">
                      "{item.feedback_comment}"
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <DrawerFooter>
            <div className="flex gap-2 w-full">
              <Button className="flex-1">Update Details</Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <MapPin className="h-4 w-4" />
      </Button>

      <MapDialog
        title={item.title}
        description={item.location || item.location_address}
        isOpen={isFullscreenMapOpen}
        onOpenChange={setIsFullscreenMapOpen}
        center={mapCoordinates}
        zoom={FULLSCREEN_MAP_ZOOM}
        size="fullscreen"
        markers={[{ complaint: item }]}
      />
    </>
  );
}

export { ComplaintLocationViewer, MapDialog, ComplaintMapMarker };