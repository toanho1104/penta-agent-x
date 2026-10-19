export const reactjsStructure = `### Standard Directory Structure (React.js SPA - Vite)
\`\`\`text
src/
├── assets/                 # Static images, fonts, icons
├── components/
│   ├── ui/                 # Base reusable UI components
│   └── layout/             # MainLayout, AuthLayout, Navbar...
├── features/               # Feature-sliced domain modules
│   └── <feature-name>/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       └── index.ts
├── hooks/                  # Global custom hooks
├── lib/                    # Axios/Fetch instance, helpers
├── pages/                  # Route-level page components
├── routes/                 # React Router / TanStack Router configuration
├── store/                  # Global state management (Zustand / Context)
└── types/                  # Shared TypeScript interfaces
\`\`\``;
