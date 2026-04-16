# RefearnApp Project Instructions

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Components:** Radix UI / shadcn/ui
- **Icons:** Lucide React
- **State Management:** TanStack Query (React Query)
- **Form Handling:** React Hook Form + Zod validation

## Business Logic: Tiered Access & Licensing
This project uses a tiered access model (FREE, PRO, ULTIMATE).
- **SaaS Mode:** Managed via `plan.plan`.
- **Logic Source:** `D:/code-files/apps/refearnapp/apps/dashboard/src/components/OrganizationDashboardSidebar.tsx` contains the primary `checkLockedStatus` logic.
- **Self-Hosted Mode:** Managed via `license.isPro` or `license.isUltimate`.
- **Constraint:** Never suggest bypassing the `checkLockedStatus` or plan validation logic. All new features must check for the appropriate tier before rendering.

## Coding Standards
- **Client Components:** Use `"use client"` only when necessary (interactive elements).
- **Imports:** Use absolute paths with the `@/` alias.
- **UI Consistency:** 
  - Use the `AppDialog` component for all modals.
  - Use `useAppMutation` and `useAppQuery` wrappers for data fetching.
  - Maintain the "Affiliate" vs "Organization" context toggle found in headers/sidebars.

## Sidebar & Navigation
- Navigation groups are defined in `OrganizationDashboardSidebar.tsx`.
- New items should be added to the `navigationGroups` useMemo hook.
- Always include a `locked` state check using `checkLockedStatus`.

## File Naming
- Components: PascalCase (e.g., `TeamsTable.tsx`)
- Hooks: camelCase (e.g., `useAccess.ts`)
- Server Actions: Create an `action.ts` file within the feature directory.

## Formatting
- Use 2-space indentation.
- Ensure all diffs follow the unified format with absolute paths.