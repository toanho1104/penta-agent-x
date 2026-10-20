import { TechSkillDefinition } from '../../types';

export const reactjsSkill: TechSkillDefinition = {
  id: 'reactjs',
  name: 'React.js (Modern SPA Best Practices)',
  category: 'FE',
  description:
    'Senior React SPA architecture, State Colocation (Server vs URL vs Client state), Custom Hooks, Compound Components, and render optimization',
  globs: ['**/*.tsx', '**/*.ts', '**/*.jsx'],
  content: `# TECH SKILL: React.js (Senior SPA Architecture & Performance Engineering)

## 1. Component Architecture & Composition over Configuration
- **Decouple View from Logic:** Keep presentational components focused on rendering UI. When state orchestration, side effects, or data transformation exceeds ~35–40 lines, extract it into a focused Custom Hook (\`use<FeatureName>.ts\`).
- **Avoid Boolean Prop Explosion:** Do not build monolithic components with 15+ boolean flags (\`isCompact\`, \`withFooter\`, \`isAdminMode\`). Use **Composition (\`children\`, slots, or Compound Components)** to keep components flexible and maintainable.
- **Strict Component Reuse:** Always check \`PROJECT_MEMORY.md\` (Section 3) before creating any new UI primitive, modal, form input, or utility helper.

## 2. State Taxonomy & Colocation Discipline
Classify every piece of state before choosing a tool:
1. **Server / Async Cache State (TanStack Query / SWR):** API responses belong in the query cache. **NEVER copy query data into \`useState\` or global \`Zustand\`/\`Redux\` via \`useEffect\`**.
2. **URL State (\`searchParams\`):** Filters, pagination, sorting, search terms, and active tabs belong in the URL so views are bookmarkable and reload-safe.
3. **Colocated Local State (\`useState\` / \`useReducer\`):** Keep UI-only state (dropdown open, input draft) at the lowest common ancestor that needs it.
4. **Global Client State (Zustand / Redux / Context):** Reserve strictly for true cross-cutting client state (auth session, theme, global notifications, multi-step wizard drafts). Use atomic selectors (\`useStore(s => s.user)\`) to prevent unnecessary re-renders.

## 3. Render Optimization & Effect Hygiene
- **Zero Derived State in \`useState\`:** If a value can be computed from existing props or state, calculate it inline during render (or wrap in \`useMemo\` if computationally expensive).
- **No Cascading \`useEffect\` Chains:** Never chain multiple \`useEffect\` hooks that set state to trigger another \`useEffect\`. Handle state transitions directly inside event handlers or reducers.
- **Async Cleanup & Race Conditions:** Every raw async effect must handle cleanup/cancellation (e.g., \`AbortController\` or ignore flag) so out-of-order responses never overwrite newer state.
- **Code Splitting:** Lazy-load heavy route pages, charts, and modals using \`React.lazy\` + \`<Suspense fallback={<Skeleton />}>\` to keep the initial bundle small.

## 4. Resilient UI States & Accessibility
- Every data-driven view or widget must explicitly handle all 4 states: **Loading**, **Error (with retry action)**, **Empty State**, and **Success**.
- Use semantic HTML (\`<button type="button">\`, \`<nav>\`, \`<main>\`, \`<form>\`), proper \`aria-*\` attributes, and keyboard accessibility (\`Escape\` to close modals, focus management).

## 5. Strictly Forbidden Anti-Patterns
- ❌ NEVER declare a child component function inside a parent component's body.
- ❌ NEVER mutate state or props directly (\`state.items.push()\`) — always return new immutable references.
- ❌ NEVER use array \`index\` as a React \`key\` for dynamic lists that support sorting, filtering, insertion, or deletion.
`,
};
