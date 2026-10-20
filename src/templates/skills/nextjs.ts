import { TechSkillDefinition } from '../../types';

export const nextjsSkill: TechSkillDefinition = {
  id: 'nextjs',
  name: 'Next.js (App Router & Modern React)',
  category: 'FE',
  description:
    'Senior Next.js 15+ App Router architecture, Server/Client boundaries, Async Request APIs, Streaming/Suspense, URL state, and Core Web Vitals optimization',
  globs: ['**/*.tsx', '**/*.ts', '**/next.config.*'],
  content: `# TECH SKILL: Next.js (Senior App Router & Performance Engineering)

## 1. Server vs. Client Component Architecture
- **Server Components by Default:** Keep all layouts, pages, and data-fetching wrappers as Server Components. Add \`'use client'\` ONLY when using React state/lifecycle hooks (\`useState\`, \`useEffect\`), browser event listeners, or browser-only APIs.
- **Push \`'use client'\` to Leaf Islands:** Never mark a top-level \`page.tsx\` or \`layout.tsx\` as \`'use client'\`. Extract interactive widgets (e.g., \`FilterBar\`, \`SubmitButton\`, \`ModalTrigger\`) into isolated leaf Client Components and pass server-fetched data down as serializable props.
- **Composition Pattern (Slot Pattern):** Pass Server Components as \`children\` props into Client Components (e.g., providers, collapsible wrappers, tabs) so the inner Server Components still render on the server without being bundled into client JS.

## 2. Next.js 15+ Async Request APIs & Routing
- **Await Dynamic APIs (Next.js 15+ Standard):** \`params\`, \`searchParams\`, \`cookies()\`, and \`headers()\` are **asynchronous Promises**. Always \`await params\` and \`await searchParams\` in \`page.tsx\`, \`layout.tsx\`, \`generateMetadata\`, and Route Handlers.
- **URL State as Single Source of Truth:** Store shareable UI state (search queries, filters, sorting, pagination, active tabs) in URL \`searchParams\` via \`useSearchParams\` / \`useRouter\` rather than ephemeral \`useState\`, ensuring pages survive reloads and deep links.

## 3. Data Fetching, Caching, Mutations & Validation
- **Parallel Data Fetching & Streaming:** Avoid sequential \`await\` waterfalls in Server Components. Use \`Promise.all()\` for independent queries or wrap slow sections in granular \`<Suspense fallback={<Skeleton />}>\` boundaries so the page shell streams immediately.
- **Client Server-State:** In Client Components, use the project's server-state library (TanStack Query / SWR) or shared \`apiClient\`. Never copy server-fetched query data into local \`useState\` or global \`Zustand\` stores.
- **Mutations & Cache Invalidation:** After Server Actions or API mutations, explicitly invalidate stale caches (\`revalidatePath\`, \`revalidateTag\`, or \`queryClient.invalidateQueries\`) and disable submit triggers while pending to prevent race conditions.
- **End-to-End Validation & Security:** Validate all form inputs, URL params, Server Actions, and Route Handlers with \`zod\`. Never pass raw database models containing sensitive fields to Client Components (use Data Transfer Objects / field selection). Only \`NEXT_PUBLIC_*\` env vars may be used on the client.

## 4. UI Completeness & Core Web Vitals (LCP / CLS / INP)
- Use \`next/image\` (with \`priority\` on above-the-fold LCP images and explicit dimensions/aspect-ratio to prevent CLS) and \`next/link\` for navigation.
- Every data-driven view MUST explicitly handle all 4 states: **Loading (Skeleton/Spinner)**, **Error (Error Boundary / Retry UI)**, **Empty State**, and **Success**.
- Dynamically import heavy client-only libraries (charts, rich-text editors, maps, PDF viewers) using \`next/dynamic\` with \`ssr: false\`.

## 5. Strictly Forbidden Anti-Patterns
- ❌ NEVER call internal Route Handlers via hardcoded \`fetch('http://localhost:3000/api/...')\` inside Server Components — call the underlying service/data-access function directly.
- ❌ NEVER declare a component function inside another component body (forces full DOM unmount/remount on every render).
- ❌ NEVER use \`useEffect\` to compute derived state or trigger data fetches that belong in Server Components or TanStack Query.
- ❌ NEVER recreate base UI primitives (Button, Input, Modal, Toast) if reusable components already exist in \`PROJECT_MEMORY.md\`.
`,
};
