import { TechSkillDefinition } from '../../types';

export const elysiajsSkill: TechSkillDefinition = {
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
};
