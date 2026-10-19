import fs from 'fs-extra';
import path from 'path';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  '.turbo',
  '.expo',
  '.dart_tool',
  'Pods',
  'android',
  'ios',
  'coverage',
  '.ai-workspace',
  '.agents',
  '.cursor',
  '.claude',
]);

const IGNORED_FILES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  '.DS_Store',
]);

export interface DiscoveredFeature {
  slug: string;
  sourcePaths: string[];
  sampleFiles: string[];
}

export interface DiscoveredSubApp {
  name: string;
  relPath: string; // '.' for root single-app, or e.g. 'apps/web', 'backend'
  stacks: string[];
  features: DiscoveredFeature[];
}

export interface ScanResult {
  detectedStacks: string[];
  dependencies: string[];
  directoryTree: string;
  sharedFiles: string[];
  isMultiApp: boolean;
  subApps: DiscoveredSubApp[];
  totalFeaturesCount: number;
  reportMarkdown: string;
}

const NON_FEATURE_NAMES = new Set([
  'api',
  'components',
  'component',
  'ui',
  'shared',
  'common',
  'hooks',
  'hook',
  'utils',
  'util',
  'helpers',
  'helper',
  'lib',
  'libs',
  'services',
  'service',
  'store',
  'stores',
  'state',
  'types',
  'interfaces',
  'constants',
  'config',
  'configs',
  'configuration',
  'assets',
  'images',
  'icons',
  'fonts',
  'styles',
  'theme',
  'themes',
  'providers',
  'provider',
  'context',
  'contexts',
  'middleware',
  'middlewares',
  'guards',
  'interceptors',
  'filters',
  'pipes',
  'decorators',
  'dto',
  'dtos',
  'entities',
  'models',
  'schemas',
  'database',
  'db',
  'prisma',
  'migrations',
  'seeds',
  'test',
  'tests',
  '__tests__',
  'mocks',
  'core',
  'widgets',
  'l10n',
  'i18n',
  'locales',
  'generated',
  'layout',
  'layouts',
  'loading',
  'error',
  'not-found',
  'template',
  'default',
  'globals',
  'index',
  'main',
  'app',
  'navigation',
  'router',
  'routes',
  'controllers',
  'modules',
  'features',
  'screens',
  'pages',
  'views',
  'public',
  'static',
]);

function normalizeFeatureSlug(rawName: string): string {
  const withoutExt = rawName.replace(/\.[a-z0-9]+$/i, '');
  const stripped = withoutExt
    .replace(/\.(controller|service|module|route|routes|screen|page|view|slice|store)$/i, '')
    .replace(/^(use|get|post|put|delete)[A-Z]/, (m) => m.toLowerCase());
  return stripped
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}

