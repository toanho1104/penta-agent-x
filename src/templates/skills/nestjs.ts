import { TechSkillDefinition } from '../../types';

export const nestjsSkill: TechSkillDefinition = {
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
};
