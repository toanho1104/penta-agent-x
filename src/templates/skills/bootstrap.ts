import { TechSkillDefinition } from '../../types';

export const bootstrapSkill: TechSkillDefinition = {
  id: 'bootstrap',
  name: 'Bootstrap 5 & Responsive UI',
  description:
    'Senior Bootstrap 5 architecture: Grid system, Utility API, SCSS/CSS custom properties theming, accessible components & zero-bloat CSS',
  globs: ['**/*.html', '**/*.tsx', '**/*.jsx', '**/*.vue', '**/*.scss', '**/*.css'],
  content: `# Tech Skill: Bootstrap 5 & Responsive UI Architecture (` + '`bootstrap`' + `)

## 1. Responsive Grid & Layout Architecture
- **Strict Grid Hierarchy:** Always enforce the canonical hierarchy: \`.container\` (or \`.container-fluid\` / \`.container-{breakpoint}\`) -> \`.row\` -> \`.col-*\`.
  - **NEVER** nest a \`.container\` directly inside another \`.container\`.
  - **NEVER** place content directly inside a \`.row\` without wrapping it in a \`.col-*\` column, and never place \`.col-*\` directly outside a \`.row\`.
- **Gutters Over Manual Margins:** Control spacing between columns using Bootstrap's gutter utilities (\`.g-*\`, \`.gx-*\`, \`.gy-*\`) on the \`.row\` element rather than overriding \`.col-*\` padding or applying horizontal margins (\`mx-*\`) directly to columns (which breaks row negative-margin alignment).
- **Mobile-First Breakpoint Progression:** Write base classes for mobile (\`col-12\`) and progressively enhance upward (\`col-md-6 col-lg-4\`). Combine row-columns (\`row-cols-1 row-cols-sm-2 row-cols-lg-4\`) for uniform card/grid layouts.

## 2. Utility-First Usage vs. Custom CSS Bloat
- **Utility Classes Before Custom CSS:** Always compose spacing (\`m-*\`, \`p-*\`), flex (\`d-flex\`, \`justify-content-*\`, \`align-items-*\`, \`gap-*\`), sizing, borders (\`rounded-*\`, \`border-*\`), and typography (\`fs-*\`, \`fw-*\`, \`text-truncate\`) using native Bootstrap 5 utility classes before writing custom CSS rules.
- **Component Extraction Over Class Soup:** When a specific combination of Bootstrap utilities repeats 3+ times (e.g., a standardized Card header or Status Badge), extract a reusable UI component in your framework (React/Angular/Vue) or define a semantic SCSS class rather than copy-pasting 12+ classes everywhere.
- **Stack Layouts:** Use \`.vstack\` and \`.hstack\` with \`.gap-*\` for clean vertical and horizontal flex stacks.

## 3. SCSS Architecture & CSS Custom Properties (\`--bs-*\`) Theming
- **Theme via Variables, Not \`!important\` Overrides:**
  - Never scatter \`.btn-primary { background-color: #... !important; }\` in global stylesheets.
  - Customize Bootstrap at build time by overriding SCSS variables (\`$primary\`, \`$border-radius\`, \`$font-family-sans-serif\`, \`$spacer\`) **before** importing Bootstrap's SCSS modules, or override scoped CSS Custom Properties (\`--bs-primary\`, \`--bs-body-bg\`, \`--bs-btn-bg\`) at the root/component level.
- **Selective SCSS Module Imports:** In production apps using Sass, import only required Bootstrap modules (\`@import "bootstrap/scss/functions"; @import "bootstrap/scss/variables"; @import "bootstrap/scss/grid"; ...\`) instead of the monolithic bundle when bundle size is critical.
- **Native Dark Mode (\`data-bs-theme\`):** Support color modes using Bootstrap 5.3+ \`data-bs-theme="light|dark"\` attributes and semantic adaptive variables (\`bg-body\`, \`bg-body-tertiary\`, \`text-body\`, \`text-body-secondary\`, \`border-secondary-subtle\`) instead of hardcoded \`bg-white\` or \`text-dark\`.

## 4. Forms, Validation States & Floating Labels
- **Standardized Form Controls:** Use \`.form-label\`, \`.form-control\`, \`.form-select\`, \`.form-check\`, and \`.input-group\` consistently. Always pair every input with an explicit \`<label for="...">\` (or \`aria-label\` if visually hidden with \`.visually-hidden\`).
- **Validation Feedback:** Use native Bootstrap validation states (\`.is-valid\`, \`.is-invalid\`) paired with \`.valid-feedback\` and \`.invalid-feedback\` sibling elements. Prevent layout shifts by reserving space or keeping error messages concise.

## 5. Interactive Components, JS Lifecycle & Accessibility (A11y)
- **Framework Integration (React / Angular / Vue):**
  - When using Bootstrap inside SPA frameworks (React, Angular, Next.js), prefer dedicated wrapper libraries (\`react-bootstrap\`, \`ng-bootstrap\`, \`ngx-bootstrap\`) OR manage Bootstrap's imperative JS instances (\`Modal\`, \`Offcanvas\`, \`Tooltip\`, \`Popover\`, \`Dropdown\`) cleanly inside lifecycle hooks (\`useEffect\` cleanup / \`ngOnDestroy\`), calling \`.dispose()\` on unmount to prevent memory leaks and zombie event listeners.
  - Avoid mixing \`data-bs-toggle\` DOM attributes with framework state management on the same Modal/Dropdown, as this causes desynchronized DOM state and stuck modal backdrops (\`.modal-backdrop\`).
- **Accessibility Mandatory Checks:**
  - Modals and Offcanvas components must define \`aria-labelledby\` pointing to `.modal-title` / `.offcanvas-title` and trap focus properly.
  - Icon-only buttons (e.g., close buttons \`.btn-close\` or action buttons) MUST include \`aria-label="..."\`.

## 6. Anti-Patterns to Strictly Avoid
- **Never** modify core \`node_modules/bootstrap\` files directly.
- **Never** apply \`display: flex\` (\`d-flex\`) directly to a \`.row\` (it is already a flex container) or override \`width\`/\`padding\` directly on \`.col-*\` elements without understanding gutter mechanics.
- **Never** hardcode pixel widths on responsive containers or cards that cause horizontal scrolling on \`320px–375px\` mobile viewports.
`,
};
