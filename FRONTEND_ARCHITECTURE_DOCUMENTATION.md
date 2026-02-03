# CivicConnect Frontend - Complete Architecture & Flow Documentation

**Framework:** Next.js 16.1.4 (React 19.2.3)  
**Platform:** Admin Web Portal  
**Users:** Admin, Ward Officers, Team Leads  
**Date:** February 2, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Data Flow Patterns](#data-flow-patterns)
4. [Navigation & Routing](#navigation--routing)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Authentication Flow](#authentication-flow)
9. [Key Features Deep Dive](#key-features-deep-dive)
10. [Performance Optimizations](#performance-optimizations)

---

## Architecture Overview

### Application Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                             │
│                    (Browser/Desktop)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Pages/      │  │  Components  │  │   Layouts    │         │
│  │  Routes      │  │  (UI)        │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  React Query │  │   Zustand    │  │   Context    │         │
│  │  (Server)    │  │   (Global)   │  │   (Local)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Axios      │  │  API Client  │  │   Hooks      │         │
│  │   Instance   │  │   Modules    │  │   (Custom)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND API                                   │
│                 (Express.js Server)                             │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND STACK                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Framework & Core                                       │   │
│  │  • Next.js 16.1.4 (App Router)                         │   │
│  │  • React 19.2.3                                        │   │
│  │  • TypeScript 5.9.3                                    │   │
│  │  • Turbopack (Bundler)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  UI & Styling                                           │   │
│  │  • TailwindCSS 4.1.5                                   │   │
│  │  • Radix UI (Components)                               │   │
│  │  • shadcn/ui (Component Library)                       │   │
│  │  • Lucide Icons                                        │   │
│  │  • class-variance-authority (CVA)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  State & Data Management                                │   │
│  │  • @tanstack/react-query 5.90.19                       │   │
│  │  • Zustand 5.0.10                                      │   │
│  │  • Axios 1.13.2                                        │   │
│  │  • React Hook Form 7.71.1                             │   │
│  │  • Zod 3.25.76                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Data Visualization & Maps                              │   │
│  │  • Recharts 2.15.4                                     │   │
│  │  • React Leaflet 5.0.0                                 │   │
│  │  • Leaflet.markercluster                               │   │
│  │  • @tanstack/react-table 8.21.3                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Utilities & Helpers                                    │   │
│  │  • date-fns 3.6.0                                      │   │
│  │  • clsx, tailwind-merge                                │   │
│  │  • sonner (Toast notifications)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

### Proposed Professional Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes (public)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   ├── page.tsx              # Dashboard home (redirect)
│   │   │   │
│   │   │   ├── complaints/           # Complaint management
│   │   │   │   ├── page.tsx          # List view
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Detail view
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create form
│   │   │   │   └── _components/
│   │   │   │       ├── complaint-list.tsx
│   │   │   │       ├── complaint-card.tsx
│   │   │   │       ├── complaint-form.tsx
│   │   │   │       ├── complaint-filters.tsx
│   │   │   │       ├── complaint-map.tsx
│   │   │   │       ├── team-assignment-dialog.tsx
│   │   │   │       └── status-update-dialog.tsx
│   │   │   │
│   │   │   ├── teams/                # Team management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Team detail
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── _components/
│   │   │   │       ├── team-list.tsx
│   │   │   │       ├── team-card.tsx
│   │   │   │       ├── team-form.tsx
│   │   │   │       ├── member-list.tsx
│   │   │   │       └── performance-chart.tsx
│   │   │   │
│   │   │   ├── wards/                # Ward management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── _components/
│   │   │   │
│   │   │   ├── analytics/            # Analytics & Reports
│   │   │   │   ├── page.tsx          # Overview
│   │   │   │   ├── complaints/
│   │   │   │   │   └── page.tsx      # Complaint analytics
│   │   │   │   ├── teams/
│   │   │   │   │   └── page.tsx      # Team performance
│   │   │   │   ├── geographic/
│   │   │   │   │   └── page.tsx      # Map-based analytics
│   │   │   │   └── _components/
│   │   │   │       ├── overview-cards.tsx
│   │   │   │       ├── trend-chart.tsx
│   │   │   │       ├── status-pie-chart.tsx
│   │   │   │       ├── team-performance-table.tsx
│   │   │   │       └── heat-map.tsx
│   │   │   │
│   │   │   ├── settings/             # Settings & Configuration
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── notifications/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── system/           # Admin only
│   │   │   │   │   └── page.tsx
│   │   │   │   └── _components/
│   │   │   │
│   │   │   └── users/                # User management (admin)
│   │   │       ├── page.tsx
│   │   │       ├── [id]/
│   │   │       │   └── page.tsx
│   │   │       └── _components/
│   │   │
│   │   ├── api/                      # API routes (if needed)
│   │   │   └── auth/
│   │   │       └── [...auth]/
│   │   │           └── route.ts
│   │   │
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── not-found.tsx
│   │
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # Base UI components (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── data-table/               # Advanced table component
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   ├── data-table-column-header.tsx
│   │   │   └── data-table-view-options.tsx
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── breadcrumbs.tsx
│   │   │
│   │   └── shared/                   # Shared domain components
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       ├── empty-state.tsx
│   │       ├── confirmation-dialog.tsx
│   │       └── status-badge.tsx
│   │
│   ├── lib/                          # Core library code
│   │   ├── api/                      # API Client (SINGLE SOURCE OF TRUTH)
│   │   │   ├── client.ts             # Axios instance with interceptors
│   │   │   ├── auth.api.ts           # Auth endpoints
│   │   │   ├── complaints.api.ts     # Complaint endpoints
│   │   │   ├── teams.api.ts          # Team endpoints
│   │   │   ├── wards.api.ts          # Ward endpoints
│   │   │   ├── analytics.api.ts      # Analytics endpoints
│   │   │   ├── notifications.api.ts  # Notification endpoints
│   │   │   └── users.api.ts          # User endpoints
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── use-auth.ts           # Auth hook
│   │   │   ├── use-complaints.ts     # Complaint React Query hooks
│   │   │   ├── use-teams.ts          # Team hooks
│   │   │   ├── use-wards.ts          # Ward hooks
│   │   │   ├── use-analytics.ts      # Analytics hooks
│   │   │   ├── use-notifications.ts  # Notification hooks
│   │   │   ├── use-debounce.ts       # Utility hooks
│   │   │   ├── use-media-query.ts
│   │   │   └── use-toast.ts
│   │   │
│   │   ├── store/                    # Zustand global state
│   │   │   ├── auth.store.ts         # Auth state
│   │   │   ├── ui.store.ts           # UI state (sidebar, modals)
│   │   │   ├── preferences.store.ts  # User preferences
│   │   │   └── notifications.store.ts
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── cn.ts                 # Class name merger
│   │   │   ├── format-date.ts        # Date formatting
│   │   │   ├── format-number.ts      # Number formatting
│   │   │   ├── validators.ts         # Validation helpers
│   │   │   └── constants.ts          # App constants
│   │   │
│   │   └── query-client.ts           # React Query configuration
│   │
│   ├── types/                        # TypeScript types
│   │   ├── api.types.ts              # API response types
│   │   ├── complaint.types.ts        # Complaint types
│   │   ├── team.types.ts             # Team types
│   │   ├── user.types.ts             # User types
│   │   ├── ward.types.ts             # Ward types
│   │   └── index.ts                  # Barrel exports
│   │
│   ├── config/                       # Configuration
│   │   ├── app.config.ts             # App configuration
│   │   ├── api.config.ts             # API endpoints
│   │   └── routes.config.ts          # Route definitions
│   │
│   └── middleware.ts                 # Next.js middleware (auth)
│
├── public/                           # Static assets
│   ├── logo.svg
│   ├── images/
│   └── fonts/
│
├── .env.local                        # Environment variables
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json
```

---

## Data Flow Patterns

### 1. Complete Data Flow (Create Complaint Example)

```
┌─────────────────────────────────────────────────────────────────┐
│          USER ACTION: Submit Complaint Form                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  COMPONENT: ComplaintForm (complaints/new/page.tsx)             │
├─────────────────────────────────────────────────────────────────┤
│  const form = useForm<ComplaintFormData>({                      │
│    resolver: zodResolver(complaintSchema),                      │
│    defaultValues: {...}                                         │
│  });                                                            │
│                                                                 │
│  const createMutation = useCreateComplaint();                  │
│                                                                 │
│  function onSubmit(data: ComplaintFormData) {                  │
│    createMutation.mutate(data);                                │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  VALIDATION: Zod Schema (Client-side)                           │
├─────────────────────────────────────────────────────────────────┤
│  complaintSchema.parse(data)                                    │
│  ✓ Title: 5-200 chars                                          │
│  ✓ Description: 10+ chars                                      │
│  ✓ Location: required                                          │
│  ✓ Coordinates: valid lat/lng                                  │
│  ✓ Images: max 5, valid URLs                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  CUSTOM HOOK: useCreateComplaint()                              │
│  (lib/hooks/use-complaints.ts)                                  │
├─────────────────────────────────────────────────────────────────┤
│  export function useCreateComplaint() {                         │
│    const queryClient = useQueryClient();                        │
│    const { toast } = useToast();                               │
│                                                                 │
│    return useMutation({                                         │
│      mutationFn: (data) => complaintsApi.create(data),         │
│      onSuccess: (newComplaint) => {                            │
│        // Invalidate cache                                     │
│        queryClient.invalidateQueries({                         │
│          queryKey: complaintKeys.lists()                       │
│        });                                                      │
│        // Show success toast                                   │
│        toast.success('Complaint created');                     │
│        // Navigate to detail page                             │
│        router.push(`/complaints/${newComplaint.id}`);         │
│      },                                                         │
│      onError: (error) => {                                     │
│        toast.error(error.message);                             │
│      }                                                          │
│    });                                                          │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  API CLIENT: complaintsApi.create()                             │
│  (lib/api/complaints.api.ts)                                    │
├─────────────────────────────────────────────────────────────────┤
│  export const complaintsApi = {                                │
│    create: async (data: CreateComplaintDto) => {              │
│      const response = await apiClient.post<ApiResponse>(       │
│        '/complaints',                                          │
│        data                                                     │
│      );                                                         │
│      return response.data.data;                                │
│    }                                                            │
│  };                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  AXIOS INSTANCE: apiClient (lib/api/client.ts)                  │
├─────────────────────────────────────────────────────────────────┤
│  Request Interceptor:                                           │
│  • Add Authorization header (Bearer token)                     │
│  • Add X-Request-ID for tracking                               │
│  • Add Content-Type: application/json                          │
│                                                                 │
│  axios.post('/api/complaints', data, {                         │
│    headers: {                                                   │
│      'Authorization': `Bearer ${token}`,                       │
│      'Content-Type': 'application/json'                        │
│    }                                                            │
│  })                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP POST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND API: POST /api/complaints                              │
│  (Express.js Server)                                            │
├─────────────────────────────────────────────────────────────────┤
│  • Authenticate user                                            │
│  • Validate input                                               │
│  • Process complaint                                            │
│  • Save to database                                             │
│  • Return complaint data                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │ Response
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  RESPONSE INTERCEPTOR: apiClient                                │
├─────────────────────────────────────────────────────────────────┤
│  • Extract data from response.data.data                         │
│  • Handle errors (401 → logout, 403 → unauthorized)           │
│  • Transform dates to Date objects                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  REACT QUERY CACHE: QueryClient                                 │
├─────────────────────────────────────────────────────────────────┤
│  • Store new complaint in cache                                │
│  • Invalidate complaints list cache                            │
│  • Trigger refetch of complaints list                          │
│  • Update UI automatically                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  UI UPDATE: Component Re-renders                                │
├─────────────────────────────────────────────────────────────────┤
│  • Success toast appears                                        │
│  • Navigate to complaint detail page                           │
│  • Complaint list updates with new item                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Optimistic Update Pattern (Upvote Example)

```
┌─────────────────────────────────────────────────────────────────┐
│  USER CLICKS: Upvote Button                                     │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  MUTATION: useUpvoteComplaint()                                 │
├─────────────────────────────────────────────────────────────────┤
│  const upvoteMutation = useMutation({                           │
│    mutationFn: complaintsApi.upvote,                           │
│                                                                 │
│    // BEFORE API call - Optimistic update                      │
│    onMutate: async (complaintId) => {                          │
│      // 1. Cancel outgoing queries                             │
│      await queryClient.cancelQueries(                          │
│        complaintKeys.detail(complaintId)                       │
│      );                                                         │
│                                                                 │
│      // 2. Snapshot current state                              │
│      const previous = queryClient.getQueryData(                │
│        complaintKeys.detail(complaintId)                       │
│      );                                                         │
│                                                                 │
│      // 3. Optimistically update cache                         │
│      queryClient.setQueryData(                                 │
│        complaintKeys.detail(complaintId),                      │
│        (old) => ({                                             │
│          ...old,                                               │
│          upvotes_count: old.upvotes_count + 1,                │
│          user_has_upvoted: true                                │
│        })                                                       │
│      );                                                         │
│                                                                 │
│      // 4. Return context for rollback                         │
│      return { previous };                                      │
│    },                                                           │
│                                                                 │
│    // IF ERROR - Rollback                                      │
│    onError: (err, complaintId, context) => {                  │
│      queryClient.setQueryData(                                 │
│        complaintKeys.detail(complaintId),                      │
│        context.previous                                        │
│      );                                                         │
│      toast.error('Failed to upvote');                         │
│    },                                                           │
│                                                                 │
│    // AFTER SUCCESS - Refetch for consistency                  │
│    onSettled: (_, __, complaintId) => {                       │
│      queryClient.invalidateQueries(                            │
│        complaintKeys.detail(complaintId)                       │
│      );                                                         │
│    }                                                            │
│  });                                                            │
└─────────────────────────────────────────────────────────────────┘

Timeline:
─────────────────────────────────────────────────────────────────
Time 0ms:   User clicks upvote
Time 1ms:   UI updates immediately (optimistic)
Time 50ms:  API request sent
Time 200ms: API responds with success
Time 201ms: Cache revalidated
Time 202ms: UI confirmed with real data

Benefits:
✓ Instant UI feedback (feels fast)
✓ Automatic rollback on error
✓ Eventual consistency with server
```

### 3. Real-time Update Flow (WebSocket)

```
┌─────────────────────────────────────────────────────────────────┐
│  WEBSOCKET CONNECTION ESTABLISHED                               │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  COMPONENT: useWebSocket() Hook                                 │
├─────────────────────────────────────────────────────────────────┤
│  useEffect(() => {                                              │
│    const socket = io(process.env.NEXT_PUBLIC_WS_URL, {         │
│      auth: { token: authToken }                                │
│    });                                                          │
│                                                                 │
│    // Listen for complaint status changes                      │
│    socket.on('complaint:status_changed', (data) => {           │
│      handleStatusChange(data);                                 │
│    });                                                          │
│                                                                 │
│    // Listen for new complaints                                │
│    socket.on('complaint:created', (data) => {                  │
│      handleNewComplaint(data);                                 │
│    });                                                          │
│                                                                 │
│    return () => socket.disconnect();                           │
│  }, []);                                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ Event: complaint:status_changed
┌─────────────────────────────────────────────────────────────────┐
│  HANDLER: handleStatusChange()                                  │
├─────────────────────────────────────────────────────────────────┤
│  function handleStatusChange(data) {                            │
│    const { complaint_id, new_status, timestamp } = data;       │
│                                                                 │
│    // 1. Update React Query cache                              │
│    queryClient.setQueryData(                                   │
│      complaintKeys.detail(complaint_id),                       │
│      (old) => ({ ...old, status: new_status })                │
│    );                                                           │
│                                                                 │
│    // 2. Show toast notification                               │
│    toast.info(`Complaint #${complaint_id} → ${new_status}`);  │
│                                                                 │
│    // 3. Play notification sound (optional)                    │
│    playNotificationSound();                                    │
│                                                                 │
│    // 4. Update notification badge                             │
│    notificationStore.increment();                              │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  UI UPDATES AUTOMATICALLY                                       │
├─────────────────────────────────────────────────────────────────┤
│  • Status badge changes color                                  │
│  • Table row updates                                           │
│  • Timeline shows new entry                                    │
│  • Toast notification appears                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Navigation & Routing

### Route Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION ROUTES                           │
└─────────────────────────────────────────────────────────────────┘

PUBLIC ROUTES (No authentication)
─────────────────────────────────
/                              → Landing page (redirect to /login)
/login                         → Login page
/register                      → Register page
/auth/callback                 → OAuth callback
/unauthorized                  → Unauthorized access page

PROTECTED ROUTES (Requires authentication)
───────────────────────────────────────────
/dashboard                     → Dashboard home (redirects to /dashboard/complaints)

/dashboard/complaints          → Complaints list
/dashboard/complaints/:id      → Complaint detail
/dashboard/complaints/new      → Create complaint

/dashboard/teams               → Teams list
/dashboard/teams/:id           → Team detail & performance
/dashboard/teams/new           → Create team

/dashboard/wards               → Wards list
/dashboard/wards/:id           → Ward detail & statistics
/dashboard/wards/new           → Create ward (admin)

/dashboard/analytics           → Analytics overview
/dashboard/analytics/complaints → Complaint analytics
/dashboard/analytics/teams     → Team performance analytics
/dashboard/analytics/geographic → Geographic heat map

/dashboard/settings            → User settings
/dashboard/settings/profile    → Profile settings
/dashboard/settings/notifications → Notification preferences
/dashboard/settings/system     → System settings (admin only)

/dashboard/users               → User management (admin only)
/dashboard/users/:id           → User detail (admin only)

ROLE-BASED ACCESS
─────────────────
Admin:          All routes
Ward Officer:   Complaints, Teams (view only), Analytics (their ward)
Team Lead:      Complaints (assigned), Team (their team)
```

### Navigation Component Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    APP LAYOUT STRUCTURE                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Root Layout (app/layout.tsx)                                │
│  • HTML shell                                                │
│  • Font loading                                              │
│  • Theme provider                                            │
│  • React Query provider                                      │
│  • Toast provider                                            │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐           ┌───────────────────────┐
│  Auth Layout  │           │  Dashboard Layout     │
│  (auth)       │           │  (dashboard)          │
└───────────────┘           └───────┬───────────────┘
        │                           │
        ├── /login                  ├── Header
        ├── /register               │   ├── Search
        └── /auth/callback          │   ├── Notifications
                                    │   └── User menu
                                    │
                                    ├── Sidebar
                                    │   ├── Logo
                                    │   ├── Navigation
                                    │   │   ├── Complaints
                                    │   │   ├── Teams
                                    │   │   ├── Wards
                                    │   │   ├── Analytics
                                    │   │   └── Settings
                                    │   └── User profile
                                    │
                                    └── Main Content
                                        └── Page content
```

### Sidebar Navigation Configuration

```typescript
// src/navigation/sidebar-items.ts

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Management",
    items: [
      {
        title: "Complaints",
        url: "/dashboard/complaints",
        icon: AlertCircle,
        badge: "12", // Dynamic count
        subItems: [
          {
            title: "All Complaints",
            url: "/dashboard/complaints",
          },
          {
            title: "Pending Review",
            url: "/dashboard/complaints?status=pending",
          },
          {
            title: "Assigned",
            url: "/dashboard/complaints?status=assigned",
          },
          {
            title: "Completed",
            url: "/dashboard/complaints?status=completed",
          }
        ]
      },
      {
        title: "Teams",
        url: "/dashboard/teams",
        icon: Users,
      },
      {
        title: "Wards",
        url: "/dashboard/wards",
        icon: MapPin,
      }
    ]
  },
  {
    id: 2,
    label: "Analytics & Reports",
    items: [
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart,
        subItems: [
          {
            title: "Overview",
            url: "/dashboard/analytics",
          },
          {
            title: "Complaints",
            url: "/dashboard/analytics/complaints",
          },
          {
            title: "Teams",
            url: "/dashboard/analytics/teams",
          },
          {
            title: "Geographic",
            url: "/dashboard/analytics/geographic",
          }
        ]
      }
    ]
  },
  {
    id: 3,
    label: "Administration",
    items: [
      {
        title: "Users",
        url: "/dashboard/users",
        icon: UserCog,
        requiredRole: "admin", // Only show to admins
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      }
    ]
  }
];

// Dynamic badge counts
export function useSidebarBadges() {
  const { data: counts } = useQuery({
    queryKey: ['sidebar-counts'],
    queryFn: async () => {
      const [pending, assigned] = await Promise.all([
        complaintsApi.count({ status: 'pending' }),
        complaintsApi.count({ status: 'assigned' })
      ]);
      return { pending, assigned };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return counts;
}
```

---

## Component Architecture

### Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│             COMPONENT ARCHITECTURE PATTERNS                     │
└─────────────────────────────────────────────────────────────────┘

SERVER COMPONENTS (Default in Next.js 13+)
───────────────────────────────────────────
• Fetch data on server
• No JavaScript sent to client
• Better SEO
• Faster initial load

Example: Complaints List Page
┌──────────────────────────────────────────┐
│  page.tsx (Server Component)             │
│  • Fetch initial data                    │
│  • Set up metadata                       │
│  • Pass props to client components       │
└────────────┬─────────────────────────────┘
             │
             ├─→ <ComplaintFilters /> (Client)
             ├─→ <ComplaintList /> (Client)
             └─→ <ComplaintMap /> (Client)

CLIENT COMPONENTS ("use client")
─────────────────────────────────
• Interactive UI
• State management
• Event handlers
• Hooks (useEffect, useState, etc.)

Example: Complaint Card
┌──────────────────────────────────────────┐
│  complaint-card.tsx ("use client")       │
│  • Handle click events                   │
│  • Show/hide details                     │
│  • Manage local state                    │
└──────────────────────────────────────────┘
```

### Complaint List Component Example

```typescript
// app/(dashboard)/complaints/page.tsx (Server Component)
export default async function ComplaintsPage({
  searchParams
}: {
  searchParams: { page?: string; status?: string }
}) {
  // Server-side data fetching
  const page = Number(searchParams.page) || 1;
  const status = searchParams.status || 'all';

  // Initial data for hydration
  const initialData = await getComplaints({ page, status });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Complaints</h1>
        <CreateComplaintButton />
      </div>

      {/* Client component with initial data */}
      <ComplaintsContent 
        initialData={initialData}
        initialFilters={{ page, status }}
      />
    </div>
  );
}

// _components/complaints-content.tsx (Client Component)
'use client';

export function ComplaintsContent({ 
  initialData,
  initialFilters 
}: ComplaintsContentProps) {
  const [filters, setFilters] = useState(initialFilters);

  // React Query with initial data (no loading state on mount)
  const { data, isLoading } = useComplaints(filters, {
    initialData
  });

  return (
    <>
      <ComplaintFilters 
        filters={filters}
        onChange={setFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* List View - 2/3 width */}
        <div className="lg:col-span-2">
          <ComplaintList 
            complaints={data.complaints}
            isLoading={isLoading}
            pagination={data.pagination}
            onPageChange={(page) => setFilters(f => ({ ...f, page }))}
          />
        </div>

        {/* Map View - 1/3 width */}
        <div className="lg:col-span-1">
          <ComplaintMap complaints={data.complaints} />
        </div>
      </div>
    </>
  );
}

// _components/complaint-list.tsx
export function ComplaintList({ 
  complaints,
  isLoading,
  pagination,
  onPageChange 
}: ComplaintListProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (complaints.length === 0) {
    return <EmptyState message="No complaints found" />;
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <ComplaintCard key={complaint.id} complaint={complaint} />
      ))}

      <Pagination 
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

// _components/complaint-card.tsx
export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const assignTeamMutation = useAssignTeam();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Image thumbnail */}
          {complaint.images[0] && (
            <Image 
              src={complaint.images[0].image_url}
              alt={complaint.title}
              width={64}
              height={64}
              className="rounded-md object-cover"
            />
          )}

          <div>
            <CardTitle className="text-lg">
              {complaint.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getSeverityVariant(complaint.severity)}>
                {complaint.severity}
              </Badge>
              <Badge variant={getStatusVariant(complaint.status)}>
                {complaint.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {complaint.complaint_number}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>Assign Team</DropdownMenuItem>
            <DropdownMenuItem>Update Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Location:</span>
            <p className="font-medium">{complaint.location_address}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Reported:</span>
            <p className="font-medium">
              {formatDistanceToNow(new Date(complaint.created_at))} ago
            </p>
          </div>
          {complaint.assignedTeam && (
            <div>
              <span className="text-muted-foreground">Assigned to:</span>
              <p className="font-medium">{complaint.assignedTeam.team_name}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Upvotes:</span>
            <p className="font-medium">{complaint.upvotes_count}</p>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm">{complaint.description}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/complaints/${complaint.id}`}>
            View Full Details
          </Link>
        </Button>

        {complaint.status === 'Verified' && (
          <AssignTeamButton 
            complaintId={complaint.id}
            onAssign={(teamId) => assignTeamMutation.mutate({ 
              complaintId: complaint.id,
              teamId 
            })}
          />
        )}
      </CardFooter>
    </Card>
  );
}
```

---

## State Management

### Three-Layer State Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT LAYERS                      │
└─────────────────────────────────────────────────────────────────┘

LAYER 1: SERVER STATE (React Query)
────────────────────────────────────
Purpose: Data from backend API
Scope:   Global (across app)
Tools:   @tanstack/react-query

Examples:
• Complaints list
• Team data
• User profile
• Analytics data

Benefits:
✓ Automatic caching
✓ Background refetching
✓ Optimistic updates
✓ Deduplication
✓ Pagination support

LAYER 2: GLOBAL CLIENT STATE (Zustand)
───────────────────────────────────────
Purpose: App-wide UI state
Scope:   Global (persisted or not)
Tools:   Zustand

Examples:
• Auth state (user, token)
• UI preferences (theme, sidebar collapsed)
• Notifications unread count
• Modal open/close state

Benefits:
✓ Simple API
✓ No boilerplate
✓ TypeScript support
✓ Middleware (persist, devtools)

LAYER 3: LOCAL COMPONENT STATE (useState)
──────────────────────────────────────────
Purpose: Component-specific state
Scope:   Single component
Tools:   React useState, useReducer

Examples:
• Form input values
• Accordion expanded state
• Dropdown open state
• Local filters

Benefits:
✓ Simple
✓ No setup
✓ Automatic cleanup
```

### React Query Setup

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,    // 30 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// app/layout.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Zustand Store Example

```typescript
// lib/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'field_officer' | 'citizen';
  profile_image_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({
        user,
        token,
        isAuthenticated: true
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false
      }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      }))
    }),
    {
      name: 'civic-connect-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Usage in component
function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header>
      <span>Welcome, {user?.full_name}</span>
      <Button onClick={logout}>Logout</Button>
    </header>
  );
}
```

---

## API Integration

### Axios Client Configuration

```typescript
// lib/api/client.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/auth.store';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = crypto.randomUUID();

    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.url} - ${response.status}`);
    return response;
  },
  (error: AxiosError<{ error: { code: string; message: string }}>) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.error?.code;
    const message = error.response?.data?.error?.message;

    console.error(`❌ ${error.config?.url} - ${status}`, message);

    // Handle specific error cases
    if (status === 401) {
      // Unauthorized - logout user
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    if (status === 403) {
      // Forbidden - redirect to unauthorized page
      window.location.href = '/unauthorized';
    }

    if (status === 429) {
      // Rate limit exceeded
      toast.error('Too many requests. Please slow down.');
    }

    return Promise.reject(error);
  }
);
```

### API Module Pattern

```typescript
// lib/api/complaints.api.ts
import { apiClient } from './client';
import type { 
  Complaint, 
  CreateComplaintDto, 
  UpdateComplaintDto,
  ComplaintFilters,
  PaginatedResponse 
} from '@/types';

export const complaintsApi = {
  // GET /api/complaints
  getAll: async (filters: ComplaintFilters = {}) => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: PaginatedResponse<Complaint>;
    }>('/complaints', { params: filters });
    return data.data;
  },

  // GET /api/complaints/:id
  getById: async (id: number) => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: Complaint;
    }>(`/complaints/${id}`);
    return data.data;
  },

  // POST /api/complaints
  create: async (complaint: CreateComplaintDto) => {
    const { data } = await apiClient.post<{
      success: boolean;
      data: Complaint;
    }>('/complaints', complaint);
    return data.data;
  },

  // PUT /api/complaints/:id
  update: async (id: number, updates: UpdateComplaintDto) => {
    const { data } = await apiClient.put<{
      success: boolean;
      data: Complaint;
    }>(`/complaints/${id}`, updates);
    return data.data;
  },

  // DELETE /api/complaints/:id
  delete: async (id: number) => {
    const { data } = await apiClient.delete<{
      success: boolean;
    }>(`/complaints/${id}`);
    return data;
  },

  // POST /api/complaints/:id/assign
  assignTeam: async (id: number, teamId: number) => {
    const { data } = await apiClient.post<{
      success: boolean;
      data: Complaint;
    }>(`/complaints/${id}/assign`, { team_id: teamId });
    return data.data;
  },

  // PUT /api/complaints/:id/status
  updateStatus: async (id: number, status: ComplaintStatus) => {
    const { data } = await apiClient.put<{
      success: boolean;
      data: Complaint;
    }>(`/complaints/${id}/status`, { status });
    return data.data;
  },

  // POST /api/complaints/:id/upvote
  upvote: async (id: number) => {
    const { data } = await apiClient.post<{
      success: boolean;
    }>(`/complaints/${id}/upvote`);
    return data;
  },

  // DELETE /api/complaints/:id/upvote
  removeUpvote: async (id: number) => {
    const { data } = await apiClient.delete<{
      success: boolean;
    }>(`/complaints/${id}/upvote`);
    return data;
  },

  // GET /api/complaints/nearby
  getNearby: async (lat: number, lng: number, radius: number = 1000) => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: Complaint[];
    }>('/complaints/nearby', {
      params: { lat, lng, radius }
    });
    return data.data;
  },
};
```

---

## Authentication Flow

### Login Flow Diagram

```
┌──────────┐                                         ┌──────────┐
│  User    │                                         │  Server  │
└────┬─────┘                                         └────┬─────┘
     │                                                    │
     │  1. Navigate to /login                            │
     ├──────────────────────────────────────────────────►│
     │                                                    │
     │  2. Render LoginPage                              │
     │◄───────────────────────────────────────────────────┤
     │                                                    │
     │  3. Enter email + password                        │
     │     Click "Login"                                 │
     │                                                    │
     │  4. POST /api/auth/login                          │
     │     { email, password }                           │
     ├──────────────────────────────────────────────────►│
     │                                                    │
     │                              5. Validate credentials
     │                              6. Generate tokens
     │                                                    │
     │  7. Response { user, accessToken, refreshToken }  │
     │◄───────────────────────────────────────────────────┤
     │                                                    │
     │  8. Store in Zustand + localStorage               │
     │     useAuthStore.setAuth(user, token)             │
     │                                                    │
     │  9. Redirect to /dashboard                        │
     ├──────────────────────────────────────────────────►│
     │                                                    │
     │  10. Render Dashboard (authenticated)             │
     │◄───────────────────────────────────────────────────┤
     │                                                    │
