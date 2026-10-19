export const STRUCTURE_TEMPLATES: Record<string, string> = {
  nextjs: `### Standard Directory Structure (Next.js App Router)
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
\`\`\``,

  reactjs: `### Standard Directory Structure (React.js SPA - Vite)
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
\`\`\``,

  nestjs: `### Standard Directory Structure (Backend - NestJS Modular Architecture)
\`\`\`text
src/
├── common/                 # Shared Guards, Interceptors, Filters, Decorators, Pipes
├── config/                 # Environment & configuration modules (Env, DB, Auth)
├── database/               # Prisma / TypeORM migrations, seeds, database module
├── modules/                # Domain feature modules
│   └── <module-name>/
│       ├── dto/            # Request/Response DTOs (class-validator)
│       ├── entities/       # Database Entities / Models
│       ├── <name>.controller.ts
│       ├── <name>.service.ts
│       └── <name>.module.ts
├── shared/                 # Shared infrastructure services (Mail, Storage, Queue...)
├── app.module.ts
└── main.ts
\`\`\``,

  elysiajs: `### Standard Directory Structure (Backend - ElysiaJS + Bun)
\`\`\`text
src/
├── config/                 # Environment validation & system config
├── db/                     # Database client (Drizzle / Prisma) & schema
├── middlewares/            # Auth, Error handler, Logger plugins
├── modules/                # Feature modules (each module as an Elysia instance)
│   └── <module-name>/
│       ├── index.ts        # Routes & Controller definitions with TypeBox (t.Object)
│       ├── model.ts        # DTO & Validation Schemas
│       └── service.ts      # Pure business logic decoupled from HTTP context
├── utils/                  # Shared helper functions
└── index.ts                # Application entrypoint composing modules
\`\`\``,

  'react-native': `### Standard Directory Structure (Mobile - React Native / Expo)
\`\`\`text
src/
├── app/ (or navigation/)   # Expo Router or React Navigation stacks/tabs
├── assets/                 # Fonts, images, icons
├── components/
│   ├── ui/                 # Core UI primitives (AppButton, AppText, AppInput, ScreenWrapper...)
│   └── common/             # Shared composite components
├── features/               # Feature-based domain modules
│   └── <feature-name>/
│       ├── components/
│       ├── hooks/
│       ├── screens/
│       └── services/
├── hooks/                  # Global hooks (useKeyboard, useAppTheme...)
├── services/               # API client, Local storage (MMKV / AsyncStorage)
├── store/                  # Global state management (Zustand / Redux)
├── theme/                  # Colors, Spacing, Typography design tokens
└── utils/                  # Formatters, Validators, Platform helpers
\`\`\``,

  flutter: `### Standard Directory Structure (Mobile - Flutter Feature-First Clean Architecture)
\`\`\`text
lib/
├── core/                   # Application-wide shared core
│   ├── constants/          # AppColors, AppSpacing, ApiEndpoints
│   ├── error/              # Failures, Exceptions
│   ├── network/            # Dio client, Interceptors
│   ├── router/             # GoRouter configuration
│   ├── theme/              # ThemeData
│   └── widgets/            # Shared UI Widgets (AppButton, AppTextField...)
├── features/               # Independent feature modules
│   └── <feature_name>/
│       ├── data/           # Models (fromJson/toJson), DataSources, Repository implementations
│       ├── domain/         # Entities, UseCases, Repository interfaces
│       └── presentation/   # Pages/Screens, Widgets, State (Bloc/Riverpod/Cubit)
└── main.dart
\`\`\``,

  none: `### Project Directory Structure
*(Currently blank — You can define your custom folder tree here or run \`@arch\` / \`@onboard\` to generate it).*`,
};

