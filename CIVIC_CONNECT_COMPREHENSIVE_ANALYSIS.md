# CivicConnect - Comprehensive Project Analysis & Improvement Plan

**Generated:** February 2, 2026  
**Project:** CivicConnect - Civic Infrastructure Complaint Management System

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Overview](#current-architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Current Implementation Analysis](#current-implementation-analysis)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Identified Issues & Improvements](#identified-issues--improvements)
7. [Proposed Architecture](#proposed-architecture)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Detailed Module Specifications](#detailed-module-specifications)

---

## Executive Summary

CivicConnect is a multi-platform civic infrastructure complaint management system that enables citizens to report issues (potholes, streetlights, etc.), field teams to manage repairs, and administrators to oversee operations through a web portal.

### Current Status
- ✅ **Backend**: Express.js with Prisma ORM (PostgreSQL)
- ✅ **Frontend**: Next.js 16 with React 19
- ✅ **Mobile**: Flutter app for citizens and field teams
- ⚠️ **AI Model**: Jupyter notebook (not integrated)
- ⚠️ **Authentication**: Basic JWT (needs upgrade to better-auth)
- ⚠️ **Team Management**: Database schema exists but incomplete implementation
- ❌ **Settings/Analytics**: Not implemented
- ❌ **Real-time Updates**: Not implemented

### Key Objectives
1. Refactor backend to professional modular architecture
2. Implement better-auth for OAuth and proper authentication
3. Improve database schema for team management
4. Create single source of truth for data management
5. Add settings, analytics, and reporting features
6. Integrate AI model for image validation
7. Implement real-time notifications
8. Improve UI/UX for team assignment workflow

---

## Current Architecture Overview

```
┌─────────────────── CLIENT LAYER ───────────────────┐
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  Citizen     │  │  Team        │  │  Admin   │ │
│  │  Mobile App  │  │  Mobile App  │  │  Web     │ │
│  │  (Flutter)   │  │  (Flutter)   │  │  (Next)  │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│         │                  │                │      │
└─────────┼──────────────────┼────────────────┼──────┘
          │                  │                │
          └──────────────────┴────────────────┘
                             │
                   HTTPS + JWT Bearer Token
                             │
                             ▼
┌─────────────────── API LAYER ─────────────────────┐
│                                                    │
│  ┌─────────────────────────────────────────────┐ │
│  │        Express.js Backend                    │ │
│  │  • /api/auth (login, register)              │ │
│  │  • /api/users (profile)                     │ │
│  │  • /api/complaints (CRUD, nearby)           │ │
│  │  • Port: 4000                               │ │
│  └─────────────────────────────────────────────┘ │
│                                                    │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌─────────────────── DATA LAYER ────────────────────┐
│                                                    │
│  ┌─────────────────────────────────────────────┐ │
│  │        PostgreSQL Database                   │ │
│  │  • Users (admin, field_officer, citizen)    │ │
│  │  • Complaints                                │ │
│  │  • Potholes                                  │ │
│  │  • RepairTeams                               │ │
│  │  • Wards                                     │ │
│  │  • Images, Updates, Notifications           │ │
│  └─────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘

┌─────────────────── EXTERNAL SERVICES ─────────────┐
│                                                    │
│  ┌──────────────┐  ┌──────────────┐              │
│  │  Cloudinary  │  │  AI Service  │              │
│  │  (Images)    │  │  (Future)    │              │
│  └──────────────┘  └──────────────┘              │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js (Express.js)
- **ORM**: Prisma Client (v4.13.0)
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken v9.0.0)
- **Password**: bcrypt v5.1.0
- **CORS**: cors v2.8.5

### Frontend (Admin Web Portal)
- **Framework**: Next.js 16.1.4 (React 19.2.3)
- **UI Components**: Radix UI, shadcn/ui
- **Styling**: TailwindCSS 4.1.5
- **State Management**: Zustand 5.0.10
- **Data Fetching**: @tanstack/react-query 5.90.19
- **Forms**: react-hook-form 7.71.1 + zod 3.25.76
- **Maps**: Leaflet + React Leaflet
- **Icons**: Lucide React
- **Bundler**: Turbopack (Next.js)

### Mobile App
- **Framework**: Flutter
- **State Management**: GetX
- **HTTP Client**: Dio
- **Storage**: shared_preferences
- **Image Upload**: Cloudinary SDK
- **Camera**: camera package
- **Location**: geolocator

### AI Model
- **Language**: Python
- **Notebook**: Jupyter
- **Status**: Not integrated (needs FastAPI wrapper)

---

## Current Implementation Analysis

### Backend Structure

```
express-backend/
├── prisma/
│   ├── schema.prisma          ✅ Comprehensive schema
│   ├── seed.js                ✅ Seed data
│   └── migrations/            ✅ Version controlled
├── src/
│   ├── index.js               ⚠️ Monolithic, needs modularization
│   ├── controllers/           ⚠️ Good separation but needs improvement
│   │   ├── SessionController.js
│   │   ├── UserController.js
│   │   └── ComplaintController.js
│   ├── middleware/
│   │   └── isAuthenticated.js ⚠️ Basic JWT validation
│   ├── services/              ⚠️ Minimal services
│   │   ├── Misc.js
│   │   ├── SessionServices.js
│   │   └── UserServices.js
│   └── utils/
│       ├── db.js              ✅ Prisma client
│       ├── jwt.js             ✅ Token generation
│       └── statusCodes.js     ✅ HTTP codes
└── package.json
```

#### Strengths
- ✅ Clean database schema with proper relations
- ✅ JWT authentication implemented
- ✅ CORS configuration
- ✅ Password hashing with bcrypt
- ✅ Prisma migrations

#### Weaknesses
- ❌ No input validation middleware (needs class-validator or zod)
- ❌ No error handling middleware
- ❌ No request rate limiting
- ❌ No logging system
- ❌ Controllers doing too much (violates SRP)
- ❌ No service layer abstraction
- ❌ Missing routes: teams, wards, analytics, notifications
- ❌ No WebSocket/SSE for real-time updates
- ❌ No API documentation (Swagger/OpenAPI)
- ❌ No tests

### Frontend Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (external)/        ✅ Auth pages
│   │   └── (main)/
│   │       └── dashboard/
│   │           ├── default/   ⚠️ Only one dashboard route
│   │           ├── coming-soon/ ❌ Placeholder
│   │           └── layout.tsx ✅ Good layout structure
│   ├── components/
│   │   ├── ui/                ✅ Radix/shadcn components
│   │   └── data-table/        ✅ Reusable table component
│   ├── server/
│   │   └── server-actions.ts ⚠️ Minimal server actions
│   ├── stores/                ✅ Zustand state management
│   ├── navigation/            ✅ Sidebar navigation config
│   ├── config/                ✅ App configuration
│   └── lib/                   ✅ Utility functions
```

#### Strengths
- ✅ Modern Next.js App Router architecture
- ✅ Component-based UI with Radix
- ✅ Proper routing structure
- ✅ Type-safe with TypeScript
- ✅ Good separation of concerns

#### Weaknesses
- ❌ No API layer (direct fetch calls)
- ❌ No error boundary components
- ❌ Limited routes (only default dashboard)
- ❌ No settings page
- ❌ No analytics/reports page
- ❌ No user management page
- ❌ No team management interface
- ❌ Mock data instead of API integration
- ❌ No authentication integration (better-auth not implemented)
- ❌ Team assignment UX needs improvement

### Flutter App Structure

```
flutter-app/civicconnectapp/
├── lib/
│   ├── main.dart              ✅ App entry point
│   ├── controllers/           ✅ GetX controllers
│   │   ├── auth_controller.dart
│   │   └── complaint_controller.dart
│   ├── services/              ✅ Service layer
│   │   ├── api_service.dart
│   │   ├── cloudinary_service.dart
│   │   └── storage_service.dart
│   └── views/                 ✅ UI screens
│       ├── login_screen.dart
│       ├── signup_screen.dart
│       ├── main_screen.dart
│       ├── capture_screen.dart
│       ├── my_complaints_screen.dart
│       └── profile_screen.dart
```

#### Strengths
- ✅ Complete API integration
- ✅ Token management with persistent storage
- ✅ Cloudinary image upload
- ✅ Camera integration
- ✅ Location services
- ✅ Clean MVC architecture with GetX

#### Weaknesses
- ❌ No team/field officer features
- ❌ No real-time notifications
- ❌ No offline support
- ❌ No complaint status updates
- ❌ Limited error handling
- ❌ No complaint detail view with history

### Database Schema Analysis

#### Current Schema Strengths
- ✅ Comprehensive user roles (admin, field_officer, citizen)
- ✅ Proper enums for status and severity
- ✅ Good relations between entities
- ✅ Separate Complaint and Pothole entities
- ✅ RepairTeam model exists
- ✅ Ward-based organization
- ✅ Audit trail with history tables
- ✅ Notification system
- ✅ Upvote/Feedback systems

#### Current Schema Weaknesses
- ❌ RepairTeam lacks capacity/availability tracking
- ❌ No team member management (team leader but no team members)
- ❌ No geographic boundaries for wards
- ❌ No SLA/deadline tracking
- ❌ Missing indexes for performance
- ❌ No soft delete support
- ❌ Limited analytics aggregation tables

---

## Data Flow Diagrams

### 1. Citizen Complaint Submission Flow

```
┌─────────────┐
│   Citizen   │
│  (Flutter)  │
└─────┬───────┘
      │ 1. Take photo
      │ 2. Fill form (title, desc, location)
      │ 3. Get GPS coords
      ▼
┌─────────────────┐
│   Cloudinary    │ ← 4. Upload image
│   Image Upload  │
└─────┬───────────┘
      │ 5. Returns image URL
      ▼
┌─────────────────────────────┐
│  POST /api/complaints       │
│  {                          │
│    title, description,      │
│    location_address,        │
│    latitude, longitude,     │
│    category, images[],      │
│    is_anonymous             │
│  }                          │
└─────┬───────────────────────┘
      │ 6. Authenticate user
      ▼
┌─────────────────────────────┐
│  ComplaintController.create │
│  • Validate input           │
│  • Generate complaint #     │
│  • Save to database         │
│  • Create images records    │
└─────┬───────────────────────┘
      │ 7. Insert into DB
      ▼
┌─────────────────────────────┐
│  PostgreSQL                 │
│  • complaints table         │
│  • complaint_images table   │
└─────┬───────────────────────┘
      │ 8. Return complaint data
      ▼
┌─────────────────────────────┐
│  Response                   │
│  {                          │
│    success: true,           │
│    complaint_id,            │
│    complaintNumber,         │
│    status: 'Submitted'      │
│  }                          │
└─────────────────────────────┘
```

### 2. Admin Dashboard View Flow (Current - Static Data)

```
┌─────────────┐
│   Admin     │
│   (Web)     │
└─────┬───────┘
      │ 1. Navigate to /dashboard/default
      ▼
┌─────────────────────────────┐
│  Frontend Page Component    │
│  • Loads mock data          │ ⚠️ NOT FROM API
│  • Renders data table       │
│  • Client-side filtering    │
└─────┬───────────────────────┘
      │ 2. Display potholes
      ▼
┌─────────────────────────────┐
│  Data Table Component       │
│  • Filters (severity, etc)  │
│  • Team assignment dialog   │
│  • Map view                 │
└─────────────────────────────┘
```

**Problem**: Frontend uses mock data, not connected to backend API!

### 3. Proposed Admin Dashboard Flow (Improved)

```
┌─────────────┐
│   Admin     │
│   (Web)     │
└─────┬───────┘
      │ 1. Navigate to dashboard
      ▼
┌─────────────────────────────┐
│  Server Component           │
│  • Authenticate session     │
│  • Check permissions        │
└─────┬───────────────────────┘
      │ 2. Initial data fetch
      ▼
┌─────────────────────────────┐
│  GET /api/complaints        │
│  • Pagination               │
│  • Filtering                │
│  • Include relations        │
└─────┬───────────────────────┘
      │ 3. Query database
      ▼
┌─────────────────────────────┐
│  ComplaintService           │
│  • Business logic           │
│  • Access control           │
│  • Data transformation      │
└─────┬───────────────────────┘
      │ 4. Prisma query
      ▼
┌─────────────────────────────┐
│  PostgreSQL                 │
│  • Join complaints          │
│  • Join teams, wards        │
│  • Apply filters            │
└─────┬───────────────────────┘
      │ 5. Return data
      ▼
┌─────────────────────────────┐
│  React Query Cache          │
│  • Store in client          │
│  • Optimistic updates       │
│  • Invalidation strategy    │
└─────┬───────────────────────┘
      │ 6. Render UI
      ▼
┌─────────────────────────────┐
│  Data Table Component       │
│  • Client-side sorting      │
│  • Server-side filtering    │
│  • Real-time updates via WS │
└─────────────────────────────┘
```

---

## Identified Issues & Improvements

### Critical Issues (Must Fix)

#### 1. **Backend Architecture**
**Current**: Monolithic index.js, controllers doing too much  
**Issue**: Not scalable, hard to maintain, violates SOLID principles  
**Fix**: Refactor to modular architecture with proper service layer

#### 2. **Authentication System**
**Current**: Basic JWT, no OAuth, no session management  
**Issue**: Security concerns, no social login, manual token refresh  
**Fix**: Implement better-auth with OAuth providers (Google, GitHub)

#### 3. **Frontend-Backend Disconnect**
**Current**: Frontend uses mock data, no API integration  
**Issue**: Features don't work, data doesn't persist  
**Fix**: Create API client layer, integrate React Query

#### 4. **Team Management**
**Current**: Database schema exists but no API or UI  
**Issue**: Can't assign teams, can't create teams  
**Fix**: Build complete team management system

#### 5. **No Validation**
**Current**: No input validation middleware  
**Issue**: Security vulnerability, data integrity issues  
**Fix**: Add Zod validation schemas for all endpoints

### High Priority Issues

#### 6. **Limited Routes**
**Current**: Only 8 backend endpoints, 1 frontend dashboard  
**Issue**: Missing critical features  
**Fix**: Add routes for:
- Team management (CRUD)
- Ward management
- Analytics/Reports
- Notifications
- Settings
- User management (admin only)

#### 7. **Poor Error Handling**
**Current**: Basic try-catch, inconsistent error responses  
**Issue**: Hard to debug, poor user experience  
**Fix**: Centralized error handling middleware

#### 8. **Team Assignment UX**
**Current**: Dialog-based assignment, not intuitive  
**Issue**: Poor user experience, doesn't scale  
**Fix**: Redesign with:
- Drag-and-drop interface
- Team availability view
- Workload balancing
- Bulk assignment

#### 9. **No Real-time Updates**
**Current**: Polling or manual refresh  
**Issue**: Delayed information, poor UX  
**Fix**: Implement WebSockets or Server-Sent Events

#### 10. **AI Model Not Integrated**
**Current**: Jupyter notebook only  
**Issue**: Image validation not automated  
**Fix**: Create FastAPI wrapper, integrate with backend

### Medium Priority Issues

#### 11. **No Analytics Dashboard**
**Current**: Coming soon placeholder  
**Issue**: Can't track metrics  
**Fix**: Create analytics page with:
- Complaint trends
- Team performance
- Response times
- Geographic distribution

#### 12. **No Settings Page**
**Current**: Hard-coded configuration  
**Issue**: Can't customize app behavior  
**Fix**: Build settings interface for:
- User preferences
- System configuration
- Ward/team management
- Notification preferences

#### 13. **Limited Mobile Features**
**Current**: Citizen app only  
**Issue**: Field officers can't use mobile app  
**Fix**: Add field officer features:
- Assigned complaints view
- Status update capability
- Photo upload for completion
- Navigation to complaint location

#### 14. **No Audit Logging**
**Current**: Basic timestamps  
**Issue**: Can't track who did what  
**Fix**: Comprehensive activity logging system

### Low Priority Issues

#### 15. **No API Documentation**
**Current**: No Swagger/OpenAPI  
**Issue**: Hard for developers to understand API  
**Fix**: Generate OpenAPI docs

#### 16. **No Tests**
**Current**: No unit/integration tests  
**Issue**: Bugs in production  
**Fix**: Add Jest tests for backend, React Testing Library for frontend

#### 17. **Performance**
**Current**: No caching, no database optimization  
**Issue**: Slow queries as data grows  
**Fix**: Add Redis cache, optimize Prisma queries, add indexes

---

## Proposed Architecture

### Improved Backend Architecture

```
express-backend/
├── prisma/
│   ├── schema.prisma          # Enhanced with indexes, better relations
│   ├── seed.ts                # TypeScript seed file
│   └── migrations/
├── src/
│   ├── main.ts                # App entry point
│   ├── config/
│   │   ├── database.ts        # Prisma config
│   │   ├── auth.ts            # better-auth config
│   │   ├── redis.ts           # Cache config
│   │   └── cors.ts            # CORS config
│   ├── modules/               # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.middleware.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   └── dto/
│   │   ├── complaints/
│   │   │   ├── complaints.controller.ts
│   │   │   ├── complaints.service.ts
│   │   │   ├── complaints.routes.ts
│   │   │   └── dto/
│   │   ├── teams/
│   │   │   ├── teams.controller.ts
│   │   │   ├── teams.service.ts
│   │   │   ├── teams.routes.ts
│   │   │   └── dto/
│   │   ├── wards/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── settings/
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── error-handler.ts
│   │   │   ├── validation.ts
│   │   │   ├── rate-limit.ts
│   │   │   └── logger.ts
│   │   ├── decorators/
│   │   ├── guards/
│   │   └── utils/
│   ├── shared/
│   │   ├── constants/
│   │   ├── types/
│   │   └── schemas/          # Shared Zod schemas
│   └── tests/
│       ├── unit/
│       └── integration/
└── package.json
```

### Frontend Architecture (Single Source of Truth Pattern)

```
frontend/src/
├── app/
│   ├── (auth)/                # Authentication pages
│   │   ├── login/
│   │   └── register/
│   └── (dashboard)/           # Protected routes
│       ├── layout.tsx
│       ├── page.tsx           # Main dashboard
│       ├── complaints/
│       │   ├── page.tsx       # List view
│       │   ├── [id]/          # Detail view
│       │   └── new/           # Create form
│       ├── teams/
│       │   ├── page.tsx
│       │   ├── [id]/
│       │   └── new/
│       ├── wards/
│       ├── analytics/
│       │   ├── page.tsx
│       │   ├── complaints/
│       │   ├── teams/
│       │   └── performance/
│       ├── settings/
│       │   ├── page.tsx
│       │   ├── profile/
│       │   ├── notifications/
│       │   └── system/
│       └── users/             # Admin only
├── lib/
│   ├── api/                   # API client layer (SINGLE SOURCE OF TRUTH)
│   │   ├── client.ts          # Axios instance
│   │   ├── auth.api.ts
│   │   ├── complaints.api.ts
│   │   ├── teams.api.ts
│   │   ├── wards.api.ts
│   │   └── analytics.api.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-complaints.ts  # React Query hooks
│   │   ├── use-teams.ts
│   │   └── use-auth.ts
│   ├── store/                 # Global state (Zustand)
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── preferences.store.ts
│   └── utils/
├── components/
│   ├── complaints/
│   │   ├── complaint-list.tsx
│   │   ├── complaint-card.tsx
│   │   ├── complaint-form.tsx
│   │   └── complaint-map.tsx
│   ├── teams/
│   │   ├── team-list.tsx
│   │   ├── team-card.tsx
│   │   └── team-assignment.tsx
│   └── ui/                    # Reusable UI components
└── types/                     # TypeScript types
```

### Database Schema Improvements

```prisma
// Enhanced RepairTeam model
model RepairTeam {
  id             Int       @id @default(autoincrement())
  team_code      String    @unique @db.VarChar(50)
  team_name      String    @db.VarChar(100)
  team_leader_id String?   @db.Uuid                    // NEW: Link to User
  team_leader    User?     @relation("TeamLeader", fields: [team_leader_id], references: [id])
  
  // Capacity management
  max_capacity   Int       @default(10)                 // NEW: Max concurrent tasks
  current_load   Int       @default(0)                  // NEW: Current assignments
  
  // Availability
  is_active      Boolean   @default(true)
  is_available   Boolean   @default(true)
  unavailable_until DateTime?                          // NEW: Temporary unavailability
  
  // Contact
  contact_phone  String?   @db.VarChar(20)             // NEW
  contact_email  String?   @db.VarChar(255)            // NEW
  
  // Location/Ward assignment
  primary_ward_id Int?                                 // NEW: Primary ward
  primary_ward   Ward?     @relation("PrimaryWard", fields: [primary_ward_id], references: [id])
  coverage_wards Ward[]    @relation("CoverageWards")  // NEW: Multiple wards
  
  // Timestamps
  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt
  
  // Relations
  members        TeamMember[]                          // NEW
  assignedComplaints Complaint[]
  assignedPotholes   Potholes[]
  performance    TeamPerformance[]                     // NEW
}

// NEW: Team Members model
model TeamMember {
  id             Int       @id @default(autoincrement())
  team_id        Int
  team           RepairTeam @relation(fields: [team_id], references: [id], onDelete: Cascade)
  user_id        String    @db.Uuid
  user           User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  role           String    @default("member") // leader, member, specialist
  is_active      Boolean   @default(true)
  joined_at      DateTime  @default(now())
  
  @@unique([team_id, user_id])
}

// NEW: Team Performance Analytics
model TeamPerformance {
  id             Int       @id @default(autoincrement())
  team_id        Int
  team           RepairTeam @relation(fields: [team_id], references: [id], onDelete: Cascade)
  
  date           DateTime  @db.Date
  complaints_completed Int @default(0)
  avg_completion_time Float?  // in hours
  quality_score  Float?    // 0-100
  
  @@unique([team_id, date])
}

// Enhanced Ward model with geographic data
model Ward {
  id             Int       @id @default(autoincrement())
  ward_number    String    @unique @db.VarChar(50)
  ward_name      String    @db.VarChar(255)
  ward_officer_name String?
  ward_officer_id String?  @db.Uuid                    // NEW: Link to User
  ward_officer   User?     @relation("WardOfficer", fields: [ward_officer_id], references: [id])
  
  // Geographic boundaries (simplified - use PostGIS for production)
  center_lat     Float?                                // NEW
  center_lng     Float?                                // NEW
  boundary_data  Json?                                 // NEW: GeoJSON polygon
  
  // Population/area data
  population     Int?                                  // NEW
  area_sqkm      Float?                                // NEW
  
  // Relations
  complaints     Complaint[]
  potholes       Potholes[]
  stats          WardStatistic[]
  primary_teams  RepairTeam[] @relation("PrimaryWard")  // NEW
  coverage_teams RepairTeam[] @relation("CoverageWards") // NEW
}

// Enhanced Complaint with SLA tracking
model Complaint {
  // ... existing fields ...
  
  // SLA and deadlines
  target_resolution_date DateTime?                     // NEW
  sla_breach     Boolean   @default(false)             // NEW
  actual_resolution_date DateTime?                     // NEW
  
  // Enhanced status tracking
  status_history Json?                                 // NEW: Array of status changes
  
  // Assignment history
  assignment_history Json?                             // NEW
  reassignment_count Int @default(0)                   // NEW
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

#### Backend Refactoring
1. **Migrate to TypeScript**
   - Convert all .js files to .ts
   - Add proper type definitions
   - Configure tsconfig.json

2. **Modular Architecture**
   - Create module structure (auth, users, complaints, teams, wards)
   - Implement service layer pattern
   - Add DTOs with Zod validation
   - Create error handling middleware

3. **Database Improvements**
   - Add new fields to schema (capacity, SLA, etc.)
   - Create migrations
   - Add database indexes
   - Optimize queries

4. **Authentication Upgrade**
   - Install and configure better-auth
   - Implement OAuth providers (Google, GitHub)
   - Add session management
   - Create auth middleware

#### Frontend Foundation
1. **API Client Layer**
   - Create axios instance with interceptors
   - Build API modules (complaints.api.ts, teams.api.ts)
   - Implement error handling
   - Add request/response transformers

2. **React Query Setup**
   - Configure QueryClient
   - Create custom hooks (useComplaints, useTeams)
   - Implement optimistic updates
   - Add cache invalidation strategy

3. **Authentication Integration**
   - Integrate better-auth client
   - Add protected route guards
   - Implement login/logout flows
   - Add OAuth buttons

### Phase 2: Core Features (Week 3-4)

#### Team Management System
1. **Backend APIs**
   - POST /api/teams - Create team
   - GET /api/teams - List teams
   - PUT /api/teams/:id - Update team
   - DELETE /api/teams/:id - Delete team
   - POST /api/teams/:id/members - Add member
   - GET /api/teams/:id/performance - Get analytics

2. **Frontend UI**
   - Teams list page
   - Team detail page
   - Team create/edit form
   - Member management interface
   - Team assignment component (drag-drop)

#### Improved Complaint Management
1. **Backend Enhancements**
   - Add filtering/sorting endpoints
   - Implement pagination
   - Add bulk operations
   - Create assignment logic with load balancing

2. **Frontend UX**
   - Complaint detail page with full history
   - Improved filters (multi-select, date ranges)
   - Bulk assignment interface
   - Map view with clustering

### Phase 3: Advanced Features (Week 5-6)

#### Analytics Dashboard
1. **Backend Analytics APIs**
   - GET /api/analytics/overview
   - GET /api/analytics/complaints
   - GET /api/analytics/teams
   - GET /api/analytics/wards
   - Implement data aggregation queries

2. **Frontend Charts**
   - Complaint trends (line chart)
   - Team performance (bar chart)
   - Geographic distribution (heat map)
   - Status breakdown (pie chart)
   - Response time metrics

#### Settings & Configuration
1. **Backend Settings APIs**
   - GET /api/settings
   - PUT /api/settings
   - Ward management endpoints
   - User management endpoints (admin)

2. **Frontend Settings Pages**
   - User profile settings
   - Notification preferences
   - System configuration (admin)
   - Ward management (admin)
   - User management (admin)

### Phase 4: Real-time & AI (Week 7-8)

#### Real-time Notifications
1. **WebSocket Implementation**
   - Add Socket.io to backend
   - Implement event emitters
   - Add notification channels

2. **Frontend Integration**
   - Connect to WebSocket
   - Display real-time notifications
   - Update UI on events

#### AI Model Integration
1. **FastAPI Wrapper**
   - Create Python FastAPI service
   - Load Jupyter model
   - Add endpoints for image validation
   - Add duplicate detection

2. **Backend Integration**
   - Call AI service on complaint creation
   - Store AI results in database
   - Add AI confidence scores

### Phase 5: Mobile & Polish (Week 9-10)

#### Field Officer Mobile App
1. **Flutter Features**
   - Assigned complaints view
   - Status update capability
   - Completion photo upload
   - Navigation integration

2. **Backend Support**
   - Field officer specific endpoints
   - Geolocation-based assignment

#### Testing & Optimization
1. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Playwright)

2. **Performance**
   - Add Redis caching
   - Optimize database queries
   - Add CDN for images
   - Implement lazy loading

---

## Detailed Module Specifications

### Module 1: Authentication (better-auth)

#### Installation
```bash
cd express-backend
npm install better-auth @better-auth/express
```

#### Configuration (src/config/auth.ts)
```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from './database';

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable later
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

### Module 2: Team Management

#### API Endpoints

**POST /api/teams** - Create Team
```typescript
// Request
{
  "team_name": "Road Repair Team A",
  "team_code": "RRT-A",
  "team_leader_id": "uuid",
  "max_capacity": 15,
  "primary_ward_id": 1,
  "coverage_ward_ids": [1, 2, 3],
  "contact_phone": "+1234567890",
  "contact_email": "team-a@civic.com"
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "team_name": "Road Repair Team A",
    "team_code": "RRT-A",
    "current_load": 0,
    "is_available": true,
    "created_at": "2026-02-02T10:00:00Z"
  }
}
```

**GET /api/teams** - List Teams
```typescript
// Query Params
?page=1&limit=20&status=active&ward_id=1

// Response
{
  "success": true,
  "data": {
    "teams": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 45
    }
  }
}
```

**PUT /api/teams/:id/assign** - Auto-assign Team
```typescript
// Request
{
  "complaint_id": 123,
  "ward_id": 1
}

// Logic
// 1. Get all teams covering ward
// 2. Filter by availability
// 3. Sort by current_load (ascending)
// 4. Select team with lowest load
// 5. Increment team's current_load
// 6. Update complaint assignment
```

### Module 3: Analytics Service

#### Aggregation Queries

**Complaint Trends**
```typescript
// Get daily complaint count for last 30 days
const trends = await db.$queryRaw`
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE severity = 'Critical') as critical_count,
    COUNT(*) FILTER (WHERE status = 'Completed') as completed_count
  FROM complaints
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC
`;
```

**Team Performance**
```typescript
// Get team completion metrics
const performance = await db.repairTeam.findMany({
  select: {
    id: true,
    team_name: true,
    assignedComplaints: {
      where: {
        status: 'Completed',
        updated_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        created_at: true,
        actual_resolution_date: true,
      },
    },
  },
});

// Calculate avg resolution time per team
const metrics = performance.map(team => ({
  team_id: team.id,
  team_name: team.team_name,
  completed_count: team.assignedComplaints.length,
  avg_resolution_time: calculateAvgTime(team.assignedComplaints),
}));
```

### Module 4: Notification System

#### WebSocket Events

```typescript
// Backend (src/services/notification.service.ts)
import { Server } from 'socket.io';

export class NotificationService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  // Emit to specific user
  notifyUser(userId: string, notification: Notification) {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  // Emit to team members
  notifyTeam(teamId: number, notification: Notification) {
    this.io.to(`team:${teamId}`).emit('notification', notification);
  }

  // Emit complaint status change
  complaintStatusChanged(complaintId: number, newStatus: string) {
    this.io.to(`complaint:${complaintId}`).emit('status_changed', {
      complaint_id: complaintId,
      new_status: newStatus,
      timestamp: new Date(),
    });
  }
}

// Usage in controller
await complaintService.updateStatus(complaintId, 'Assigned');
notificationService.complaintStatusChanged(complaintId, 'Assigned');
notificationService.notifyUser(assignedUserId, {
  type: 'new_assignment',
  title: 'New Complaint Assigned',
  body: `You have been assigned complaint #${complaintNumber}`,
});
```

---

## Single Source of Truth Pattern

### API Client (frontend/src/lib/api/complaints.api.ts)

```typescript
import { apiClient } from './client';
import type { Complaint, CreateComplaintDto, UpdateComplaintDto } from '@/types';

