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

function getCommandRouterTable(platform: AIPlatform): string {
  const getTargetFile = (slug: string) => {
    switch (platform) {
      case 'cursor':
        return `.cursor/commands/${slug}.md`;
      case 'claude':
        return `.claude/commands/${slug}.md`;
      case 'antigravity':
      case 'codex':
      default:
        return `.agents/skills/${slug}/SKILL.md`;
    }
  };

  const rows = [
    { trigger: '`/auto`, `@auto`, `$auto`', name: '**Master Orchestrator (A -> Z)**', slug: 'auto' },
    { trigger: '`/ba`, `@ba`, `$ba`', name: '**BA / Product Agent**', slug: 'ba' },
    { trigger: '`/arch`, `@arch`, `$arch`', name: '**Architect / Tech Lead Agent**', slug: 'arch' },
    { trigger: '`/dev`, `@dev`, `$dev`', name: '**Senior Dev Agent**', slug: 'dev' },
    { trigger: '`/qa`, `@qa`, `$qa`', name: '**QA / Code Reviewer Agent**', slug: 'qa' },
    { trigger: '`/doc`, `@doc`, `$doc`', name: '**Doc / Memory Keeper Agent**', slug: 'doc' },
    { trigger: '`/hotfix`, `@hotfix`, `$hotfix`', name: '**Fast-Track Hotfix Mode**', slug: 'hotfix' },
    { trigger: '`/sync`, `@sync`, `$sync`', name: '**Git Commit Checkpoint Sync**', slug: 'sync' },
    { trigger: '`/onboard`, `@onboard`, `$onboard`', name: '**Existing Project Onboarding**', slug: 'onboard' },
  ];

  const tableBody = rows
    .map((r) => `| ${r.trigger} | ${r.name} | \`${getTargetFile(r.slug)}\` |`)
    .join('\n');

  return `## Command & Trigger Router (Supports BOTH \`/command\`, \`$command\`, and \`@command\`)
Whenever the user's message starts with or contains any of the triggers below (whether invoked via Slash Command \`/command\`, Skill \`$command\`, or typed directly as plain text like \`@onboard\` or \`@auto\`), you **MUST immediately read the corresponding instruction file** and execute that exact workflow:

| User Trigger | Agent / Workflow Name | Instruction File to Read & Execute |
| :--- | :--- | :--- |
${tableBody}`;
}

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
  const skillsDir = path.join(cwd, '.cursor', 'skills');
  await fs.ensureDir(rulesDir);
  await fs.ensureDir(commandsDir);
  await fs.ensureDir(skillsDir);

  const allAgents: AgentTemplate[] = [...CORE_AGENTS, ...UTILITY_WORKFLOWS];

  // 1. Always-applied core workspace rule with explicit Command Router table
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

${getCommandRouterTable(platform)}
`;
  await fs.writeFile(path.join(rulesDir, '00-workspace-core.mdc'), coreMdc, 'utf-8');

  // 2. Individual @agent rules (.cursor/rules/*.mdc) AND /agent slash commands (.cursor/commands/*.md)
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

  // 3. Modern Cursor Agent Skills (.cursor/skills/<slug>/SKILL.md)
  for (const agent of allAgents) {
    const localizedPrompt = localizePromptPaths(agent.systemPrompt, platform);
    const agentSkillDir = path.join(skillsDir, agent.slug);
    await fs.ensureDir(agentSkillDir);
    const skillContent = `---
name: ${agent.slug}
description: "${agent.name} - ${agent.roleDescription}"
---

${localizedPrompt}
`;
    await fs.writeFile(
      path.join(agentSkillDir, 'SKILL.md'),
      skillContent,
      'utf-8'
    );
  }

  // 4. Tech Skill rules with auto-matching globs for Cursor
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
  const claudeSkillsDir = path.join(cwd, '.claude', 'skills');
  await fs.ensureDir(claudeAgentsDir);
  await fs.ensureDir(claudeCommandsDir);
  await fs.ensureDir(claudeSkillsDir);

  const allWorkflows = [...CORE_AGENTS, ...UTILITY_WORKFLOWS];

  // 1. Native Subagents in .claude/agents/ (Isolated context windows in Claude Code)
  const roleAgents = CORE_AGENTS.filter((a) => a.slug !== 'auto');
  for (const agent of roleAgents) {
    const localizedPrompt = localizePromptPaths(agent.systemPrompt, platform);
    const subagentFile = `---
name: ${agent.slug}-agent
description: "${agent.roleDescription}"
---

${localizedPrompt}
`;
    await fs.writeFile(
      path.join(claudeAgentsDir, `${agent.slug}-agent.md`),
      subagentFile,
      'utf-8'
    );
  }

  // 2. Modern Claude Skills in .claude/skills/<slug>/SKILL.md (First-class /<slug> slash commands in modern Claude Code)
  for (const wf of allWorkflows) {
    const localizedPrompt = localizePromptPaths(wf.systemPrompt, platform);
    const sDir = path.join(claudeSkillsDir, wf.slug);
    await fs.ensureDir(sDir);
    const skillContent = `---
name: ${wf.slug}
description: "${wf.name} - ${wf.roleDescription}"
argument-hint: "[request or task description]"
---

${localizedPrompt}

---
## Current User Request:
$ARGUMENTS
`;
    await fs.writeFile(path.join(sDir, 'SKILL.md'), skillContent, 'utf-8');
  }

  // 3. Slash commands in .claude/commands/ (/auto, /ba, /arch, /dev, /qa, /doc, /hotfix, /sync, /onboard)
  for (const wf of allWorkflows) {
    const localizedPrompt = localizePromptPaths(wf.systemPrompt, platform);
    const cmdContent = `---
name: ${wf.slug}
description: "${wf.name} - ${wf.roleDescription}"
argument-hint: "[request or task description]"
---

${localizedPrompt}

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

  // 4. Root CLAUDE.md
  const claudeMd = `# CLAUDE.md - Multi-Agent System & Context Engineering Guide

This project is powered by a **5-Agent + Master Orchestrator** architecture with 3-tier memory stored inside \`${wsRel}/\`.

## 1. 3-Tier Memory Architecture (\`${wsRel}/\`)
- \`${wsRel}/PROJECT_MEMORY.md\`: Concise (< 300 lines) global map of the project. Always read this file first!
- \`${wsRel}/active/\`: Temporary scratchpad for the single feature currently in progress (\`spec.md\`, \`ui-spec.md\`, \`plan.md\`, \`review-report.md\`).
- \`${wsRel}/features/\`: Permanent knowledge vault storing detailed specs per completed feature.
- \`${wsRel}/CHANGELOG_DOC.md\`: Living system documentation & release log formatted for Word/PDF export.
- \`${wsRel}/sync-state.json\`: Tracks \`lastSyncedCommit\` to synchronize manual Git commits.

${getCommandRouterTable(platform)}

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
description: "${wf.name} — ${wf.roleDescription}"
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

${getCommandRouterTable(platform)}

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
