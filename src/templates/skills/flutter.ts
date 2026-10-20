import { TechSkillDefinition } from '../../types';

export const flutterSkill: TechSkillDefinition = {
  id: 'flutter',
  name: 'Flutter & Dart (Clean Mobile Architecture)',
  category: 'Mobile',
  description:
    'Senior Flutter & Dart 3 architecture, exhaustive sealed states, Bloc/Riverpod optimization, Widget rebuild isolation, and memory leak prevention',
  globs: ['**/*.dart'],
  content: `# TECH SKILL: Flutter & Dart 3 (Senior Mobile Architecture & 60/120fps Engineering)

## 1. Feature-First Clean Architecture & Dart 3 Idioms
- **Strict Layer Boundaries:**
  - \`presentation/\`: Screens, reusable Widgets, and State Notifiers/Blocs/Cubits. Zero direct HTTP/Dio calls or raw JSON parsing in UI files.
  - \`domain/\`: Pure Dart Entities, UseCases, and abstract Repository interfaces.
  - \`data/\`: DTO Models (\`fromJson\`/\`toJson\`), Remote/Local DataSources, and Repository implementations mapping exceptions to domain \`Failure\` types.
- **Dart 3 Exhaustive Pattern Matching:** Model UI states and domain results using Dart 3 \`sealed class\` hierarchies (e.g., \`Initial\`, \`Loading\`, \`Loaded\`, \`Error\`). Use exhaustive \`switch\` expressions in the UI so the compiler guarantees every state is handled.

## 2. Widget Tree Optimization & 60/120 FPS Rendering
- **Aggressive \`const\` Constructors:** Mark every immutable Widget constructor and instantiation as \`const\` so Flutter short-circuits element rebuilds.
- **Dedicated Widget Classes over Helper Methods:** Never build large UI trees inside \`Widget _buildSection(BuildContext context)\` methods — extract them into dedicated \`StatelessWidget\` / \`StatefulWidget\` classes with \`const\` constructors so they can rebuild independently.
- **Scoped State Rebuilds (Bloc / Riverpod):**
  - Never wrap an entire Scaffold in a single top-level \`BlocBuilder\` or \`ref.watch(entireStateProvider)\` if only one child widget changes.
  - Push \`BlocBuilder\` / \`BlocSelector\` (using \`buildWhen\` / \`listenWhen\`) or Riverpod \`ref.watch(provider.select((s) => s.field))\` down to the exact leaf widget that needs the data.
- **Virtualized Lists & Slivers:** Always use \`ListView.builder\`, \`ListView.separated\`, or \`CustomScrollView\` with \`SliverList.builder\` for dynamic lists, providing stable \`ValueKey(item.id)\` on stateful list items.

## 3. Lifecycle Safety, Memory Management & Isolates
- **Mandatory Controller Disposal:** Every \`TextEditingController\`, \`ScrollController\`, \`FocusNode\`, \`AnimationController\`, \`PageController\`, and \`StreamSubscription\` MUST be disposed in \`dispose()\` (or managed via \`ref.onDispose\` in Riverpod).
- **Async \`BuildContext\` Guard:** Always verify \`if (!context.mounted) return;\` immediately after any \`await\` before navigating, showing a \`SnackBar\`/Dialog, or reading \`Theme.of(context)\`.
- **Offload Heavy Parsing:** Offload large JSON payload parsing or heavy image/crypto processing to a background isolate using \`Isolate.run()\` or \`compute()\` to prevent frame drops (jank) on the UI thread.

## 4. Design System, Responsiveness & UX Polish
- Centralize all colors, text styles, and spacing in \`ThemeData\` / \`ThemeExtension\`. Never hardcode \`Color(0xFF...)\` or raw \`TextStyle\` inline when theme tokens exist.
- Handle safe areas (\`SafeArea\`), keyboard insets (\`MediaQuery.viewInsetsOf(context)\` — prefer specific \`MediaQuery.*Of(context)\` over \`MediaQuery.of(context)\` to avoid unnecessary full-page rebuilds!), and prevent duplicate button taps while requests are loading.

## 5. Strictly Forbidden Anti-Patterns
- ❌ NEVER trigger side effects (API calls, navigation, dialogs) directly inside a Widget's \`build()\` method — use \`initState\`, \`BlocListener\`, or \`ref.listen\`.
- ❌ NEVER use the bang operator (\`!\`) on nullable variables without a guaranteed prior null check.
- ❌ NEVER recreate shared UI components (buttons, text fields, dialogs) if they already exist in \`core/widgets/\` and \`PROJECT_MEMORY.md\`.
`,
};
