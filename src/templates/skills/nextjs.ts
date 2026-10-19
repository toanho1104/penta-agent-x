import { TechSkillDefinition } from '../../types';

export const nextjsSkill: TechSkillDefinition = {
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
};
