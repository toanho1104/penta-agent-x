import { TechSkillDefinition } from '../../types';

export const angularjsSkill: TechSkillDefinition = {
  id: 'angularjs',
  name: 'Angular & AngularJS Architecture',
  description:
    'Senior Angular (Standalone, Signals, OnPush, RxJS) & AngularJS 1.x (Component architecture, Digest optimization, Memory-safe lifecycle)',
  globs: ['**/*.ts', '**/*.html', '**/*.js'],
  content: `# Tech Skill: Angular & AngularJS Best Practices (` + '`angularjs`' + `)

> **Version Detection Rule:** Inspect \`package.json\` first:
> - If \`@angular/core\` (Angular 2+ / 16–19+) is present -> Apply **Section 1 (Modern Angular)** & **Section 3**.
> - If \`angular\` (\`1.x\`) is present -> Apply **Section 2 (AngularJS 1.x Legacy / Hybrid)** & **Section 3**.

---

## 1. Modern Angular Architecture (\`@angular/core\` v16–19+)
- **Standalone Components & Modular Boundaries:**
  - Default to \`standalone: true\` components, directives, and pipes for new features unless the project strictly enforces legacy \`NgModule\` boundaries.
  - Organize by domain feature (\`src/app/features/<feature>/\`) with lazy-loaded route boundaries (\`loadComponent\` / \`loadChildren\`), keeping \`src/app/core/\` for singleton services, guards, and interceptors, and \`src/app/shared/\` for dumb reusable UI components.
- **Change Detection & Signals (\`OnPush\`):**
  - Always set \`changeDetection: ChangeDetectionStrategy.OnPush\` on components to prevent unnecessary subtree re-renders.
  - Use **Angular Signals** (\`signal()\`, \`computed()\`, \`input()\`, \`output()\`) for synchronous reactive UI state and derived values; use **RxJS** for asynchronous event streams, HTTP coordination, debouncing, and race-condition cancellation (\`switchMap\`, \`exhaustMap\`).
  - Never bind expensive function calls directly in templates (e.g., \`{{ calculateTotal(items) }}\`); use \`computed()\` signals or pure \`@Pipe({ pure: true })\`.
- **RxJS Memory Leak Prevention:**
  - Prefer the \`async\` pipe (or \`toSignal()\`) in templates over manual \`.subscribe()\` in components.
  - Whenever a manual \`.subscribe()\` is required inside a component or directive, **always** pipe \`takeUntilDestroyed(this.destroyRef)\` (or \`Subject\` + \`takeUntil\` in \`ngOnDestroy\`) so subscriptions are deterministically cleaned up.
  - Never nest \`.subscribe()\` calls inside another \`.subscribe()\` — compose streams with \`switchMap\`, \`concatMap\`, \`mergeMap\`, or \`combineLatest\`.
- **Reactive Forms & Type Safety:**
  - Always use **Strictly Typed Reactive Forms** (\`FormGroup\`, \`NonNullableFormBuilder\`) for complex forms, custom validators, and dynamic controls instead of Template-Driven forms.
- **HTTP, Interceptors & Dependency Injection:**
  - Centralize API calls inside injectable Services (\`@Injectable({ providedIn: 'root' })\`) using \`inject(HttpClient)\`.
  - Handle auth token injection, correlation IDs, and global HTTP error normalization inside functional \`HttpInterceptorFn\`.

---

## 2. AngularJS 1.x Architecture (\`angular\` 1.5–1.8 & Hybrid Apps)
- **Component-Based Architecture (\`.component()\` & \`controllerAs\`):**
  - Always build UI using \`angular.module(...).component('myComponent', { bindings, controller, templateUrl })\` (AngularJS 1.5+) instead of legacy \`ng-controller\` or raw \`.directive()\` with \`$scope\`.
  - Always use \`controllerAs: '$ctrl'\` syntax and bind properties to \`this\` inside the controller (` + '`const vm = this;`' + `) rather than mutating \`$scope\` directly.
  - Enforce one-way data bindings (\`<\`) for inputs and callback bindings (\`&\`) for outputs; avoid two-way binding (\`=\`) across component boundaries to prevent unintended digest mutations.
- **Lifecycle Hooks & Memory Cleanup:**
  - Initialize state inside \`$onInit()\`, respond to one-way binding changes in \`$onChanges(changesObj)\`, and clean up all \`$rootScope.$on\`, \`$scope.$watch\`, \`$interval\`, \`$timeout\`, and DOM listeners inside \`$onDestroy()\`.
- **Digest Cycle & Watcher Performance (` + '`$$watchers`' + ` Optimization):**
  - Keep the total active watcher count low to prevent sluggish \`$digest\` cycles:
    - Use **one-time bindings** (\`{{ ::$ctrl.user.name }}\` or \`ng-if="::$ctrl.isReady"\`) for static data that does not change after initial render.
    - Always use \`track by item.id\` in every \`ng-repeat="item in $ctrl.items track by item.id"\` to prevent full DOM node recreation on array updates.
    - Prefer \`ng-if\` over \`ng-show\`/\`ng-hide\` for heavy DOM subtrees so inactive watchers are removed from the digest loop.
- **Services, \`$q\` Promises & External Libraries:**
  - Keep controllers thin; encapsulate all HTTP (\`$http\`), business logic, and caching inside \`.service()\` or \`.factory()\`.
  - Always return \`$q\` promises from async service methods and handle errors explicitly in \`.catch()\`.
  - When triggering callbacks outside AngularJS's context (e.g., native DOM events, 3rd-party SDKs), use \`$scope.$evalAsync()\` or \`$timeout()\` instead of bare \`$scope.$apply()\` to avoid \`$rootScope:inprog\` (\`digest already in progress\`) crashes.

---

## 3. Security, Testing & Verification Standards
- **XSS Protection:** Never bypass Angular's built-in sanitization (\`DomSanitizer.bypassSecurityTrustHtml\` or AngularJS \`$sce.trustAsHtml\`) on untrusted user input.
- **Testing & Static Verification:**
  - Write unit tests for Services, Pipes, Guards, and Component interaction states (Jasmine/Karma/Jest or Angular Testing Library).
  - Run \`ng build\` / \`tsc --noEmit\` (or project linter) after completing every task to verify zero template type-check or compilation errors.
`,
};
