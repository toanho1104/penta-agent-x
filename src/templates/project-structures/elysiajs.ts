export const elysiajsStructure = `### Standard Directory Structure (Backend - ElysiaJS + Bun)
\`\`\`text
src/
├── config/                 # Environment validation & system config
├── db/                     # Database client (Drizzle / Prisma) & schema
├── middlewares/            # Auth, Error handler, Logger plugins
├── modules/                # Feature modules (each module as an Elysia instance)
│   └── <module-name>/
│       ├── index.ts        # Routes & Controller definitions with TypeBox (t.Object)
│       ├── model.ts        # DTO & Validation Schemas
│       └── service.ts      # Pure business logic decoupled from HTTP context
├── utils/                  # Shared helper functions
└── index.ts                # Application entrypoint composing modules
\`\`\``;
