import fs from 'fs-extra';
import path from 'path';
import { AIPlatform, TechSkillId } from '../types';
import { CORE_AGENTS, UTILITY_WORKFLOWS, AgentTemplate } from '../templates/agents';
import { TECH_SKILLS_REGISTRY } from '../templates/skills';
import {
  getSkillsRelDir,
  getWorkspaceRelDir,
  localizePromptPaths,
} from './workspace-paths';

async function writePlatformSkills(
  cwd: string,
  platform: AIPlatform,
  installedSkills: TechSkillId[]
): Promise<void> {
  const skillsRel = getSkillsRelDir(platform);
  const skillsDir = path.join(cwd, skillsRel);
  await fs.ensureDir(skillsDir);

  for (const skillId of installedSkills) {
    const skill = TECH_SKILLS_REGISTRY[skillId];
    if (!skill) continue;
    const folderName =
      platform === 'antigravity' || platform === 'codex'
        ? `${skill.id}-skill`
        : skill.id;
    const skillFolder = path.join(skillsDir, folderName);
    await fs.ensureDir(skillFolder);
    const frontmatter = `---\nname: ${skill.id}-skill\ndescription: ${skill.description}\n---\n\n`;
    const localizedSkill = localizePromptPaths(skill.content, platform);
    await fs.writeFile(
      path.join(skillFolder, 'SKILL.md'),
      frontmatter + localizedSkill,
      'utf-8'
    );
  }
}

async function generateCursorAdapter(
  cwd: string,
  installedSkills: TechSkillId[]
): Promise<void> {
  const platform: AIPlatform = 'cursor';
  const wsRel = getWorkspaceRelDir(platform);
  const rulesDir = path.join(cwd, '.cursor', 'rules');
  const commandsDir = path.join(cwd, '.cursor', 'commands');
  await fs.ensureDir(rulesDir);
  await fs.ensureDir(commandsDir);

  // 1. Always-applied core workspace rule
  const coreMdc = `---
description: Core Multi-Agent Workspace Architecture & Commands (@auto, @ba, @arch, @dev, @qa, @doc, @hotfix, @sync, @onboard)
alwaysApply: true
---

# MULTI-AGENT SYSTEM & CONTEXT ENGINEERING (\`${wsRel}\`)

This project uses **Multi-Agent Context Isolation** powered by \`${wsRel}/\`.

## Single Source of Truth
- Always read \`${wsRel}/PROJECT_MEMORY.md\` first before planning or writing code.
- Detailed feature specifications are archived in \`${wsRel}/features/<feature-name>.md\`.
- Temporary scratchpad files for the active feature in progress live in \`${wsRel}/active/\`.

## Available Agent Mentions (Type \`@<command>\` or \`/<command>\` in Cursor Chat)
- \`@auto\` / \`/auto\`: **End-to-End Auto-Pilot (A -> Z)** running BA -> Architect -> Dev -> QA -> Doc automatically.
- \`@ba\` / \`/ba\`: **BA / Product Agent** — Analyzes requirements & UI mockups -> outputs \`active/spec.md\` & \`active/ui-spec.md\`.
- \`@arch\` / \`/arch\`: **Architect / Tech Lead Agent** — Designs technical architecture & atomic tasks -> outputs \`active/plan.md\`.
- \`@dev\` / \`/dev\`: **Dev Agent** — Executes atomic tasks from \`active/plan.md\` using installed Tech Skills.
- \`@qa\` / \`/qa\`: **QA / Reviewer Agent** — Audits code changes against Spec & Plan and writes tests -> outputs \`active/review-report.md\`.
- \`@doc\` / \`/doc\`: **Doc / Memory Keeper Agent** — Compacts completed context into \`features/\`, updates \`PROJECT_MEMORY.md\`, \`CHANGELOG_DOC.md\`, updates \`lastSyncedCommit\`, and cleans \`active/\`.
- \`@hotfix\` / \`/hotfix\`: **Fast-Track Hotfix Mode** — Rapidly fixes a small bug at the selected code lines without full 5-step ceremony.
- \`@sync\` / \`/sync\`: **Git Commit Checkpoint Sync** — Synchronizes manual Git commits from \`lastSyncedCommit..HEAD\`.
- \`@onboard\` / \`/onboard\`: **Project Onboarding** — Reads \`${wsRel}/scan-report.md\` to initialize \`PROJECT_MEMORY.md\` for existing codebases.
`;
  await fs.writeFile(path.join(rulesDir, '00-workspace-core.mdc'), coreMdc, 'utf-8');

  // 2. Individual @agent rules (.cursor/rules/*.mdc) AND /agent slash commands (.cursor/commands/*.md)
  const allAgents: AgentTemplate[] = [...CORE_AGENTS, ...UTILITY_WORKFLOWS];
  for (const agent of allAgents) {
    const localizedPrompt = localizePromptPaths(agent.systemPrompt, platform);
    const mdcContent = `---
description: ${agent.name} - ${agent.roleDescription}
alwaysApply: false
---

${localizedPrompt}
`;
    await fs.writeFile(path.join(rulesDir, `${agent.slug}.mdc`), mdcContent, 'utf-8');
    await fs.writeFile(
      path.join(commandsDir, `${agent.slug}.md`),
      localizedPrompt,
      'utf-8'
    );
  }

  // 3. Tech Skill rules with auto-matching globs for Cursor
  for (const skillId of installedSkills) {
    const skill = TECH_SKILLS_REGISTRY[skillId];
    if (!skill) continue;
    const globsStr = skill.globs.join(', ');
    const localizedSkill = localizePromptPaths(skill.content, platform);
    const skillMdc = `---
description: Tech Skill (${skill.name}) - ${skill.description}
globs: ${globsStr}
alwaysApply: false
---

${localizedSkill}
`;
    await fs.writeFile(
      path.join(rulesDir, `tech-${skill.id}.mdc`),
      skillMdc,
      'utf-8'
    );
  }

  await writePlatformSkills(cwd, platform, installedSkills);
}

