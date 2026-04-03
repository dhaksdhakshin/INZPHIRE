# INZPHIRE Dashboard Clone

This project recreates the INZPHIRE dashboard UX using the existing Pencil frames as the implementation reference.

## Routes

- `/app/home`: home dashboard with search, quick actions, feature cards, onboarding content, and template gallery
- `/app/my-presentations`: personal library with empty state, table view, create actions, duplication, and share simulation
- `/app/shared-with-me`: shared inbox with empty state and saved-copy flow
- `/app/workspace-presentations`
- `/app/shared-templates`
- `/app/templates`
- `/app/integrations`
- `/app/academy`
- `/app/help`
- `/app/trash`

## Structure

```text
src/
  app/
    App.tsx
    data.ts
    dashboard-context.tsx
    router.tsx
    types.ts
  components/dashboard/
    AppShell.tsx
    Sidebar.tsx
    TopBanner.tsx
    AccountMenu.tsx
    GlobalSearch.tsx
    DiscoverySections.tsx
    PresentationTable.tsx
    EmptyState.tsx
    ToastViewport.tsx
    PageSearch.tsx
    Icon.tsx
  pages/
    HomePage.tsx
    MyPresentationsPage.tsx
    SharedWithMePage.tsx
    PlaceholderPage.tsx
  styles/
    index.css
```

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
