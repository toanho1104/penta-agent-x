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

export interface ScanResult {
  detectedStacks: string[];
  dependencies: string[];
  directoryTree: string;
  sharedFiles: string[];
  reportMarkdown: string;
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
  const detectedStacks: string[] = [];
  const dependencies: string[] = [];

  const pkgPath = path.join(cwd, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    try {
      const pkg = await fs.readJson(pkgPath);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };
      const depNames = Object.keys(allDeps);
      dependencies.push(...depNames.slice(0, 50));

      if (allDeps['next']) detectedStacks.push('Next.js');
      if (allDeps['react-native'] || allDeps['expo'])
        detectedStacks.push('React Native');
      if (allDeps['react'] && !allDeps['next'] && !allDeps['react-native'])
        detectedStacks.push('React.js');
      if (allDeps['elysia']) detectedStacks.push('ElysiaJS');
      if (allDeps['@nestjs/core']) detectedStacks.push('NestJS');
      if (allDeps['tailwindcss']) detectedStacks.push('TailwindCSS');
      if (allDeps['zustand']) detectedStacks.push('Zustand');
      if (allDeps['@reduxjs/toolkit']) detectedStacks.push('Redux Toolkit');
      if (allDeps['prisma'] || allDeps['@prisma/client'])
        detectedStacks.push('Prisma ORM');
    } catch {
      // ignore
    }
  }

  const pubspecPath = path.join(cwd, 'pubspec.yaml');
  if (await fs.pathExists(pubspecPath)) {
    detectedStacks.push('Flutter / Dart');
  }

  const treeLines = buildTree(cwd, '', 0, 3);
  const directoryTree =
    treeLines.length > 0 ? treeLines.join('\n') : '(Empty directory)';

  const sharedFiles = findSharedCandidates(cwd, cwd, 0);

  const reportMarkdown = `# AUTOMATED PROJECT STRUCTURE SCAN REPORT

> Generated automatically by the CLI Scanner (0 tokens).
> Run \`@onboard\` (or \`/onboard\`) so the **Architect Agent** analyzes this report and populates \`${workspaceRelDir}/PROJECT_MEMORY.md\`.

## 1. Detected Tech Stack
${detectedStacks.length > 0 ? detectedStacks.map((s) => `- **${s}**`).join('\n') : '- Custom / Unspecified stack'}

## 2. Primary Dependencies
${dependencies.length > 0 ? dependencies.map((d) => `\`${d}\``).join(', ') : '*(No dependencies detected)*'}

## 3. Directory Tree (Filtered build & dependency folders)
\`\`\`text
${path.basename(cwd)}/
${directoryTree}
\`\`\`

## 4. Discovered Shared / UI / Utility / Feature Directories
${sharedFiles.length > 0 ? sharedFiles.join('\n') : '- No standard shared folders (components, hooks, utils, features) detected yet'}

---
## Instructions for Architect Agent (\`project-onboarding\`):
1. Review the directory tree and shared folders above.
2. Inspect 1–2 representative source files to infer existing Coding Conventions.
3. Populate \`${workspaceRelDir}/PROJECT_MEMORY.md\` (Tech Stack, Directory Structure, Shared Registry, and Feature Index).
4. Delete this temporary \`scan-report.md\` file once \`PROJECT_MEMORY.md\` is updated.
`;

  const outPath = path.join(cwd, workspaceRelDir, 'scan-report.md');
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, reportMarkdown, 'utf-8');

  return {
    detectedStacks,
    dependencies,
    directoryTree,
    sharedFiles,
    reportMarkdown,
  };
}
