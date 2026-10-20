import { TechSkillDefinition } from '../../types';

export const reactNativeSkill: TechSkillDefinition = {
  id: 'react-native',
  name: 'React Native & Expo (Mobile Optimization)',
  category: 'Mobile',
  description:
    'Senior React Native & Expo architecture, 60/120fps UI-thread animations, FlashList/FlatList virtualization, gesture/keyboard handling, and native memory safety',
  globs: ['**/*.tsx', '**/*.ts'],
  content: `# TECH SKILL: React Native & Expo (Senior Mobile Engineering & 60/120 FPS Optimization)

## 1. Cross-Platform Layout, SafeArea & Keyboard Ergonomics
- **Safe Area & Screen Wrappers:** Wrap every screen in \`SafeAreaView\` (from \`react-native-safe-area-context\`, using explicit \`edges\`) or the project's shared \`ScreenWrapper\`.
- **Keyboard Handling:** Every form screen with \`TextInput\` MUST handle keyboard overlap using \`KeyboardAvoidingView\` (\`behavior="padding"\` on iOS) or \`react-native-keyboard-controller\`, configure \`returnKeyType\` / \`onSubmitEditing\` focus chains, and dismiss the keyboard on outside tap (\`keyboardShouldPersistTaps="handled"\`).
- **Design System & Styling:** Use centralized theme tokens (colors, spacing, typography, radii) and \`StyleSheet.create\` (or NativeWind if specified in \`PROJECT_MEMORY.md\`). Never allocate new inline style objects \`style={{ ... }}\` inside list items or animation loops.
- **Touch Target Ergonomics:** Ensure interactive icon buttons and compact controls have a minimum touch area of \`44x44pt\` (use \`hitSlop\` when visual bounds are smaller).

## 2. List Virtualization & High-Frame-Rate Rendering (60/120 FPS)
- **NEVER use \`ScrollView\` with \`.map()\`** for dynamic lists exceeding 15 items. Always use \`FlashList\` (preferred, with \`estimatedItemSize\`) or \`FlatList\`.
- **Virtualized List Discipline:**
  - Always provide a stable, unique \`keyExtractor\` (never use array \`index\` if items can be added, removed, filtered, or reordered).
  - Extract \`renderItem\` into a \`useCallback\` and wrap list item components in \`React.memo\` with minimal, primitive props.
  - Keep list item component trees shallow and avoid heavy synchronous computations during scroll.
- **UI-Thread Animations:** Never animate layout properties (\`width\`, \`height\`, \`top\`, \`margin\`) on the JS thread via legacy state updates. Use \`react-native-reanimated\` (\`useSharedValue\`, \`useAnimatedStyle\`, worklets) animating \`transform\` and \`opacity\` on the UI thread.

## 3. Image Caching, Storage Security & Navigation Safety
- **Image Memory Management:** Prefer \`expo-image\` (or \`FastImage\`) with explicit \`contentFit\` and caching policies instead of uncached base \`<Image>\` inside long lists.
- **Secure vs. Fast Local Storage:**
  - NEVER store sensitive tokens, JWTs, or credentials in plain \`AsyncStorage\`. Use \`expo-secure-store\` or native Keychain/Keystore.
  - Use \`MMKV\` (or project standard) for high-frequency synchronous key-value reads.
- **Navigation Type Safety:** Strictly type all route params. Never pass non-serializable objects (functions, class instances, large data blobs) through navigation params — pass IDs and read from the store/cache on the target screen.

## 4. Lifecycle, Concurrency & Network Resilience
- Clean up all timers (\`setTimeout\`, \`setInterval\`), event listeners, \`AppState\` listeners, and Android hardware back handlers inside \`useEffect\` / \`useFocusEffect\` cleanup callbacks.
- Prevent duplicate taps/mutations: Critical action buttons (Login, Payment, Submit) must immediately lock (\`disabled={isSubmitting}\`) while an async request is in flight.

## 5. Strictly Forbidden Anti-Patterns
- ❌ NEVER render raw strings or numbers outside a \`<Text>\` component (including accidental \`{count && <Component />}\` when \`count === 0\`, which crashes React Native! Always use \`{count > 0 ? <Component /> : null}\`).
- ❌ NEVER nest a \`FlatList\` / \`FlashList\` inside a \`ScrollView\` of the same scroll orientation.
- ❌ NEVER use web-only globals (\`window\`, \`document\`, \`localStorage\`, HTML tags like \`<div>\`/\`<span>\`) in React Native code.
`,
};