```

### Protected Route Middleware

```typescript
// middleware.ts (Next.js middleware)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/auth/callback'];
const protectedPaths = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookie or header
  const token = request.cookies.get('auth_token')?.value;
  
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Redirect to login if accessing protected route without token
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing public route with token
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Key Features Deep Dive

### Feature 1: Team Assignment with Drag & Drop

```typescript
// _components/team-assignment-board.tsx
'use client';

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useAssignTeam } from '@/lib/hooks/use-complaints';

export function TeamAssignmentBoard({ complaints, teams }: Props) {
  const assignTeam = useAssignTeam();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const complaintId = Number(active.id);
    const teamId = Number(over.id);

    assignTeam.mutate({ complaintId, teamId });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Unassigned complaints */}
        <DroppableArea id="unassigned" title="Unassigned">
          {complaints
            .filter(c => !c.assigned_to_team_id)
            .map(complaint => (
              <DraggableComplaint key={complaint.id} complaint={complaint} />
            ))}
        </DroppableArea>

        {/* Team columns */}
        {teams.map(team => (
          <DroppableArea 
            key={team.id} 
            id={String(team.id)}
            title={team.team_name}
            capacity={team.max_capacity}
            currentLoad={team.current_load}
          >
            {complaints
              .filter(c => c.assigned_to_team_id === team.id)
              .map(complaint => (
                <DraggableComplaint key={complaint.id} complaint={complaint} />
              ))}
          </DroppableArea>
        ))}
      </div>
    </DndContext>
  );
}
```

