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
  // STEP 1: Select Target AI Platforms (Cursor, Claude, Codex, Antigravity)
  // ============================================================================
  const selectedPlatforms = (await p.multiselect({
    message:
      'Step 1: Which AI platforms are you using? (Space to toggle, Enter to confirm)',
    options: [
      {
        value: 'cursor',
        label: 'Cursor IDE',
        hint: 'Generates .cursor/rules/*.mdc (@auto, @ba, @arch, @dev, @qa, @doc, @hotfix, @sync)',
      },
      {
        value: 'claude',
        label: 'Claude Code (CLI)',
        hint: 'Generates CLAUDE.md, .claude/agents/ (Subagents) & .claude/commands/ (/auto, /ba...)',
      },
      {
        value: 'antigravity',
        label: 'Google Antigravity',
        hint: 'Generates .agents/workflows/, .agents/skills/ & AGENTS.md',
      },
      {
        value: 'codex',
        label: 'OpenAI Codex',
        hint: 'Generates AGENTS.md & .agents/skills/',
      },
    ],
    required: true,
    initialValues: ['cursor', 'claude'],
  })) as AIPlatform[];
  checkCancel(selectedPlatforms);

  // ============================================================================
  // STEP 2: New Project (Greenfield) vs Existing Project (Brownfield)
  // ============================================================================
  const projectMode = (await p.select({
    message: 'Step 2: Is this a New Project or an Existing Project?',
    options: [
      {
        value: 'new',
        label: '1. New Project (Greenfield)',
        hint: 'Choose FE / BE / Mobile / Fullstack preset to scaffold standard directory structure',
      },
      {
        value: 'existing',
        label: '2. Existing Project (Brownfield)',
        hint: 'Automatically scan current folder tree, UI & shared files for AI onboarding',
      },
    ],
  })) as 'new' | 'existing';
  checkCancel(projectMode);

  let category: ProjectCategory = 'none';
  let feStack = 'none';
  let beStack = 'none';
  let mobileStack = 'none';
  const suggestedSkills = new Set<TechSkillId>();

  if (projectMode === 'existing') {
    // Step 2.1: Existing Project -> Run automated scanner
    const s = p.spinner();
    s.start('Scanning directory structure, dependencies, and shared modules...');
    const scanRes = await scanProjectStructure(cwd);
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
        { value: 'fe', label: '1. Frontend (FE)', hint: 'Next.js, React.js, None' },
        {
          value: 'be',
          label: '2. Backend (BE)',
          hint: 'Next.js / NestJS, ElysiaJS, None',
        },
        {
          value: 'mobile',
          label: '3. Mobile App',
          hint: 'React Native, Flutter, None',
        },
        {
          value: 'fullstack',
          label: '4. Fullstack (Web FE + BE)',
          hint: 'Select both FE and BE stacks',
        },
        {
          value: 'none',
          label: '5. None (Blank directory structure)',
          hint: 'Define custom structure later',
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
  // STEP 3: Select Tech Skills for Dev Agent (Loop until DONE)
  // ============================================================================
  const selectedSkills = new Set<TechSkillId>(suggestedSkills);

  let choosingSkills = true;
  while (choosingSkills) {
    const currentList =
      selectedSkills.size > 0
        ? Array.from(selectedSkills).join(', ')
        : 'None selected';

    const action = (await p.select({
      message: `Step 3: Select Tech Skills for Dev Agent [Selected: ${pc.cyan(currentList)}]`,
      options: [
        ...AVAILABLE_TECH_SKILLS.map((sk) => {
          const isAdded = selectedSkills.has(sk.id);
          return {
            value: sk.id,
            label: `${isAdded ? pc.green('✔ [Selected]') : '[ + ]'} ${sk.name} (${sk.id})`,
            hint: sk.description,
          };
        }),
        {
          value: '__DONE__',
          label: pc.bold(
            pc.green('✅ DONE - Confirm selected skills and initialize workspace')
          ),
          hint: 'Proceed with initialization',
        },
      ],
    })) as string;
    checkCancel(action);

    if (action === '__DONE__') {
      choosingSkills = false;
    } else {
      const skillId = action as TechSkillId;
      if (selectedSkills.has(skillId)) {
        selectedSkills.delete(skillId);
      } else {
        selectedSkills.add(skillId);
      }
    }
  }

  const finalSkills = Array.from(selectedSkills);

  // ============================================================================
  // GENERATE WORKSPACE & PLATFORM ADAPTERS
  // ============================================================================
  const spinner = p.spinner();
  spinner.start('Generating 5-Agent system, 3-tier memory (.ai-workspace), and adapters...');

  const workspaceDir = path.join(cwd, '.ai-workspace');
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
  });
  await fs.writeFile(memoryPath, memoryContent, 'utf-8');

  const changelogPath = path.join(workspaceDir, 'CHANGELOG_DOC.md');
  if (!(await fs.pathExists(changelogPath))) {
    await fs.writeFile(changelogPath, generateInitialChangelogDoc(), 'utf-8');
  }

  const currentHead = getCurrentCommit(cwd);
  await writeSyncState(
    {
      lastSyncedCommit: currentHead,
      lastSyncedAt: now,
      note: 'Initial commit checkpoint recorded at init',
    },
    cwd
  );

  await applyPlatformAdapters(cwd, selectedPlatforms, finalSkills);

  spinner.stop(pc.green('Multi-Agent Workspace initialized successfully!'));

  const nextSteps: string[] = [
    `${pc.bold('1. Enabled Platforms:')} ${pc.cyan(selectedPlatforms.join(', '))}`,
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
      `  Structural scan saved to ${pc.underline('.ai-workspace/scan-report.md')}.`,
      `  👉 Open your IDE/CLI chat and type: ${pc.bold(pc.green('@onboard'))} (or ${pc.bold(pc.green('/onboard'))})`,
      `     so the Architect Agent populates ${pc.underline('PROJECT_MEMORY.md')}!`
    );
  } else {
    nextSteps.push(
      '',
      pc.bold('⚡ Daily Commands:'),
      `  • Full Auto-Pilot (A -> Z):    Type ${pc.green('@auto <feature description>')} (or ${pc.green('/auto')})`,
      `  • Step-by-Step Control:        Type ${pc.cyan('@ba')} -> ${pc.cyan('@arch')} -> ${pc.cyan('@dev')} -> ${pc.cyan('@qa')} -> ${pc.cyan('@doc')}`,
      `  • Fast-Track Bugfix:           Type ${pc.yellow('@hotfix <bug description>')}`,
      `  • Sync Manual Git Commits:     Run ${pc.magenta('npx ai-team sync')} or type ${pc.magenta('@sync')}`
    );
  }

  p.note(nextSteps.join('\n'), '🎉 Setup Complete');
  p.outro(pc.cyan('Happy coding with your Multi-Agent Engineering Team!'));
}