function collectSampleFiles(targetPath: string, baseDir: string, maxFiles: number = 6): string[] {
  const files: string[] = [];
  try {
    const stat = fs.statSync(targetPath);
    if (stat.isFile()) {
      return [path.relative(baseDir, targetPath).replace(/\\/g, '/')];
    }
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      if (files.length >= maxFiles) break;
      if (entry.name.startsWith('.')) continue;
      const full = path.join(targetPath, entry.name);
      if (entry.isFile() && !IGNORED_FILES.has(entry.name)) {
        files.push(path.relative(baseDir, full).replace(/\\/g, '/'));
      } else if (entry.isDirectory() && !IGNORED_DIRS.has(entry.name)) {
        const subEntries = fs.readdirSync(full, { withFileTypes: true });
        for (const sub of subEntries) {
          if (files.length >= maxFiles) break;
          if (sub.isFile() && !sub.name.startsWith('.')) {
            files.push(
              path.relative(baseDir, path.join(full, sub.name)).replace(/\\/g, '/')
            );
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return files;
}

async function detectStackInDir(dirPath: string): Promise<{
  stacks: string[];
  deps: string[];
}> {
  const stacks: string[] = [];
  const deps: string[] = [];

  const pkgPath = path.join(dirPath, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    try {
      const pkg = await fs.readJson(pkgPath);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };
      const depNames = Object.keys(allDeps);
      deps.push(...depNames.slice(0, 50));

      if (allDeps['next']) stacks.push('Next.js');
      if (allDeps['react-native'] || allDeps['expo']) stacks.push('React Native');
      if (allDeps['react'] && !allDeps['next'] && !allDeps['react-native'])
        stacks.push('React.js');
      if (allDeps['elysia']) stacks.push('ElysiaJS');
      if (allDeps['@nestjs/core']) stacks.push('NestJS');
      if (allDeps['express']) stacks.push('Express.js');
      if (allDeps['fastify']) stacks.push('Fastify');
      if (allDeps['vue'] || allDeps['nuxt']) stacks.push('Vue / Nuxt');
      if (allDeps['tailwindcss']) stacks.push('TailwindCSS');
      if (allDeps['zustand']) stacks.push('Zustand');
      if (allDeps['@reduxjs/toolkit']) stacks.push('Redux Toolkit');
      if (allDeps['prisma'] || allDeps['@prisma/client'])
        stacks.push('Prisma ORM');
    } catch {
      // ignore
    }
  }

  const pubspecPath = path.join(dirPath, 'pubspec.yaml');
  if (await fs.pathExists(pubspecPath)) {
    stacks.push('Flutter / Dart');
  }

  return { stacks, deps };
}

function discoverFeaturesInApp(appDir: string, rootCwd: string): DiscoveredFeature[] {
  const featureMap = new Map<string, { sourcePaths: Set<string>; sampleFiles: Set<string> }>();

  const registerFeature = (rawName: string, fullTargetPath: string) => {
    if (
      rawName.startsWith('.') ||
      rawName.startsWith('_') ||
      rawName.startsWith('[')
    ) {
      return;
    }
    const slug = normalizeFeatureSlug(rawName);
    if (!slug || slug.length < 2 || NON_FEATURE_NAMES.has(slug)) return;

    const relPath = path.relative(rootCwd, fullTargetPath).replace(/\\/g, '/');
    const samples = collectSampleFiles(fullTargetPath, rootCwd, 5);

    if (!featureMap.has(slug)) {
      featureMap.set(slug, {
        sourcePaths: new Set([relPath]),
        sampleFiles: new Set(samples),
      });
    } else {
      const existing = featureMap.get(slug)!;
      existing.sourcePaths.add(relPath);
      samples.forEach((f) => {
        if (existing.sampleFiles.size < 8) existing.sampleFiles.add(f);
      });
    }
  };

  const scanContainerDir = (containerRel: string, unwrapRouteGroups: boolean = false) => {
    const containerFull = path.join(appDir, containerRel);
    if (!fs.existsSync(containerFull)) return;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(containerFull, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
      const entryFull = path.join(containerFull, entry.name);

      // Handle Next.js / Expo route groups like (auth), (dashboard), (marketing)
      if (
        unwrapRouteGroups &&
        entry.isDirectory() &&
        entry.name.startsWith('(') &&
        entry.name.endsWith(')')
      ) {
        const groupName = entry.name.slice(1, -1);
        let groupChildren: fs.Dirent[] = [];
        try {
          groupChildren = fs.readdirSync(entryFull, { withFileTypes: true });
        } catch {
          continue;
        }
        const childDirs = groupChildren.filter(
          (c) => c.isDirectory() && !c.name.startsWith('_') && !c.name.startsWith('.')
        );
        if (childDirs.length > 0) {
          for (const childDir of childDirs) {
            registerFeature(childDir.name, path.join(entryFull, childDir.name));
          }
        } else {
          registerFeature(groupName, entryFull);
        }
        continue;
      }

      if (entry.isDirectory()) {
        registerFeature(entry.name, entryFull);
      } else if (
        entry.isFile() &&
        /\.(ts|tsx|js|jsx|dart|vue)$/i.test(entry.name) &&
        !/\.(spec|test|d)\.(ts|tsx|js|jsx|dart)$/i.test(entry.name)
      ) {
        registerFeature(entry.name, entryFull);
      }
    }
  };

  // 1. Explicit Feature / Module / Domain folders
  const moduleContainers = [
    'src/features',
    'features',
    'src/modules',
    'modules',
    'src/domains',
    'domains',
    'lib/features',
    'lib/modules',
  ];
  for (const c of moduleContainers) {
    scanContainerDir(c, false);
  }

  // 2. App Router / Pages / Screens / Views
  const routeContainers = [
    'src/app',
    'app',
    'src/pages',
    'pages',
    'src/screens',
    'screens',
    'src/views',
    'views',
    'lib/screens',
    'lib/presentation/screens',
    'lib/ui/screens',
    'lib/pages',
  ];
  for (const c of routeContainers) {
    scanContainerDir(c, true);
  }

  // 3. Backend Controllers / Routes / Resources
  const backendContainers = [
    'src/controllers',
    'controllers',
    'src/routes',
    'routes',
    'src/resources',
    'src/routers',
  ];
  for (const c of backendContainers) {
    scanContainerDir(c, false);
  }

  return Array.from(featureMap.entries())
    .map(([slug, data]) => ({
      slug,
      sourcePaths: Array.from(data.sourcePaths),
      sampleFiles: Array.from(data.sampleFiles),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

async function discoverSubApps(cwd: string): Promise<DiscoveredSubApp[]> {
  const candidateAppDirs: { name: string; fullPath: string; relPath: string }[] = [];

  // 1. Check monorepo workspace containers: apps/*, packages/*, services/*
  const monorepoContainers = ['apps', 'packages', 'services'];
  for (const container of monorepoContainers) {
    const containerPath = path.join(cwd, container);
    if (!(await fs.pathExists(containerPath))) continue;
    try {
      const entries = await fs.readdir(containerPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        const fullPath = path.join(containerPath, entry.name);
        const hasPkg = await fs.pathExists(path.join(fullPath, 'package.json'));
        const hasPubspec = await fs.pathExists(path.join(fullPath, 'pubspec.yaml'));
        const hasSrc =
          (await fs.pathExists(path.join(fullPath, 'src'))) ||
          (await fs.pathExists(path.join(fullPath, 'app'))) ||
          (await fs.pathExists(path.join(fullPath, 'lib')));
        if (hasPkg || hasPubspec || hasSrc) {
          candidateAppDirs.push({
            name: entry.name,
            fullPath,
            relPath: `${container}/${entry.name}`,
          });
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Check top-level multi-app folders (e.g., frontend/, backend/, mobile/, admin/, web/, api/, server/, client/)
  const rootMultiAppNames = new Set([
    'frontend',
    'backend',
    'web',
    'mobile',
    'server',
    'client',
    'admin',
    'api',
    'portal',
    'cms',
  ]);
  try {
    const rootEntries = await fs.readdir(cwd, { withFileTypes: true });
    for (const entry of rootEntries) {
      if (
        !entry.isDirectory() ||
        IGNORED_DIRS.has(entry.name) ||
        monorepoContainers.includes(entry.name)
      ) {
        continue;
      }
      const fullPath = path.join(cwd, entry.name);
      const hasPkg = await fs.pathExists(path.join(fullPath, 'package.json'));
      const hasPubspec = await fs.pathExists(path.join(fullPath, 'pubspec.yaml'));
      const isNamedSubApp =
        rootMultiAppNames.has(entry.name.toLowerCase()) &&
        (hasPkg ||
          hasPubspec ||
          (await fs.pathExists(path.join(fullPath, 'src'))) ||
          (await fs.pathExists(path.join(fullPath, 'app'))) ||
          (await fs.pathExists(path.join(fullPath, 'lib'))));

      if (hasPkg || hasPubspec || isNamedSubApp) {
        candidateAppDirs.push({
          name: entry.name,
          fullPath,
          relPath: entry.name,
        });
      }
    }
  } catch {
    // ignore
  }

  if (candidateAppDirs.length > 0) {
    const subApps: DiscoveredSubApp[] = [];
    for (const candidate of candidateAppDirs) {
      const { stacks } = await detectStackInDir(candidate.fullPath);
      const features = discoverFeaturesInApp(candidate.fullPath, cwd);
      subApps.push({
        name: candidate.name,
        relPath: candidate.relPath,
        stacks,
        features,
      });
    }
    return subApps;
  }

  // Fallback: Single-App at project root
  const { stacks } = await detectStackInDir(cwd);
  const features = discoverFeaturesInApp(cwd, cwd);
  return [
    {
      name: path.basename(cwd),
      relPath: '.',
      stacks,
      features,
    },
  ];
}

function buildTree(
  dirPath: string,
  prefix: string = '',
  depth: number = 0,
  maxDepth: number = 4
): string[] {
  if (depth > maxDepth) return [];
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const filtered = entries.filter((e) => {
    if (e.isDirectory()) return !IGNORED_DIRS.has(e.name);
    return !IGNORED_FILES.has(e.name);
  });

  filtered.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  const lines: string[] = [];
  const limit = 40;
  const sliced = filtered.slice(0, limit);

  sliced.forEach((entry, index) => {
    const isLast = index === sliced.length - 1 && filtered.length <= limit;
    const connector = isLast ? '└── ' : '├── ';
    lines.push(`${prefix}${connector}${entry.name}${entry.isDirectory() ? '/' : ''}`);

    if (entry.isDirectory()) {
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      lines.push(
        ...buildTree(
          path.join(dirPath, entry.name),
          childPrefix,
          depth + 1,
          maxDepth
        )
      );
    }
  });

  if (filtered.length > limit) {
    lines.push(`${prefix}└── ... (${filtered.length - limit} more items)`);
  }

  return lines;
}

function findSharedCandidates(
  dirPath: string,
  baseDir: string,
  depth: number = 0
): string[] {
  if (depth > 4) return [];
  const results: string[] = [];
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return results;
  }

  const targetFolders = new Set([
    'components',
    'ui',
    'shared',
    'common',
    'hooks',
    'utils',
    'lib',
    'services',
    'store',
    'stores',
    'features',
    'modules',
  ]);

  for (const entry of entries) {
    if (entry.isDirectory() && !IGNORED_DIRS.has(entry.name)) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      if (targetFolders.has(entry.name.toLowerCase())) {
        try {
          const children = fs
            .readdirSync(fullPath)
            .filter((f) => !f.startsWith('.'))
            .slice(0, 25);
          results.push(`- \`${relPath}/\`: ${children.join(', ') || '(empty)'}`);
        } catch {
          // ignore
        }
      }
      results.push(...findSharedCandidates(fullPath, baseDir, depth + 1));
    }
  }
  return results;
}

export async function scanProjectStructure(
  cwd: string = process.cwd(),
  workspaceRelDir: string = '.cursor/workspace'
): Promise<ScanResult> {
  const rootDetection = await detectStackInDir(cwd);
  const subApps = await discoverSubApps(cwd);
  const isMultiApp =
    subApps.length > 1 || (subApps.length === 1 && subApps[0].relPath !== '.');

  const stackSet = new Set<string>(rootDetection.stacks);
  const depSet = new Set<string>(rootDetection.deps);

  for (const app of subApps) {
    app.stacks.forEach((s) => stackSet.add(s));
    if (app.relPath !== '.') {
      const subDet = await detectStackInDir(path.join(cwd, app.relPath));
      subDet.deps.forEach((d) => {
        if (depSet.size < 60) depSet.add(d);
      });
    }
  }

  const detectedStacks = Array.from(stackSet);
  const dependencies = Array.from(depSet).slice(0, 60);

  const treeLines = buildTree(cwd, '', 0, 3);
  const directoryTree =
    treeLines.length > 0 ? treeLines.join('\n') : '(Empty directory)';

  const sharedFiles = findSharedCandidates(cwd, cwd, 0);

  const totalFeaturesCount = subApps.reduce(
    (sum, app) => sum + app.features.length,
    0
  );

  const featuresReportSections = subApps
    .map((app) => {
      const appHeader = isMultiApp
        ? `### Sub-App: \`${app.name}\` (Path: \`${app.relPath}/\`, Stack: ${app.stacks.join(', ') || 'Custom'})`
        : `### Main Application (\`${app.name}\`)`;

      if (app.features.length === 0) {
        return `${appHeader}\n- *(No standard feature folders auto-detected — Architect Agent should inspect source tree above to identify business features)*`;
      }

      const featureLines = app.features.map((feat) => {
        const targetVaultFile = isMultiApp
          ? `${workspaceRelDir}/features/${app.name}/${feat.slug}.md`
          : `${workspaceRelDir}/features/${feat.slug}.md`;
        const pathsStr = feat.sourcePaths.map((p) => `\`${p}\``).join(', ');
        const samplesStr =
          feat.sampleFiles.length > 0
            ? `\n  - Sample files to inspect flow: ${feat.sampleFiles.map((f) => `\`${f}\``).join(', ')}`
            : '';
        return `- **Feature \`${feat.slug}\`** -> Target Vault File: \`${targetVaultFile}\`\n  - Source locations: ${pathsStr}${samplesStr}`;
      });

      return `${appHeader}\n${featureLines.join('\n')}`;
    })
    .join('\n\n');

  const reportMarkdown = `# AUTOMATED PROJECT STRUCTURE & FEATURE SCAN REPORT

> Generated automatically by the CLI Scanner (0 tokens).
> Run \`@onboard\` (or \`/onboard\`) so the **Architect Agent** analyzes this report, populates \`${workspaceRelDir}/PROJECT_MEMORY.md\`, AND generates detailed feature flow specs inside \`${workspaceRelDir}/features/\`!

## 1. Project Topology & Detected Tech Stack
- **Architecture Topology:** ${isMultiApp ? `Multi-App / Monorepo (${subApps.length} Sub-Apps: ${subApps.map((a) => `\`${a.name}\``).join(', ')})` : 'Single-App Repository'}
${detectedStacks.length > 0 ? detectedStacks.map((s) => `- **${s}**`).join('\n') : '- Custom / Unspecified stack'}

## 2. Primary Dependencies
${dependencies.length > 0 ? dependencies.map((d) => `\`${d}\``).join(', ') : '*(No dependencies detected)*'}

## 3. Directory Tree (Filtered build & dependency folders)
\`\`\`text
${path.basename(cwd)}/
${directoryTree}
\`\`\`

## 4. Discovered Shared / UI / Utility / Module Directories
${sharedFiles.length > 0 ? sharedFiles.join('\n') : '- No standard shared folders (components, hooks, utils, features) detected yet'}

## 5. Discovered Sub-Apps & Existing Features (Target for \`${workspaceRelDir}/features/\`)
${featuresReportSections}

---
## Mandatory Instructions for Architect Agent (\`@onboard\` / \`/onboard\`):
1. **Analyze Topology & Coding Conventions:** Review the directory tree, sub-apps, and shared folders above. Inspect 2–3 representative source files to infer existing Coding Conventions.
2. **Deep-Scan & Generate Feature Vault Files (\`${workspaceRelDir}/features/\`):**
   - For **EVERY existing feature** listed in Section 5 (plus any additional business features you spot in the directory tree):
   - Read its entry files (routes/pages/screens, controllers, hooks/stores, API services) to understand **how the current feature flow works end-to-end**.
   - **Create its corresponding Feature Vault file:**
     - **Single-App Project:** \`${workspaceRelDir}/features/<feature-slug>.md\`
     - **Multi-App Project (Multiple Sub-Apps):** Group by sub-app folder -> \`${workspaceRelDir}/features/<app-name>/<feature-slug>.md\`
   - Each generated feature file MUST contain:
     1. **Overview & Business Purpose**
     2. **Current End-to-End Flow:** Step-by-step trace of how the feature works right now (UI/Entry -> State/Hook -> Service/API -> Database/Response) and existing validation/business rules.
     3. **Architecture & Key Source Files:** Exact file paths belonging to this feature.
     4. **Related APIs, State Stores & Data Models**
     5. **Change History:** \`[Onboarded] Initial baseline scanned from existing codebase\`.
3. **Populate \`${workspaceRelDir}/PROJECT_MEMORY.md\`:**
   - Fill out Section 1 (Tech Stack & Conventions), Section 2 (Directory Structure), and Section 3 (Shared Registry).
   - Fill out **Section 4 (Feature Index)**: List **all existing features** (grouped by Sub-App if this is a Multi-App project!) with direct links to their newly created \`${workspaceRelDir}/features/.../*.md\` files.
4. **Cleanup:** Save current Git \`HEAD\` commit hash into \`${workspaceRelDir}/sync-state.json\` and delete this temporary \`scan-report.md\` file once onboarding is 100% complete.
`;

  const outPath = path.join(cwd, workspaceRelDir, 'scan-report.md');
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, reportMarkdown, 'utf-8');

  return {
    detectedStacks,
    dependencies,
    directoryTree,
    sharedFiles,
    isMultiApp,
    subApps,
    totalFeaturesCount,
    reportMarkdown,
  };
}

