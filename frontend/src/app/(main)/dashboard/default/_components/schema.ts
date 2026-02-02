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
 * Ward information schema supporting both simple string and detailed object formats
 */
const wardSchema = z.union([
  z.string(),
  z.object({
    id: z.number().positive(),
    ward_number: z.string(),
    ward_name: z.string(),
    ward_officer_name: z.string().nullable(),
  }),
]);

/**
 * Team assignment schema
 */
const teamSchema = z.object({
  id: z.number().positive(),
  team_code: z.string(),
  team_name: z.string(),
  team_leader_name: z.string().nullable(),
});

/**
 * Image attachment schema
 */
const imageSchema = z.object({
  id: z.number().positive(),
  image_url: z.string().url(),
  image_type: z.string().nullable(),
});

/**
 * History/audit log entry schema
 */
const historyEntrySchema = z.object({
  id: z.number().positive(),
  action: z.string().min(1),
  created_at: z.string().datetime(),
});

// ============================================================================
// Enums - Centralized status and severity definitions
// ============================================================================

/**
 * Pothole severity levels ordered by priority
 */
export const PotholeSeverity = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
} as const;

export const potholeSeveritySchema = z.enum([
  PotholeSeverity.CRITICAL,
  PotholeSeverity.HIGH,
  PotholeSeverity.MEDIUM,
  PotholeSeverity.LOW,
]);

/**
 * Pothole lifecycle status values
 */
export const PotholeStatus = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  VERIFIED: "Verified",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  DUPLICATE: "Duplicate",
} as const;

export const potholeStatusSchema = z.enum([
  PotholeStatus.PENDING,
  PotholeStatus.UNDER_REVIEW,
  PotholeStatus.VERIFIED,
  PotholeStatus.ASSIGNED,
  PotholeStatus.IN_PROGRESS,
  PotholeStatus.COMPLETED,
  PotholeStatus.REJECTED,
  PotholeStatus.DUPLICATE,
]);

// ============================================================================
// Main Schema - Pothole data structure
// ============================================================================

/**
 * Comprehensive pothole schema supporting both backend data and legacy mock data.
 */
export const potholeSchema = z.object({
  // Core identification
  id: z.number().positive(),
  pothole_number: z.string().optional(),
  original_complaint_id: z.number().positive().nullable().optional(),

  // Location information
  location_address: z.string().optional(),
  ward_id: z.number().positive().optional(),
  ward: wardSchema.optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),

  // Classification
  severity: potholeSeveritySchema.optional(),
  status: potholeStatusSchema.optional(),

  // User assignments and tracking
  created_by: z.string().uuid().optional(),
  createdBy: userReferenceSchema.optional(),
  assigned_team_id: z.number().positive().nullable().optional(),
  assignedTeam: teamSchema.nullable().optional(),
  assigned_by: z.string().uuid().nullable().optional(),
  assignedBy: userReferenceSchema.omit({ email: true }).nullable().optional(),
  completed_by: z.string().uuid().nullable().optional(),
  completedBy: userReferenceSchema.omit({ email: true }).nullable().optional(),
  quality_checked_by: z.string().uuid().nullable().optional(),
  qualityCheckedBy: userReferenceSchema.omit({ email: true }).nullable().optional(),

  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),

  // Attachments and history
  images: z.array(imageSchema).optional(),
  history: z.array(historyEntrySchema).optional(),

  // Computed/derived fields
  isDuplicate: z.boolean().default(false),
  originalId: z.number().positive().nullable().default(null),

  // Legacy fields for backward compatibility
  location: z.string().optional(),
  reportedDate: z.string().optional(),
  targetRepairDate: z.string().optional(),
  assignedCrew: z.string().optional(),
  reportedBy: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type Pothole = z.infer<typeof potholeSchema>;
export type PotholeSeverity = z.infer<typeof potholeSeveritySchema>;
export type PotholeStatus = z.infer<typeof potholeStatusSchema>;
export type Ward = z.infer<typeof wardSchema>;
export type Team = z.infer<typeof teamSchema>;
export type UserReference = z.infer<typeof userReferenceSchema>;
export type ImageAttachment = z.infer<typeof imageSchema>;
export type HistoryEntry = z.infer<typeof historyEntrySchema>;

// ============================================================================
// Constants
// ============================================================================

export const REPAIR_TEAMS = ["Team A", "Team B", "Team C", "Team D"] as const;
export type RepairTeam = typeof REPAIR_TEAMS[number];

// ============================================================================
// Utility Functions
// ============================================================================

export function isDetailedWard(ward: Ward): ward is Extract<Ward, { id: number }> {
  return typeof ward === "object" && "id" in ward;
}

export function getWardDisplayName(ward: Ward | undefined): string {
  if (!ward) return "Unknown";
  return typeof ward === "string" ? ward : ward.ward_name;
}

export function isPotholeOverdue(pothole: Pothole): boolean {
  if (!pothole.targetRepairDate) return false;
  return new Date() > new Date(pothole.targetRepairDate);
}

export function getPrimaryImageUrl(pothole: Pothole): string | null {
  if (pothole.images && pothole.images.length > 0) {
    return pothole.images[0].image_url;
  }
  return pothole.imageUrl || null;
}

export function getReportedDate(pothole: Pothole): string {
  return pothole.created_at || pothole.reportedDate || "";
}

export function getReporterName(pothole: Pothole): string {
  return pothole.createdBy?.full_name || pothole.reportedBy || "Unknown";
}