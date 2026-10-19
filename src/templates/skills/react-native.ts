import { TechSkillDefinition } from '../../types';

export const reactNativeSkill: TechSkillDefinition = {
  id: 'react-native',
  name: 'React Native & Expo (Mobile Optimization)',
  category: 'Mobile',
  description:
    'Mobile UI architecture, 60/120fps list virtualization, SafeArea & Keyboard handling, and memory leak prevention on iOS/Android',
  globs: ['**/*.tsx', '**/*.ts'],
  content: `# TECH SKILL: React Native & Expo (High-Performance Mobile Development)

## 1. Cross-Platform Layout & UX Standards (iOS & Android)
- **Safe Area & Keyboard Handling:**
  - Wrap screens using \`SafeAreaView\` (from \`react-native-safe-area-context\`) or the project's shared \`ScreenWrapper\`.
  - Any screen containing \`TextInput\` fields must handle keyboard overlap via \`KeyboardAvoidingView\` (using \`behavior="padding"\` on iOS) and support dismissing the keyboard on outside tap.
- **Design Tokens:** Never hardcode hex colors (\`#ffffff\`) or arbitrary pixel spacings when a centralized \`theme\` (colors, spacing, typography) exists.
- **Styling:** Use \`StyleSheet.create\` (or NativeWind if configured in \`PROJECT_MEMORY.md\`). Avoid creating new inline style objects \`style={{ ... }}\` inside list items or frequent render loops.

## 2. List Virtualization & 60/120 FPS Performance
- **NEVER use \`ScrollView\` with \`.map()\`** for dynamic lists that may exceed 15 items. Always use \`FlatList\` or \`FlashList\`.
- When using \`FlatList\`:
  - Provide a deterministic, unique \`keyExtractor\` (avoid raw array \`index\` if list items can be reordered, added, or deleted).
  - Extract \`renderItem\` into a memoized callback (\`useCallback\`) and wrap list item components with \`React.memo\`.

## 3. Lifecycle, Async Safety & Network Resilience
- Always clean up timers (\`setTimeout\`, \`setInterval\`), subscriptions, and \`AppState\` / keyboard listeners in the \`useEffect\` cleanup return function.
- Prevent duplicate submissions: Every critical action button (Login, Checkout, Submit) must immediately enter a \`disabled / loading\` state while an async request is in flight.

## 4. Strictly Forbidden Anti-Patterns
- ❌ NEVER render raw text strings outside of a \`<Text>\` component (causes an immediate runtime crash on React Native).
- ❌ NEVER nest a vertical \`FlatList\` inside a vertical \`ScrollView\`.
- ❌ NEVER reference web-only globals (\`window\`, \`document\`, \`localStorage\`) in React Native code.
`,
};
