import { TechSkillDefinition } from '../../types';

export const reactjsSkill: TechSkillDefinition = {
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
};