export function generateInitialProjectMemory(options: {
  projectMode: 'new' | 'existing';
  category?: string;
  feStack?: string;
  beStack?: string;
  mobileStack?: string;
  installedSkills: string[];
}): string {
  const { projectMode, category, feStack, beStack, mobileStack, installedSkills } =
    options;

  let structureSection = '';
  const stacks: string[] = [];

  if (projectMode === 'existing') {
    structureSection = `> ⚠️ **Existing Project (Brownfield):** An automated structural snapshot has been saved to \`.ai-workspace/scan-report.md\`.
> Run \`@onboard\` (or \`/onboard\`) in your IDE/CLI chat so the **Architect Agent** can analyze \`scan-report.md\` and populate the exact directory tree here.`;
  } else {
    if (category === 'fe' && feStack && feStack !== 'none') {
      stacks.push(`Frontend: ${feStack}`);
      structureSection = STRUCTURE_TEMPLATES[feStack] || STRUCTURE_TEMPLATES.none;
    } else if (category === 'be' && beStack && beStack !== 'none') {
      stacks.push(`Backend: ${beStack}`);
      structureSection = STRUCTURE_TEMPLATES[beStack] || STRUCTURE_TEMPLATES.none;
    } else if (category === 'mobile' && mobileStack && mobileStack !== 'none') {
      stacks.push(`Mobile: ${mobileStack}`);
      structureSection =
        STRUCTURE_TEMPLATES[mobileStack] || STRUCTURE_TEMPLATES.none;
    } else if (category === 'fullstack') {
      if (feStack && feStack !== 'none') stacks.push(`Frontend: ${feStack}`);
      if (beStack && beStack !== 'none') stacks.push(`Backend: ${beStack}`);
      const feTree =
        feStack && feStack !== 'none'
          ? `#### 1. Frontend (\`apps/web\` or \`frontend/\`)\n${STRUCTURE_TEMPLATES[feStack] || ''}`
          : '';
      const beTree =
        beStack && beStack !== 'none'
          ? `#### 2. Backend (\`apps/api\` or \`backend/\`)\n${STRUCTURE_TEMPLATES[beStack] || ''}`
          : '';
      structureSection =
        [feTree, beTree].filter(Boolean).join('\n\n') || STRUCTURE_TEMPLATES.none;
    } else {
      structureSection = STRUCTURE_TEMPLATES.none;
    }
  }

  return `# PROJECT MEMORY (Single Source of Truth)

> **Rules for All AI Agents:**
> 1. Always read this file first to understand the project architecture, reusable shared components/utilities, and feature index.
> 2. Keep this file **concise (< 300 lines)**. Detailed feature specifications belong in \`.ai-workspace/features/<feature-name>.md\`.

---

## 1. Tech Stack & Coding Conventions
- **Project Mode:** ${projectMode === 'existing' ? 'Existing Project (Brownfield)' : `New Project (${category?.toUpperCase() || 'Custom'})`}
- **Primary Stack:** ${stacks.length > 0 ? stacks.join(' + ') : '(To be updated after onboarding or stack selection)'}
- **Active Tech Skills for Dev/QA Agent:** ${installedSkills.length > 0 ? installedSkills.map((s) => `\`${s}\``).join(', ') : '*(No custom Tech Skill installed)*'}
- **Core Conventions:**
  - Maximize reuse of existing Shared Components, Hooks, and Services listed in Section 3.
  - Do not introduce new top-level directories outside the Standard Directory Structure in Section 2 without Architect Agent approval.

---

## 2. Standard Project Directory Structure
${structureSection}

---

## 3. Shared Components, Hooks, Utils & Services Registry
*(Continuously updated by the Architect Agent and Doc Agent so the Dev Agent reuses existing code instead of duplicating it)*

- **Shared UI Components:** *(None recorded yet — or run \`@onboard\`)*
- **Custom Hooks / State Stores:** *(None recorded yet)*
- **Helpers / Utils / HTTP Client:** *(None recorded yet)*

---

## 4. Feature Index (Knowledge Vault Map)
*(When modifying or fixing an existing feature, BA and Architect Agents must read its corresponding file in \`.ai-workspace/features/\`)*

| Feature / Module Name | Status | Detailed Spec File | Key Source Files |
| :--- | :--- | :--- | :--- |
| *(No features recorded yet)* | — | — | — |
`;
}

export function generateInitialChangelogDoc(): string {
  const today = new Date().toISOString().split('T')[0];
  return `# LIVING SYSTEM SPECIFICATION & CHANGELOG DOCUMENTATION

> This file is automatically maintained by the **Doc / Memory Keeper Agent** after completing each feature, hotfix, or Git checkpoint sync (\`sync\`).
> Formatted for direct export to **Word / PDF / Notion / Wiki** for stakeholder handover and release notes.

---

## [${today}] - Initialized Multi-Agent Workspace
- **Action:** Initialized \`.ai-workspace/\` 3-tier memory architecture and 5 specialized AI Agents.
- **Status:** Ready to track upcoming features and architectural changes.
`;
}
