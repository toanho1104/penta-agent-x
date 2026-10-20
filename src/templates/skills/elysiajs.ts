import { TechSkillDefinition } from '../../types';

export const elysiajsSkill: TechSkillDefinition = {
  id: 'elysiajs',
  name: 'ElysiaJS & Bun (High-Performance Backend)',
  category: 'BE',
  description:
    'Senior ElysiaJS & Bun architecture, Plugin scoping, TypeBox schema modeling, Eden Treaty type export, database transactions, and security',
  globs: ['**/*.ts'],
  content: `# TECH SKILL: ElysiaJS & Bun (Senior Backend Architecture & Type Safety)

## 1. Modular Plugin Architecture & Layer Separation
- **Feature Encapsulation:** Structure each domain feature as an independent \`Elysia\` instance with a clear \`prefix\` (e.g., \`new Elysia({ prefix: '/auth', name: 'auth-module' })\`).
- **Decouple HTTP Context from Domain Logic:**
  - \`index.ts\` (Controller/Router): Defines routes, attaches middlewares/guards, validates schemas, and maps HTTP status codes.
  - \`model.ts\` (DTOs & Schemas): Registers reusable TypeBox schemas (\`t.Object\`) via \`.model({ ... })\` so schemas can be referenced by name and documented in OpenAPI/Swagger.
  - \`service.ts\` (Business Logic): Pure TypeScript functions/methods executing business rules and database operations without depending on the raw HTTP request context.

## 2. Plugin Scoping, Context Derivation & Auth Guards
- Use \`.decorate()\`, \`.state()\`, \`.derive()\`, and \`.resolve()\` idiomatically to inject typed dependencies (e.g., authenticated \`user\`, \`requestId\`, \`db\`) into the request context.
- Be explicit about plugin lifecycle scope (\`{ as: 'scoped' }\` vs \`{ as: 'global' }\` vs \`{ as: 'local' }\`) when creating authentication or logging macros so guards do not leak unintentionally or fail to apply to sub-routers.
- Export the root application type (\`export type App = typeof app\`) to support end-to-end type safety with **Eden Treaty** on the frontend.

## 3. Strict Validation, Error Handling & Standardized Responses
- **Mandatory TypeBox Schemas:** Validate \`body\`, \`query\`, \`params\`, \`headers\`, and \`response\` on every endpoint using Elysia's \`t\` validator.
- **Centralized Error Handling:** Register custom domain error classes via \`.error({ ... })\` and handle all errors consistently in a global \`.onError()\` hook returning a uniform JSON envelope (\`{ success: false, error: { code, message, details } }\`) with proper HTTP status codes.
- **Never Leak Sensitive Data:** Explicitly strip or omit \`passwordHash\`, internal tokens, and private metadata via response schemas or DTO mappers.

## 4. Database Performance, Transactions & Security
- **Transactions:** Wrap multi-step database writes (e.g., order creation + inventory deduction + audit log) inside a single atomic DB transaction (\`db.transaction(async (tx) => ...)\`).
- **N+1 & Unbounded Query Prevention:** Enforce pagination (\`limit\` with a strict maximum cap like \`<= 100\`, plus \`offset\` or \`cursor\`) on every list endpoint. Never run queries inside a \`for\`/\`map\` loop.
- **Idempotency & Rate Limiting:** Protect authentication, webhook, and payment endpoints against replay attacks and brute-force requests.

## 5. Strictly Forbidden Anti-Patterns
- ❌ NEVER write raw, unvalidated SQL string concatenations (SQL injection risk).
- ❌ NEVER block the Bun event loop with heavy synchronous CPU/file operations (\`fs.readFileSync\`) inside request handlers.
- ❌ NEVER return HTTP \`200 OK\` for failed operations — always use semantic HTTP status codes (\`400\`, \`401\`, \`403\`, \`404\`, \`409\`, \`422\`, \`500\`).
`,
};