### Feature 2: Real-time Analytics Dashboard

```typescript
// app/(dashboard)/analytics/page.tsx
'use client';

export default function AnalyticsPage() {
  const { data: overview } = useAnalyticsOverview();
  const { data: trends } = useComplaintTrends({ days: 30 });
  const { data: teamPerformance } = useTeamPerformance();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Complaints"
          value={overview?.total_complaints || 0}
          change={overview?.change_percent || 0}
          icon={AlertCircle}
        />
        <KPICard
          title="Resolved"
          value={overview?.resolved_complaints || 0}
          change={overview?.resolution_rate_change || 0}
          icon={CheckCircle}
        />
        <KPICard
          title="Avg Resolution Time"
          value={`${overview?.avg_resolution_time_hours || 0}h`}
          change={overview?.time_change || 0}
          icon={Clock}
        />
        <KPICard
          title="Active Teams"
          value={overview?.active_teams || 0}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={trends}
              xKey="date"
              yKeys={['new', 'resolved', 'pending']}
            />
          </CardContent>
        </Card>

        {/* Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={overview?.by_status} />
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={teamPerformanceColumns}
            data={teamPerformance || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Performance Optimizations

### 1. Code Splitting & Lazy Loading

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const ComplaintMap = dynamic(
  () => import('@/components/complaint-map'),
  { 
    loading: () => <MapSkeleton />,
    ssr: false // Map doesn't work on server
  }
);

const AnalyticsCharts = dynamic(
  () => import('@/components/analytics-charts'),
  {
    loading: () => <ChartsSkeleton />
  }
);
```

