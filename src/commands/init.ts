import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'fs-extra';
import path from 'path';
import {
  AIPlatform,
  ProjectCategory,
  TechSkillId,
  WorkspaceConfig,
} from '../types';
import {
  generateInitialChangelogDoc,
  generateInitialProjectMemory,
} from '../templates/project-structures';
import { AVAILABLE_TECH_SKILLS } from '../templates/skills';
import { applyPlatformAdapters } from '../utils/platform-adapter';
import { scanProjectStructure } from '../utils/tree-scanner';
import { getCurrentCommit, writeSyncState } from '../utils/git';
import { getPlatformRootDir, getWorkspaceRelDir } from '../utils/workspace-paths';

function checkCancel(value: unknown): void {
  if (p.isCancel(value)) {
    p.cancel('Initialization cancelled.');
    process.exit(0);
  }
}

export async function runInitCommand(cwd: string = process.cwd()): Promise<void> {
  console.clear();
  p.intro(
    pc.bgCyan(
      pc.black(' 🚀 AI AGENT SKILL & MULTI-AGENT WORKSPACE INITIALIZER ')
    )
  );

  // ============================================================================
  // STEP 1: Select Target AI Platform (Single choice: Cursor, Claude, Antigravity, Codex)
  // ============================================================================
  const selectedPlatform = (await p.select({
    message: 'Step 1: Which AI platform are you using?',
    options: [
      {
        value: 'cursor',
        label: 'Cursor IDE',
        hint: '.cursor/rules/*.mdc',
      },
      {
        value: 'claude',
        label: 'Claude Code (CLI)',
        hint: 'CLAUDE.md & .claude/',
      },
      {
        value: 'antigravity',
        label: 'Google Antigravity',
        hint: '.agents/skills & rules',
      },
      {
        value: 'codex',
        label: 'OpenAI Codex',
        hint: 'AGENTS.md & .agents/skills',
      },
    ],
    initialValue: 'cursor',
  })) as AIPlatform;
  checkCancel(selectedPlatform);
  const selectedPlatforms: AIPlatform[] = [selectedPlatform];

  // ============================================================================
  // STEP 2: New Project (Greenfield) vs Existing Project (Brownfield)
  // ============================================================================
  const projectMode = (await p.select({
    message: 'Step 2: Is this a New Project or an Existing Project?',
    options: [
      {
        value: 'new',
        label: '1. New Project (Greenfield)',
        hint: 'Scaffold standard directory tree',
      },
      {
        value: 'existing',
        label: '2. Existing Project (Brownfield)',
        hint: 'Auto-scan current codebase',
      },
    ],
  })) as 'new' | 'existing';
  checkCancel(projectMode);

  let category: ProjectCategory = 'none';
  let feStack = 'none';
  let beStack = 'none';
  let mobileStack = 'none';
  const suggestedSkills = new Set<TechSkillId>();

  const workspaceRelDir = getWorkspaceRelDir(selectedPlatform);
  const platformRootDir = getPlatformRootDir(selectedPlatform);

  if (projectMode === 'existing') {
    // Step 2.1: Existing Project -> Run automated scanner
    const s = p.spinner();
    s.start('Scanning directory structure, dependencies, and shared modules...');
    const scanRes = await scanProjectStructure(cwd, workspaceRelDir);
    s.stop(
      `Project scan complete! Detected: ${
        scanRes.detectedStacks.length > 0
          ? pc.green(scanRes.detectedStacks.join(', '))
          : pc.yellow('Custom stack')
      }`
    );

    if (scanRes.detectedStacks.includes('Next.js')) suggestedSkills.add('nextjs');
    if (scanRes.detectedStacks.includes('React Native'))
      suggestedSkills.add('react-native');
    if (scanRes.detectedStacks.includes('React.js'))
      suggestedSkills.add('reactjs');
    if (scanRes.detectedStacks.includes('ElysiaJS'))
      suggestedSkills.add('elysiajs');
    if (scanRes.detectedStacks.includes('NestJS')) suggestedSkills.add('nestjs');
    if (scanRes.detectedStacks.includes('Flutter / Dart'))
      suggestedSkills.add('flutter');
  } else {
    // Step 2.2: New Project -> 5 Options (FE, BE, Mobile, Fullstack, None)
    category = (await p.select({
      message: 'Step 2.2: Select project category:',
      options: [
        { value: 'fe', label: '1. Frontend (FE)', hint: 'Next.js, React.js' },
        {
          value: 'be',
          label: '2. Backend (BE)',
          hint: 'Next.js, NestJS, ElysiaJS',
        },
        {
          value: 'mobile',
          label: '3. Mobile App',
          hint: 'React Native, Flutter',
        },
        {
          value: 'fullstack',
          label: '4. Fullstack (FE + BE)',
          hint: 'Combine Web FE & BE',
        },
        {
          value: 'none',
          label: '5. None (Blank)',
          hint: 'Custom structure',
        },
      ],
    })) as ProjectCategory;
    checkCancel(category);

    // Step 2.2.1: Select FE
    if (category === 'fe' || category === 'fullstack') {
      feStack = (await p.select({
        message:
          category === 'fullstack'
            ? 'Step 2.2.4.1: Select Frontend (FE) stack:'
            : 'Step 2.2.1: Select Frontend (FE) stack:',
        options: [
          { value: 'nextjs', label: 'Next.js (App Router)' },
          { value: 'reactjs', label: 'React.js (SPA / Vite)' },
          { value: 'none', label: 'None (Blank)' },
        ],
      })) as string;
      checkCancel(feStack);
      if (feStack === 'nextjs') suggestedSkills.add('nextjs');
      if (feStack === 'reactjs') suggestedSkills.add('reactjs');
    }

    // Step 2.2.2: Select BE
    if (category === 'be' || category === 'fullstack') {
      beStack = (await p.select({
        message:
          category === 'fullstack'
            ? 'Step 2.2.4.2: Select Backend (BE) stack:'
            : 'Step 2.2.2: Select Backend (BE) stack:',
        options: [
          { value: 'nextjs', label: 'Next.js (API Routes / Server Actions)' },
          { value: 'elysiajs', label: 'ElysiaJS (Bun)' },
          { value: 'nestjs', label: 'NestJS (Enterprise Node.js)' },
          { value: 'none', label: 'None (Blank)' },
        ],
      })) as string;
      checkCancel(beStack);
      if (beStack === 'nextjs') suggestedSkills.add('nextjs');
      if (beStack === 'elysiajs') suggestedSkills.add('elysiajs');
      if (beStack === 'nestjs') suggestedSkills.add('nestjs');
    }

    // Step 2.2.3: Select Mobile
    if (category === 'mobile') {
      mobileStack = (await p.select({
        message: 'Step 2.2.3: Select Mobile stack:',
        options: [
          { value: 'react-native', label: 'React Native / Expo' },
          { value: 'flutter', label: 'Flutter & Dart' },
          { value: 'none', label: 'None (Blank)' },
        ],
      })) as string;
      checkCancel(mobileStack);
      if (mobileStack === 'react-native') suggestedSkills.add('react-native');
      if (mobileStack === 'flutter') suggestedSkills.add('flutter');
    }
  }

  // ============================================================================
  // STEP 3: Select Tech Skills for Dev Agent (Space to toggle, Enter to confirm)
  // ============================================================================
  const finalSkills = (await p.multiselect({
    message:
      'Step 3: Select Tech Skills for Dev Agent (Space to toggle, Enter to finish)',
    options: AVAILABLE_TECH_SKILLS.map((sk) => ({
      value: sk.id,
      label: sk.name,
      hint: sk.category,
    })),
    required: false,
    initialValues: Array.from(suggestedSkills),
  })) as TechSkillId[];
  checkCancel(finalSkills);

  // ============================================================================
  // STEP 4: Track in Git or Add to .gitignore (Yes / No)
  // ============================================================================
  const pushToGit = (await p.select({
    message: 'Step 4: Do you want to push the AI workspace to Git?',
    options: [
      {
        value: true,
        label: 'Yes — Track in Git',
        hint: 'Share AI rules & memory with team',
      },
      {
        value: false,
        label: 'No  — Add to .gitignore',
        hint: 'Keep local only on your machine',
      },
    ],
    initialValue: true,
  })) as boolean;
  checkCancel(pushToGit);

  // ============================================================================
  // GENERATE UNIFIED WORKSPACE & PLATFORM ADAPTER
  // ============================================================================
  const spinner = p.spinner();
  spinner.start(
    `Generating 5-Agent system & 3-tier memory inside ${pc.cyan(platformRootDir + '/')}...`
  );

  const workspaceDir = path.join(cwd, workspaceRelDir);
  await fs.ensureDir(path.join(workspaceDir, 'active'));
  await fs.ensureDir(path.join(workspaceDir, 'features'));

  await fs.writeFile(
    path.join(workspaceDir, 'active', '.gitkeep'),
    '# Temporary scratchpad for the single active feature in progress (spec.md, ui-spec.md, plan.md, review-report.md)\n',
    'utf-8'
  );
  await fs.writeFile(
    path.join(workspaceDir, 'features', '.gitkeep'),
    '# Long-term feature knowledge vault (<feature-name>.md)\n',
    'utf-8'
  );

  const now = new Date().toISOString();
  const config: WorkspaceConfig = {
    version: '1.0.0',
    platforms: selectedPlatforms,
    projectMode,
    projectCategory: category,
    selectedStack: {
      fe: feStack !== 'none' ? feStack : undefined,
      be: beStack !== 'none' ? beStack : undefined,
      mobile: mobileStack !== 'none' ? mobileStack : undefined,
    },
    installedTechSkills: finalSkills,
    workflowMode: 'full-auto',
    createdAt: now,
    updatedAt: now,
  };
  await fs.writeJson(path.join(workspaceDir, 'config.json'), config, {
    spaces: 2,
  });

  const memoryPath = path.join(workspaceDir, 'PROJECT_MEMORY.md');
  const memoryContent = generateInitialProjectMemory({
    projectMode,
    category,
    feStack,
    beStack,
    mobileStack,
    installedSkills: finalSkills,
    workspaceRelDir,
  });
  await fs.writeFile(memoryPath, memoryContent, 'utf-8');

  const changelogPath = path.join(workspaceDir, 'CHANGELOG_DOC.md');
  if (!(await fs.pathExists(changelogPath))) {
    await fs.writeFile(
      changelogPath,
      generateInitialChangelogDoc(workspaceRelDir),
      'utf-8'
    );
  }

  const currentHead = getCurrentCommit(cwd);
  await writeSyncState(
    {
      lastSyncedCommit: currentHead,
      lastSyncedAt: now,
      note: 'Initial commit checkpoint recorded at init',
    },
    cwd,
    workspaceRelDir
  );

  await applyPlatformAdapters(cwd, selectedPlatforms, finalSkills);

  if (!pushToGit) {
    const gitignorePath = path.join(cwd, '.gitignore');
    let gitignoreContent = '';
    if (await fs.pathExists(gitignorePath)) {
      gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
    }

    const entriesToIgnore: string[] = [`${platformRootDir}/`];
    if (selectedPlatform === 'claude') {
      entriesToIgnore.push('CLAUDE.md');
    } else if (selectedPlatform === 'antigravity' || selectedPlatform === 'codex') {
      entriesToIgnore.push('AGENTS.md');
    }

    const existingLines = new Set(
      gitignoreContent
        .split(/\r?\n/)
        .map((line) => line.trim())
    );
    const missingEntries = entriesToIgnore.filter(
      (entry) =>
        !existingLines.has(entry) &&
        !existingLines.has(entry.replace(/\/$/, '')) &&
        !existingLines.has(`/${entry}`)
    );

    if (missingEntries.length > 0) {
      const prefix =
        gitignoreContent.length > 0 && !gitignoreContent.endsWith('\n')
          ? '\n'
          : '';
      const block = `${prefix}\n# AI Agent Workspace (penta-agent-x)\n${missingEntries.join('\n')}\n`;
      await fs.writeFile(gitignorePath, gitignoreContent + block, 'utf-8');
    }
  }

  spinner.stop(
    pc.green(`All files generated inside ${pc.bold(platformRootDir + '/')}!`)
  );

  const nextSteps: string[] = [
    `${pc.bold('1. Unified Directory:')} ${pc.cyan(platformRootDir + '/')} (${
      pushToGit ? pc.green('Tracked in Git') : pc.yellow('Added to .gitignore')
    })`,
    `${pc.bold('2. Installed Tech Skills:')} ${
      finalSkills.length > 0 ? pc.green(finalSkills.join(', ')) : pc.yellow('(None)')
    }`,
    `${pc.bold('3. Initial Git Checkpoint (lastSyncedCommit):')} ${
      currentHead ? pc.magenta(currentHead.slice(0, 8)) : pc.gray('(No Git commit yet)')
    }`,
  ];

  if (projectMode === 'existing') {
    nextSteps.push(
      '',
      pc.bgYellow(pc.black(' ⚡ NEXT STEP FOR EXISTING PROJECT: ')),
      `  Structural scan saved to ${pc.underline(`${workspaceRelDir}/scan-report.md`)}.`,
      `  👉 Open your IDE/CLI chat and type: ${pc.bold(pc.green('@onboard'))} (or ${pc.bold(pc.green('/onboard'))})`,
      `     so the Architect Agent populates ${pc.underline(`${workspaceRelDir}/PROJECT_MEMORY.md`)}!`
    );
  } else {
    nextSteps.push(
      '',
      pc.bold('⚡ Daily Commands:'),
      `  • Full Auto-Pilot (A -> Z):    Type ${pc.green('@auto <feature description>')} (or ${pc.green('/auto')})`,
      `  • Step-by-Step Control:        Type ${pc.cyan('@ba')} -> ${pc.cyan('@arch')} -> ${pc.cyan('@dev')} -> ${pc.cyan('@qa')} -> ${pc.cyan('@doc')}`,
      `  • Fast-Track Bugfix:           Type ${pc.yellow('@hotfix <bug description>')}`,
      `  • Sync Manual Git Commits:     Run ${pc.magenta('npx penta-agent-x sync')} or type ${pc.magenta('@sync')}`
    );
  }

  p.note(nextSteps.join('\n'), '🎉 Setup Complete');
  p.outro(pc.cyan('Happy coding with your Multi-Agent Engineering Team!'));
}