export const complaintsApi = {
  // Get all complaints with filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    severity?: string;
    ward_id?: number;
    team_id?: number;
  }) => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: {
        complaints: Complaint[];
        pagination: {
          current_page: number;
          total_pages: number;
          total_items: number;
        };
      };
    }>('/complaints', { params });
    return data.data;
  },

  // Get single complaint
  getById: async (id: number) => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: Complaint;
    }>(`/complaints/${id}`);
    return data.data;
  },

  // Create complaint
  create: async (complaint: CreateComplaintDto) => {
    const { data } = await apiClient.post<{
      success: boolean;
      data: Complaint;
    }>('/complaints', complaint);
    return data.data;
  },

  // Update complaint
  update: async (id: number, updates: UpdateComplaintDto) => {
    const { data } = await apiClient.put<{
      success: boolean;
      data: Complaint;
    }>(`/complaints/${id}`, updates);
    return data.data;
  },

  // Assign team
  assignTeam: async (id: number, teamId: number) => {
    const { data } = await apiClient.post<{
      success: boolean;
      data: Complaint;
    }>(`/complaints/${id}/assign`, { team_id: teamId });
    return data.data;
  },

  // Get nearby complaints
  getNearby: async (lat: number, lng: number, radius: number = 1000) => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: Complaint[];
    }>('/complaints/nearby', {
      params: { lat, lng, radius },
    });
    return data.data;
  },
};
```

### React Query Hook (frontend/src/lib/hooks/use-complaints.ts)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintsApi } from '@/lib/api/complaints.api';
import type { CreateComplaintDto, UpdateComplaintDto } from '@/types';

// Query keys
export const complaintKeys = {
  all: ['complaints'] as const,
  lists: () => [...complaintKeys.all, 'list'] as const,
  list: (filters: string) => [...complaintKeys.lists(), filters] as const,
  details: () => [...complaintKeys.all, 'detail'] as const,
  detail: (id: number) => [...complaintKeys.details(), id] as const,
  nearby: (lat: number, lng: number) => [...complaintKeys.all, 'nearby', lat, lng] as const,
};

// Hooks
export function useComplaints(params?: Parameters<typeof complaintsApi.getAll>[0]) {
  return useQuery({
    queryKey: complaintKeys.list(JSON.stringify(params || {})),
    queryFn: () => complaintsApi.getAll(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useComplaint(id: number) {
  return useQuery({
    queryKey: complaintKeys.detail(id),
    queryFn: () => complaintsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateComplaintDto) => complaintsApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
    },
  });
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateComplaintDto }) =>
      complaintsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
    },
  });
}

export function useAssignTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ complaintId, teamId }: { complaintId: number; teamId: number }) =>
      complaintsApi.assignTeam(complaintId, teamId),
    onMutate: async ({ complaintId, teamId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: complaintKeys.detail(complaintId) });

      // Snapshot previous value
      const previousComplaint = queryClient.getQueryData(complaintKeys.detail(complaintId));

      // Optimistically update
      queryClient.setQueryData(complaintKeys.detail(complaintId), (old: any) => ({
        ...old,
        assigned_team_id: teamId,
        status: 'Assigned',
      }));

      return { previousComplaint };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousComplaint) {
        queryClient.setQueryData(
          complaintKeys.detail(variables.complaintId),
          context.previousComplaint
        );
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.complaintId) });
    },
  });
}
```

