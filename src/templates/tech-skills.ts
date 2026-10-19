import { TechSkillDefinition, TechSkillId } from '../types';

export const TECH_SKILLS_REGISTRY: Record<TechSkillId, TechSkillDefinition> = {
  nextjs: {
    id: 'nextjs',
    name: 'Next.js (App Router & Modern React)',
    category: 'FE',
    description:
      'App Router architecture, Server/Client Component boundaries, Data Fetching, Core Web Vitals optimization, and Next.js anti-patterns',
    globs: ['**/*.tsx', '**/*.ts', '**/next.config.*'],
    content: `# TECH SKILL: Next.js (App Router & Performance Best Practices)

## 1. Server vs. Client Component Boundaries
- **Server Components by Default:** Keep components as Server Components unless they explicitly require React state/lifecycle hooks (\`useState\`, \`useEffect\`), browser event listeners (\`onClick\`, \`onChange\`), or browser-only APIs.
- **Push \`'use client'\` to Leaf Nodes:** Never place \`'use client'\` at the top of a route \`page.tsx\` or \`layout.tsx\` if only a small interactive child widget needs interactivity. Extract interactive islands into dedicated leaf client components.

## 2. Data Fetching, API & State Management
- **Server Data Fetching:** Fetch data directly inside Server Components using async/await service layers or data-access functions.
- **Client Data Fetching:** Use the project's established server-state library (TanStack Query / SWR) or the shared \`apiClient\` defined in \`src/lib/\`.
- **Environment Security:** Never expose secret environment variables to Client Components. Only variables prefixed with \`NEXT_PUBLIC_\` may be referenced on the client.
- **Validation:** Always validate form inputs, Server Actions, and Route Handlers using \`zod\` schemas.

## 3. UI Completeness & Core Web Vitals
- Use \`next/image\` for optimized image rendering and \`next/link\` for internal navigation.
- Every data-driven view must handle all 4 UI states explicitly: **Loading (Skeleton/Spinner)**, **Error (Retry/Fallback)**, **Empty State**, and **Success**.
- Never declare a component function inside another component body (causes full remounts on every render).

## 4. Strictly Forbidden Anti-Patterns
- ❌ NEVER call \`fetch('http://localhost:3000/api/...')\` with hardcoded localhost URLs inside Server Components.
- ❌ NEVER use \`useEffect\` to compute derived state that can be calculated synchronously during render.
- ❌ NEVER recreate base UI primitives (Button, Input, Modal) if reusable components already exist in \`PROJECT_MEMORY.md\`.
`,
  },

  'react-native': {
    id: 'react-native',
    name: 'React Native & Expo (Mobile Optimization)',
    category: 'Mobile',
    description:
      'Mobile UI architecture, 60/120fps list virtualization, SafeArea & Keyboard handling, and memory leak prevention on iOS/Android',
    globs: ['**/*.tsx', '**/*.ts'],
    content: `# TECH SKILL: React Native & Expo (High-Performance Mobile Development)

## 1. Cross-Platform Layout & UX Standards (iOS & Android)
- **Safe Area & Keyboard Handling:**
  - Wrap screens using \`SafeAreaView\` (from \`react-native-safe-area-context\`) or the project's shared \`ScreenWrapper\`.
  - Any screen containing \`TextInput\` fields must handle keyboard overlap via \`KeyboardAvoidingView\` (using \`behavior="padding"\` on iOS) and support dismissing the keyboard on outside tap.
- **Design Tokens:** Never hardcode hex colors (\`#ffffff\`) or arbitrary pixel spacings when a centralized \`theme\` (colors, spacing, typography) exists.
- **Styling:** Use \`StyleSheet.create\` (or NativeWind if configured in \`PROJECT_MEMORY.md\`). Avoid creating new inline style objects \`style={{ ... }}\` inside list items or frequent render loops.

## 2. List Virtualization & 60/120 FPS Performance
- **NEVER use \`ScrollView\` with \`.map()\`** for dynamic lists that may exceed 15 items. Always use \`FlatList\` or \`FlashList\`.
- When using \`FlatList\`:
  - Provide a deterministic, unique \`keyExtractor\` (avoid raw array \`index\` if list items can be reordered, added, or deleted).
  - Extract \`renderItem\` into a memoized callback (\`useCallback\`) and wrap list item components with \`React.memo\`.

## 3. Lifecycle, Async Safety & Network Resilience
- Always clean up timers (\`setTimeout\`, \`setInterval\`), subscriptions, and \`AppState\` / keyboard listeners in the \`useEffect\` cleanup return function.
- Prevent duplicate submissions: Every critical action button (Login, Checkout, Submit) must immediately enter a \`disabled / loading\` state while an async request is in flight.

## 4. Strictly Forbidden Anti-Patterns
- ❌ NEVER render raw text strings outside of a \`<Text>\` component (causes an immediate runtime crash on React Native).
- ❌ NEVER nest a vertical \`FlatList\` inside a vertical \`ScrollView\`.
- ❌ NEVER reference web-only globals (\`window\`, \`document\`, \`localStorage\`) in React Native code.
`,
  },

  reactjs: {
    id: 'reactjs',
    name: 'React.js (Modern SPA Best Practices)',
    category: 'FE',
    description:
      'Component composition, Custom Hooks extraction, state management, and re-render optimization for React SPAs',
    globs: ['**/*.tsx', '**/*.ts', '**/*.jsx'],
    content: `# TECH SKILL: React.js (Clean Architecture & Performance)

## 1. Component Design & Separation of Concerns
- **Decouple UI from Business Logic:** Keep presentational components lean. If state orchestration or API logic exceeds ~40 lines, extract it into a dedicated Custom Hook (\`use<FeatureName>.ts\`).
- **Component Reuse:** Always inspect \`PROJECT_MEMORY.md\` before creating any new UI primitive or utility helper.

## 2. State Management & Render Optimization
- Do not store derived values in \`useState\` when they can be computed directly from existing props or state during render.
- Avoid chained \`useEffect\` calls that trigger cascading state updates.

## 3. Resilient UI States
- Every asynchronous view must explicitly handle **Loading**, **Error**, **Empty**, and **Success** states.
`,
  },

  elysiajs: {
    id: 'elysiajs',
    name: 'ElysiaJS & Bun (High-Performance Backend)',
    category: 'BE',
    description:
      'End-to-end type-safe REST API design, TypeBox schema validation, modular plugin architecture, and service layer separation for ElysiaJS',
    globs: ['**/*.ts'],
    content: `# TECH SKILL: ElysiaJS (Type-Safe & Modular Backend)

## 1. Modular Architecture & Layer Separation
- Encapsulate each domain module as a dedicated \`Elysia\` instance (Controller/Plugin) with a clear route \`prefix\`.
- **Decouple HTTP Context from Business Logic:** Keep route handlers concise. Extract database queries and domain rules into a dedicated \`service.ts\` layer.

## 2. Validation & End-to-End Type Safety
- Always define strict schemas for \`body\`, \`query\`, \`params\`, and \`response\` using Elysia's \`t\` (TypeBox) validator to guarantee runtime validation and accurate OpenAPI generation.
- Handle errors centrally via \`.onError()\` with consistent HTTP status codes and structured JSON error payloads.
`,
  },

  nestjs: {
    id: 'nestjs',
    name: 'NestJS (Enterprise Node.js Backend)',
    category: 'BE',
    description:
      'Module-Controller-Service architecture, DTO validation, Dependency Injection, and Exception Filters for NestJS',
    globs: ['**/*.ts'],
    content: `# TECH SKILL: NestJS (Modular & Scalable Backend)

## 1. Strict 3-Layer Architecture
- **Controller:** Handles routing, request extraction, DTO validation, and response status codes only. Never place complex business logic or direct ORM queries inside a Controller.
- **Service:** Encapsulates domain business logic, transactions, and repository/ORM interactions.
- **DTO (Data Transfer Object):** Validate all incoming payloads using DTO classes decorated with \`class-validator\` and \`class-transformer\`.

## 2. Error Handling & Security
- Throw NestJS built-in HTTP exceptions (\`NotFoundException\`, \`BadRequestException\`, \`UnauthorizedException\`, etc.) instead of generic \`Error\` instances.
- Never leak sensitive fields (\`password\`, \`refreshTokenHash\`, internal secrets) in API responses.
`,
  },

  flutter: {
    id: 'flutter',
    name: 'Flutter & Dart (Clean Mobile Architecture)',
    category: 'Mobile',
    description:
      'Widget tree optimization, const constructors, State Management (Bloc/Riverpod), and Clean Architecture for Flutter',
    globs: ['**/*.dart'],
    content: `# TECH SKILL: Flutter & Dart (High-Performance Mobile Development)

## 1. Widget Tree & Render Optimization
- **Maximize \`const\` Usage:** Always mark immutable widgets and constructors as \`const\` so Flutter skips unnecessary widget rebuilds.
- **Extract Sub-Widgets:** Prefer extracting complex UI sections into dedicated \`StatelessWidget\` / \`StatefulWidget\` classes rather than large \`Widget _buildSection()\` helper methods.
- Use \`ListView.builder\` or \`SliverList\` for dynamic lists.

## 2. Clean Architecture & Async Safety
- Strictly separate \`presentation\` (UI & State), \`domain\` (Entities & UseCases), and \`data\` (Models, DataSources & Repositories).
- Never make direct HTTP calls or parse raw JSON inside UI Widgets.
- Always check \`if (!context.mounted) return;\` before using \`BuildContext\` across an \`await\` gap.
`,
  },
};

export const AVAILABLE_TECH_SKILLS = Object.values(TECH_SKILLS_REGISTRY);
