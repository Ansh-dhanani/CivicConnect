import { z } from "zod";

// ============================================================================
// Base Schemas - Reusable building blocks
// ============================================================================

/**
 * User reference schema for various user-related fields
 */
const userReferenceSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string().email().optional(),
});

/**
 * Category schema for complaint types
 */
const complaintCategorySchema = z.enum([
  "Infrastructure",
  "Sanitation",
  "Traffic",
  "Public Safety",
  "Utilities",
  "Environment",
  "Other"
]);

/**
 * Priority levels for complaints
 */
const prioritySchema = z.enum([
  "Low",
  "Medium",
  "High",
  "Critical"
]);

/**
 * Complaint status schema
 */
const complaintStatusSchema = z.enum([
  "Pending",
  "Under Review",
  "Investigating",
  "Resolved",
  "Closed",
  "Rejected"
]);

/**
 * Image attachment schema
 */
const imageSchema = z.object({
  id: z.number().positive(),
  image_url: z.string().url(),
  image_type: z.string().nullable(),
});

// ============================================================================
// Main Complaint Schema
// ============================================================================

export const complaintSchema = z.object({
  id: z.number().positive(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: complaintCategorySchema,
  priority: prioritySchema,
  status: complaintStatusSchema,
  location: z.string().optional(),
  location_address: z.string().optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  ward: z.string().optional(),
  images: z.array(imageSchema).optional(),
  imageUrl: z.string().url().optional(),

  // User information
  createdBy: userReferenceSchema.optional(),
  assignedTo: userReferenceSchema.optional(),
  reportedBy: z.string().optional(),

  // Timestamps
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  resolved_at: z.string().optional(),

  // Additional metadata
  tags: z.array(z.string()).optional(),
  estimated_resolution_time: z.string().optional(),
  actual_resolution_time: z.string().optional(),
  feedback_rating: z.number().min(1).max(5).optional(),
  feedback_comment: z.string().optional(),
});

export type Complaint = z.infer<typeof complaintSchema>;

// ============================================================================
// Constants
// ============================================================================

export const COMPLAINT_CATEGORIES = complaintCategorySchema.options;
export const COMPLAINT_PRIORITIES = prioritySchema.options;
export const COMPLAINT_STATUSES = complaintStatusSchema.options;

// ============================================================================
// Utility Functions
// ============================================================================

export function getComplaintPriorityColor(priority: string): string {
  switch (priority) {
    case "Critical":
      return "destructive";
    case "High":
      return "destructive";
    case "Medium":
      return "secondary";
    case "Low":
      return "outline";
    default:
      return "outline";
  }
}

export function getComplaintStatusColor(status: string): string {
  switch (status) {
    case "Resolved":
    case "Closed":
      return "default";
    case "Pending":
      return "secondary";
    case "Under Review":
    case "Investigating":
      return "secondary";
    case "Rejected":
      return "destructive";
    default:
      return "outline";
  }
}

export function getComplaintCategoryIcon(category: string): string {
  switch (category) {
    case "Infrastructure":
      return "Building";
    case "Sanitation":
      return "Trash";
    case "Traffic":
      return "Car";
    case "Public Safety":
      return "Shield";
    case "Utilities":
      return "Zap";
    case "Environment":
      return "Leaf";
    default:
      return "AlertCircle";
  }
}

export function isComplaintOverdue(complaint: Complaint): boolean {
  if (!complaint.estimated_resolution_time) return false;
  return new Date() > new Date(complaint.estimated_resolution_time);
}

export function getPrimaryImageUrl(complaint: Complaint): string | null {
  if (complaint.images && complaint.images.length > 0) {
    return complaint.images[0].image_url;
  }
  return complaint.imageUrl || null;
}

export function getReportedDate(complaint: Complaint): string {
  return complaint.created_at || "";
}

export function getReporterName(complaint: Complaint): string {
  return complaint.createdBy?.full_name || complaint.reportedBy || "Unknown";
}

export function getDaysSinceReported(complaint: Complaint): number {
  if (!complaint.created_at) return 0;
  const reported = new Date(complaint.created_at);
  const now = new Date();
  return Math.floor((now.getTime() - reported.getTime()) / (1000 * 60 * 60 * 24));
}

export function getResolutionTime(complaint: Complaint): number | null {
  if (!complaint.created_at || !complaint.resolved_at) return null;
  const created = new Date(complaint.created_at);
  const resolved = new Date(complaint.resolved_at);
  return Math.floor((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}