### Usage in Component

```typescript
'use client';

import { useComplaints, useAssignTeam } from '@/lib/hooks/use-complaints';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';

export function ComplaintsPage() {
  const [filters, setFilters] = useState({ status: 'all', page: 1 });
  
  // SINGLE SOURCE OF TRUTH - Data comes from React Query
  const { data, isLoading, error } = useComplaints(filters);
  const assignTeam = useAssignTeam();

  const handleAssignTeam = (complaintId: number, teamId: number) => {
    assignTeam.mutate({ complaintId, teamId }, {
      onSuccess: () => {
        toast.success('Team assigned successfully');
      },
      onError: (error) => {
        toast.error('Failed to assign team');
      },
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <DataTable
        columns={columns}
        data={data.complaints}
        pagination={data.pagination}
        onPageChange={(page) => setFilters(f => ({ ...f, page }))}
        onAssignTeam={handleAssignTeam}
      />
    </div>
  );
}
```

---

## Next Steps

1. **Review this document** with your team
2. **Prioritize features** based on business needs
3. **Set up development environment** for all team members
4. **Create detailed tickets** in your project management tool
5. **Start Phase 1** with backend refactoring
6. **Establish code review process**
7. **Set up CI/CD pipeline**

---

## Summary

This comprehensive analysis has identified the current state of CivicConnect, documented all issues, and provided a detailed roadmap for transformation into a production-ready system. The key improvements include:

- ✅ Modular backend architecture following SOLID principles
- ✅ Professional authentication with OAuth support
- ✅ Complete team management system
- ✅ Analytics and reporting features
- ✅ Real-time notifications
- ✅ AI integration for image validation
- ✅ Single source of truth data pattern
- ✅ Comprehensive testing strategy
- ✅ Performance optimizations

**Estimated Timeline**: 10 weeks for full implementation  
**Team Size Recommended**: 2-3 developers + 1 designer  
**Priority**: Start with Phase 1 (Foundation) immediately

---

*Document prepared by: GitHub Copilot*  
*Date: February 2, 2026*  
*Version: 1.0*