async function generateClaudeAdapter(
  cwd: string,
  installedSkills: TechSkillId[]
): Promise<void> {
  const platform: AIPlatform = 'claude';
  const wsRel = getWorkspaceRelDir(platform);
  const skillsRel = getSkillsRelDir(platform);
  const claudeAgentsDir = path.join(cwd, '.claude', 'agents');
  const claudeCommandsDir = path.join(cwd, '.claude', 'commands');
  await fs.ensureDir(claudeAgentsDir);
  await fs.ensureDir(claudeCommandsDir);

  // 1. Native Subagents in .claude/agents/ (Isolated context windows in Claude Code)
  const roleAgents = CORE_AGENTS.filter((a) => a.slug !== 'auto');
  for (const agent of roleAgents) {
    const localizedPrompt = localizePromptPaths(agent.systemPrompt, platform);
    const subagentFile = `---
name: ${agent.slug}-agent
description: ${agent.roleDescription}
---

${localizedPrompt}
`;
    await fs.writeFile(
      path.join(claudeAgentsDir, `${agent.slug}-agent.md`),
      subagentFile,
      'utf-8'
    );
  }

  // 2. Slash commands in .claude/commands/ (/auto, /ba, /arch, /dev, /qa, /doc, /hotfix, /sync, /onboard)
  const allWorkflows = [...CORE_AGENTS, ...UTILITY_WORKFLOWS];
  for (const wf of allWorkflows) {
    const localizedPrompt = localizePromptPaths(wf.systemPrompt, platform);
    const cmdContent = `${localizedPrompt}

---
## Current User Request:
$ARGUMENTS
`;
    await fs.writeFile(
      path.join(claudeCommandsDir, `${wf.slug}.md`),
      cmdContent,
      'utf-8'
    );
  }

  // 3. Root CLAUDE.md
  const claudeMd = `# CLAUDE.md - Multi-Agent System & Context Engineering Guide

This project is powered by a **5-Agent + Master Orchestrator** architecture with 3-tier memory stored inside \`${wsRel}/\`.

## 1. 3-Tier Memory Architecture (\`${wsRel}/\`)
- \`${wsRel}/PROJECT_MEMORY.md\`: Concise (< 300 lines) global map of the project. Always read this file first!
- \`${wsRel}/active/\`: Temporary scratchpad for the single feature currently in progress (\`spec.md\`, \`ui-spec.md\`, \`plan.md\`, \`review-report.md\`).
- \`${wsRel}/features/\`: Permanent knowledge vault storing detailed specs per completed feature.
- \`${wsRel}/CHANGELOG_DOC.md\`: Living system documentation & release log formatted for Word/PDF export.
- \`${wsRel}/sync-state.json\`: Tracks \`lastSyncedCommit\` to synchronize manual Git commits.

## 2. Claude Code Slash Commands
- \`/auto <feature request>\`: **Full Auto-Pilot (A -> Z)** orchestrating isolated subagents sequentially (\`ba-agent\` -> \`architect-agent\` -> \`dev-agent\` -> \`qa-agent\` -> \`doc-agent\`).
- \`/ba <request>\`: Run Phase 1 (Business & UI Specification -> \`active/spec.md\`, \`active/ui-spec.md\`).
- \`/arch\`: Run Phase 2 (System Architecture & Atomic Task Plan -> \`active/plan.md\`).
- \`/dev [task-number]\`: Run Phase 3 (Execute task from \`active/plan.md\` with Tech Skills in \`${skillsRel}/\`).
- \`/qa\`: Run Phase 4 (Audit code & write tests -> \`active/review-report.md\`).
- \`/doc\`: Run Phase 5 (Archive to \`features/\`, update \`PROJECT_MEMORY.md\`, record Git commit & clean \`active/\`).
- \`/hotfix <bug description>\`: Fast-Track mode to fix a small bug directly.
- \`/sync\`: Synchronize manual Git commits from \`lastSyncedCommit..HEAD\`.
- \`/onboard\`: Populate \`PROJECT_MEMORY.md\` from \`${wsRel}/scan-report.md\` for existing codebases.

## 3. Installed Tech Skills for Dev & QA Agents
${installedSkills.length > 0 ? installedSkills.map((s) => `- \`${skillsRel}/${s}/SKILL.md\``).join('\n') : '- *(No custom Tech Skill installed)*'}
`;
  await fs.writeFile(path.join(cwd, 'CLAUDE.md'), claudeMd, 'utf-8');

  await writePlatformSkills(cwd, platform, installedSkills);
}

async function generateAntigravityAndCodexAdapter(
  cwd: string,
  platform: AIPlatform,
  installedSkills: TechSkillId[]
): Promise<void> {
  const wsRel = getWorkspaceRelDir(platform);
  const skillsRel = getSkillsRelDir(platform);
  const skillsDir = path.join(cwd, skillsRel);
  const rulesDir = path.join(cwd, '.agents', 'rules');
  await fs.ensureDir(skillsDir);
  await fs.ensureDir(rulesDir);

  // 1. Modern Antigravity & Codex Skills (.agents/skills/<slug>/SKILL.md)
  // In Antigravity 2.0, skills provide both first-class slash commands (/auto, /ba, /arch...) and semantic discovery
  const allWorkflows = [...CORE_AGENTS, ...UTILITY_WORKFLOWS];
  for (const wf of allWorkflows) {
    const localizedPrompt = localizePromptPaths(wf.systemPrompt, platform);
    const agentSkillDir = path.join(skillsDir, wf.slug);
    await fs.ensureDir(agentSkillDir);
    const skillContent = `---
