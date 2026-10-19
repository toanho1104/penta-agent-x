export const nextjsStructure = `### Standard Directory Structure (Next.js App Router)
\`\`\`text
src/
├── app/                    # App Router (Pages, Layouts, Route Handlers)
│   ├── (auth)/             # Route group for authentication (login, register...)
│   ├── (dashboard)/        # Route group for main application views
│   ├── api/                # API Route Handlers (if applicable)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # Base reusable UI primitives (Button, Input, Modal...)
│   └── shared/             # Shared layout/domain components (Header, Sidebar...)
├── features/               # Feature-based domain modules
│   └── <feature-name>/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types.ts
├── hooks/                  # Global custom React hooks
├── lib/                    # Third-party client configs (HTTP client, utilities...)
├── services/               # Shared API service modules
├── store/                  # Global state stores (Zustand / Redux)
└── types/                  # Global TypeScript definitions
\`\`\``;
