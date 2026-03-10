# Attendance & Salary Manager

## Current State
- Full app with 6 tabs: Contracts, Attendance, Advances, Payments, Labours, Settled
- Bottom tab navigation
- Indigo/violet color scheme
- ContractsTab has a Delete button on active contracts
- SettledTab has Delete and Unsettle buttons
- No authentication / login page

## Requested Changes (Diff)

### Add
- Login page with two fixed credentials:
  - Admin: username `admin`, password `admin123` — full read/write access
  - Guest: username `guest`, password `guest123` — view-only (no add/edit/delete/settle actions)
- AuthContext to hold role (`admin` | `guest` | null) and expose login/logout
- Logout button in app header

### Modify
- ContractsTab: Remove the Delete button from active contract cards (delete only allowed in Settled tab)
- Color scheme: Change from indigo/violet to Bright Orange (#F97316 range) + Deep Red (#DC2626 range) + White. Update index.css OKLCH tokens accordingly
- Login page should be aesthetic, modern, with the new orange/red/white brand colors
- All write actions (add, edit, settle, unsettle, delete) must be hidden or disabled when user role is `guest`

### Remove
- Delete button from ContractsTab (active contracts section)

## Implementation Plan
1. Create `src/frontend/src/context/AuthContext.tsx` with AuthProvider, useAuth hook, fixed credentials, role type
2. Create `src/frontend/src/components/LoginPage.tsx` — aesthetic login form
3. Update `src/frontend/src/App.tsx` — wrap with AuthProvider, show LoginPage if not authenticated, add logout in header, pass role down or use context
4. Update `src/frontend/src/components/ContractsTab.tsx` — remove Delete button; hide Add/Edit/Settle buttons for guest
5. Update `src/frontend/src/components/SettledTab.tsx` — hide Delete/Unsettle buttons for guest
6. Update `src/frontend/src/components/AttendanceTab.tsx`, `AdvancesTab.tsx`, `PaymentsTab.tsx`, `LaboursTab.tsx` — hide mutating actions for guest
7. Update `src/frontend/index.css` — replace OKLCH tokens with orange/red/white palette