name: ${wf.slug}
description: ${wf.name} — ${wf.roleDescription}
---

${localizedPrompt}
`;
    await fs.writeFile(
      path.join(agentSkillDir, 'SKILL.md'),
      skillContent,
      'utf-8'
    );
  }

  // 2. Installed Pluggable Tech Skills (.agents/skills/<tech>-skill/SKILL.md)
  await writePlatformSkills(cwd, platform, installedSkills);

  // 3. Workspace Rule (.agents/rules/00-workspace-core.md) & Root AGENTS.md
  const agentsMd = `# AGENTS.md - Multi-Agent System & Context Engineering

This project uses a **5-Agent + Master Orchestrator** workflow backed by a 3-tier memory architecture in \`${wsRel}/\`.

## 1. Workspace Memory Structure (\`${wsRel}/\`)
- \`${wsRel}/PROJECT_MEMORY.md\`: Global project map (< 300 lines). Always read this first.
- \`${wsRel}/active/\`: Active feature scratchpad (\`spec.md\`, \`ui-spec.md\`, \`plan.md\`, \`review-report.md\`).
- \`${wsRel}/features/\`: Long-term feature specification vault.
- \`${wsRel}/CHANGELOG_DOC.md\`: Living documentation & changelog for Word/PDF export.
- \`${wsRel}/sync-state.json\`: Tracks \`lastSyncedCommit\` for Git synchronization.

## 2. Agent Skills & Slash Commands (\`.agents/skills/\`)
- \`/auto\`: Full Auto-Pilot (A -> Z) running BA -> Architect -> Dev -> QA -> Doc.
- \`/ba\`: Business & UI Specification (\`active/spec.md\`, \`active/ui-spec.md\`).
- \`/arch\`: Technical Architecture & Atomic Task Plan (\`active/plan.md\`).
- \`/dev\`: Execute atomic tasks from \`active/plan.md\` with Tech Skills in \`${skillsRel}/\`.
- \`/qa\`: Quality Assurance Audit & Unit Tests (\`active/review-report.md\`).
- \`/doc\`: Archive feature to \`features/\`, update \`PROJECT_MEMORY.md\`, \`CHANGELOG_DOC.md\`, \`lastSyncedCommit\`, and clean \`active/\`.
- \`/hotfix\`: Fast-Track mode for small bugfixes.
- \`/sync\`: Synchronize manual Git commits from \`lastSyncedCommit..HEAD\`.
- \`/onboard\`: Initialize \`PROJECT_MEMORY.md\` from \`${wsRel}/scan-report.md\`.

## 3. Installed Tech Skills
${installedSkills.length > 0 ? installedSkills.map((s) => `- \`${skillsRel}/${s}-skill/SKILL.md\``).join('\n') : '- *(No custom Tech Skill installed)*'}
`;
  await fs.writeFile(
    path.join(rulesDir, '00-workspace-core.md'),
    agentsMd,
    'utf-8'
  );
  await fs.writeFile(path.join(cwd, 'AGENTS.md'), agentsMd, 'utf-8');
}

export async function applyPlatformAdapters(
  cwd: string,
  platforms: AIPlatform[],
  installedSkills: TechSkillId[]
): Promise<void> {
  if (platforms.includes('cursor')) {
    await generateCursorAdapter(cwd, installedSkills);
  }
  if (platforms.includes('claude')) {
    await generateClaudeAdapter(cwd, installedSkills);
  }
  if (platforms.includes('antigravity') || platforms.includes('codex')) {
    const p: AIPlatform = platforms.includes('antigravity')
      ? 'antigravity'
      : 'codex';
    await generateAntigravityAndCodexAdapter(cwd, p, installedSkills);
  }
}
