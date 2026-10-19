export const flutterStructure = `### Standard Directory Structure (Mobile - Flutter Feature-First Clean Architecture)
\`\`\`text
lib/
├── core/                   # Application-wide shared core
│   ├── constants/          # AppColors, AppSpacing, ApiEndpoints
│   ├── error/              # Failures, Exceptions
│   ├── network/            # Dio client, Interceptors
│   ├── router/             # GoRouter configuration
│   ├── theme/              # ThemeData
│   └── widgets/            # Shared UI Widgets (AppButton, AppTextField...)
├── features/               # Independent feature modules
│   └── <feature_name>/
│       ├── data/           # Models (fromJson/toJson), DataSources, Repository implementations
│       ├── domain/         # Entities, UseCases, Repository interfaces
│       └── presentation/   # Pages/Screens, Widgets, State (Bloc/Riverpod/Cubit)
└── main.dart
\`\`\``;
