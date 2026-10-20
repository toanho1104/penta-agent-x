import { TechSkillDefinition } from '../../types';

export const nestjsSkill: TechSkillDefinition = {
  id: 'nestjs',
  name: 'NestJS (Enterprise Node.js Backend)',
  category: 'BE',
  description:
    'Senior NestJS enterprise architecture, DI modularity, strict DTO validation, DB transactions, N+1 prevention, Guards/Interceptors, and security',
  globs: ['**/*.ts'],
  content: `# TECH SKILL: NestJS (Senior Enterprise Backend Architecture)

## 1. Strict Modular 3-Layer Architecture & Dependency Injection
- **Controller Layer (\`*.controller.ts\`):** Thin HTTP transport layer only. Extracts params/body/user via decorators (\`@Body()\`, \`@Param()\`, \`@Query()\`, \`@CurrentUser()\`), delegates immediately to the Service, and defines Swagger/OpenAPI metadata. Zero business logic or direct ORM calls in Controllers.
- **Service Layer (\`*.service.ts\`):** Encapsulates domain business rules, authorization checks, transaction orchestration, and domain events.
- **Data Access / Repository Layer:** Keep complex ORM queries (Prisma / TypeORM / MikroORM) cleanly separated and reusable. Avoid circular module dependencies (\`forwardRef\`) by extracting shared logic into a dedicated domain/shared module.

## 2. DTO Validation, Serialization & Contract Safety
- **Input DTOs:** Every \`POST\`, \`PUT\`, \`PATCH\`, and filtered \`GET\` endpoint MUST use a dedicated DTO class validated with \`class-validator\` and \`class-transformer\` (assuming global \`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })\`).
- **Output Serialization (Data Leak Prevention):** Never return raw database entities directly from Controllers if they contain sensitive fields (\`password\`, \`refreshTokenHash\`, internal flags). Use explicit Prisma \`select\` / TypeORM projections or mapped Response DTOs.
- **Pagination Standard:** Every list endpoint must accept a standardized \`PaginationQueryDto\` (\`page\`/\`limit\` or \`cursor\`, with \`@Max(100)\` on \`limit\`) and return a consistent paginated metadata envelope.

## 3. Database Transactions, Concurrency & N+1 Prevention
- **Atomic Transactions:** Any business operation that mutates multiple tables or aggregates MUST run inside a database transaction (e.g., \`prisma.$transaction(async (tx) => ...)\` or TypeORM \`QueryRunner\`).
- **Race Conditions & Idempotency:** For financial, inventory, or booking mutations, use optimistic concurrency control (version checks), atomic increments/decrements, or row-level locks (\`SELECT ... FOR UPDATE\`) to prevent double-spending on concurrent requests.
- **No N+1 Queries:** Never execute database queries inside a \`for\` / \`.map()\` loop. Batch queries using \`IN (...)\`, \`findMany\`, or relation joins.

## 4. Cross-Cutting Concerns (Guards, Interceptors, Exception Filters)
- Handle authentication and RBAC/permissions declaratively using **Guards** (\`JwtAuthGuard\`, \`RolesGuard\`) and custom decorators rather than repeating auth boilerplate inside Services.
- Throw semantic NestJS HTTP exceptions (\`NotFoundException\`, \`ConflictException\`, \`ForbiddenException\`, \`UnprocessableEntityException\`, \`BadRequestException\`) with clear error codes — never \`throw new Error()\` or return \`null\` when a resource is missing.

## 5. Strictly Forbidden Anti-Patterns
- ❌ NEVER inject \`@Res()\` (Express/Fastify raw response) unless streaming files or setting low-level cookies, as it bypasses NestJS Interceptors and Exception Filters.
- ❌ NEVER hardcode secrets, JWT keys, or URLs — always inject typed \`ConfigService\`.
- ❌ NEVER leave unhandled floating Promises (\`fire-and-forget\` without \`.catch()\` logging or a proper job queue like BullMQ).
`,
};
