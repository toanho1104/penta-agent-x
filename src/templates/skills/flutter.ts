import { TechSkillDefinition } from '../../types';

export const flutterSkill: TechSkillDefinition = {
  id: 'flutter',
  name: 'Flutter & Dart (Clean Mobile Architecture)',
  category: 'Mobile',
  description:
    'Widget tree optimization, const constructors, State Management (Bloc/Riverpod), and Clean Architecture for Flutter',
  globs: ['**/*.dart'],
  content: `# TECH SKILL: Flutter & Dart (High-Performance Mobile Development)

## 1. Widget Tree & Render Optimization
- **Maximize \`const\` Usage:** Always mark immutable widgets and constructors as \`const\` so Flutter skips unnecessary widget rebuilds.
- **Extract Sub-Widgets:** Prefer extracting complex UI sections into dedicated \`StatelessWidget\` / \`StatefulWidget\` classes rather than large \`Widget _buildSection()\` helper methods.
- Use \`ListView.builder\` or \`SliverList\` for dynamic lists.

## 2. Clean Architecture & Async Safety
- Strictly separate \`presentation\` (UI & State), \`domain\` (Entities & UseCases), and \`data\` (Models, DataSources & Repositories).
- Never make direct HTTP calls or parse raw JSON inside UI Widgets.
- Always check \`if (!context.mounted) return;\` before using \`BuildContext\` across an \`await\` gap.
`,
};
