export const angularjsStructure = `### Standard Directory Structure (Angular / AngularJS)
\`\`\`text
src/
├── app/
│   ├── core/               # Singleton services, HTTP interceptors, auth guards
│   ├── shared/             # Dumb reusable UI components, pipes, directives
│   ├── features/           # Domain feature modules / standalone route trees
│   │   └── <feature-name>/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── services/
│   │       └── models/
│   ├── layout/             # Main shell, header, sidebar, footer
│   ├── app.routes.ts       # Top-level lazy-loaded route definitions
│   └── app.component.ts    # Root application shell
├── assets/                 # Static images, i18n, icons
├── environments/           # Environment-specific configuration
└── styles/                 # Global SCSS variables, Bootstrap overrides, themes
\`\`\``;
