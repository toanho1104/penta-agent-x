export const reactNativeStructure = `### Standard Directory Structure (Mobile - React Native / Expo)
\`\`\`text
src/
├── app/ (or navigation/)   # Expo Router or React Navigation stacks/tabs
├── assets/                 # Fonts, images, icons
├── components/
│   ├── ui/                 # Core UI primitives (AppButton, AppText, AppInput, ScreenWrapper...)
│   └── common/             # Shared composite components
├── features/               # Feature-based domain modules
│   └── <feature-name>/
│       ├── components/
│       ├── hooks/
│       ├── screens/
│       └── services/
├── hooks/                  # Global hooks (useKeyboard, useAppTheme...)
├── services/               # API client, Local storage (MMKV / AsyncStorage)
├── store/                  # Global state management (Zustand / Redux)
├── theme/                  # Colors, Spacing, Typography design tokens
└── utils/                  # Formatters, Validators, Platform helpers
\`\`\``;
