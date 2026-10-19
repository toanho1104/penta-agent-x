export const nestjsStructure = `### Standard Directory Structure (Backend - NestJS Modular Architecture)
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
\`\`\``;