### 2. Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={complaint.images[0].image_url}
  alt={complaint.title}
  width={300}
  height={200}
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
  className="rounded-lg"
  priority={false} // Lazy load
/>
```

### 3. React Query Optimizations

```typescript
// Prefetch on hover
function ComplaintCard({ complaint }: Props) {
  const queryClient = useQueryClient();

  const prefetchDetail = () => {
    queryClient.prefetchQuery({
      queryKey: complaintKeys.detail(complaint.id),
      queryFn: () => complaintsApi.getById(complaint.id),
    });
  };

  return (
    <Link
      href={`/complaints/${complaint.id}`}
      onMouseEnter={prefetchDetail}
      onFocus={prefetchDetail}
    >
      {/* Card content */}
    </Link>
  );
}
```

### 4. Infinite Scroll

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

function InfiniteComplaintList() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['complaints-infinite'],
    queryFn: ({ pageParam = 1 }) =>
      complaintsApi.getAll({ page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.current_page < lastPage.pagination.total_pages
        ? lastPage.pagination.current_page + 1
        : undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div>
      {data?.pages.map((page) =>
        page.complaints.map((complaint) => (
          <ComplaintCard key={complaint.id} complaint={complaint} />
        ))
      )}
      
      {/* Trigger element */}
      <div ref={ref} className="h-10" />
      
      {isFetchingNextPage && <LoadingSpinner />}
    </div>
  );
}
```

---

## Summary

This documentation provides complete architecture and implementation patterns for the CivicConnect frontend:

✅ **Modern Next.js Architecture** - App Router, Server Components, RSC  
✅ **Professional Folder Structure** - Organized by features  
✅ **Data Flow Patterns** - React Query + Zustand + Local State  
✅ **API Integration** - Axios with interceptors, type-safe modules  
✅ **Authentication** - Protected routes, role-based access  
✅ **Component Patterns** - Server/Client split, composition  
✅ **State Management** - Three-layer architecture  
✅ **Performance** - Code splitting, lazy loading, optimistic updates  
✅ **Real-time** - WebSocket integration  
✅ **Type Safety** - Full TypeScript coverage  

---

*Last Updated: February 2, 2026*  
*Version: 1.0 (Proposed Architecture)*
