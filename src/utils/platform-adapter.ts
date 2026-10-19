import fs from 'fs-extra';
import path from 'path';
import { AIPlatform, TechSkillId } from '../types';
import { CORE_AGENTS, UTILITY_WORKFLOWS, AgentTemplate } from '../templates/agents';
import { TECH_SKILLS_REGISTRY } from '../templates/tech-skills';

export async function generateCanonicalAgentsAndSkills(
  cwd: string,
  installedSkills: TechSkillId[]
): Promise<void> {
  const agentsDir = path.join(cwd, '.agents');
  await fs.ensureDir(path.join(agentsDir, 'core-agents'));
  await fs.ensureDir(path.join(agentsDir, 'tech-skills'));

  const allAgents = [...CORE_AGENTS, ...UTILITY_WORKFLOWS];
  for (const agent of allAgents) {
    const filePath = path.join(agentsDir, 'core-agents', `${agent.id}.md`);
    await fs.writeFile(filePath, agent.systemPrompt, 'utf-8');
  }

  for (const skillId of installedSkills) {
    const skill = TECH_SKILLS_REGISTRY[skillId];
    if (!skill) continue;
    const skillDir = path.join(agentsDir, 'tech-skills', skill.id);
    await fs.ensureDir(skillDir);
    const frontmatter = `---\nname: ${skill.id}-skill\ndescription: ${skill.description}\n---\n\n`;
    await fs.writeFile(
      path.join(skillDir, 'SKILL.md'),
      frontmatter + skill.content,
      'utf-8'
    );
  }
}

async function generateCursorAdapter(
  cwd: string,
  installedSkills: TechSkillId[]
): Promise<void> {
  const rulesDir = path.join(cwd, '.cursor', 'rules');
  await fs.ensureDir(rulesDir);

  // 1. Always-applied core workspace rule
  const coreMdc = `---
description: Core Multi-Agent Workspace Architecture & Commands (@auto, @ba, @arch, @dev, @qa, @doc, @hotfix, @sync, @onboard)
alwaysApply: true
---

# MULTI-AGENT SYSTEM & CONTEXT ENGINEERING (.ai-workspace)

This project uses **Multi-Agent Context Isolation** powered by \`.ai-workspace/\` and \`.agents/\`.

## Single Source of Truth
- Always read \`.ai-workspace/PROJECT_MEMORY.md\` first before planning or writing code.
- Detailed feature specifications are archived in \`.ai-workspace/features/<feature-name>.md\`.
- Temporary scratchpad files for the active feature in progress live in \`.ai-workspace/active/\`.

## Available Agent Mentions (Type \`@<command>\` in Cursor Chat)
- \`@auto\`: **End-to-End Auto-Pilot (A -> Z)** running BA -> Architect -> Dev -> QA -> Doc automatically.
- \`@ba\`: **BA / Product Agent** — Analyzes requirements & UI mockups -> outputs \`active/spec.md\` & \`active/ui-spec.md\`.
- \`@arch\`: **Architect / Tech Lead Agent** — Designs technical architecture & atomic tasks -> outputs \`active/plan.md\`.
- \`@dev\`: **Dev Agent** — Executes atomic tasks from \`active/plan.md\` using installed Tech Skills.
- \`@qa\`: **QA / Reviewer Agent** — Audits code changes against Spec & Plan and writes tests -> outputs \`active/review-report.md\`.
- \`@doc\`: **Doc / Memory Keeper Agent** — Compacts completed context into \`features/\`, updates \`PROJECT_MEMORY.md\`, \`CHANGELOG_DOC.md\`, updates \`lastSyncedCommit\`, and cleans \`active/\`.
- \`@hotfix\`: **Fast-Track Hotfix Mode** — Rapidly fixes a small bug at the selected code lines without full 5-step ceremony.
- \`@sync\`: **Git Commit Checkpoint Sync** — Synchronizes manual Git commits from \`lastSyncedCommit..HEAD\`.
- \`@onboard\`: **Project Onboarding** — Reads \`.ai-workspace/scan-report.md\` to initialize \`PROJECT_MEMORY.md\` for existing codebases.
`;
  await fs.writeFile(path.join(rulesDir, '00-workspace-core.mdc'), coreMdc, 'utf-8');

  // 2. Individual @agent rules for Cursor
  const allAgents: AgentTemplate[] = [...CORE_AGENTS, ...UTILITY_WORKFLOWS];
  for (const agent of allAgents) {
    const mdcContent = `---
description: ${agent.name} - ${agent.roleDescription}
alwaysApply: false
---

${agent.systemPrompt}
`;
    await fs.writeFile(path.join(rulesDir, `${agent.slug}.mdc`), mdcContent, 'utf-8');
  }

  // 3. Tech Skill rules with auto-matching globs for Cursor
  for (const skillId of installedSkills) {
    const skill = TECH_SKILLS_REGISTRY[skillId];
    if (!skill) continue;
    const globsStr = skill.globs.join(', ');
    const skillMdc = `---
description: Tech Skill (${skill.name}) - ${skill.description}
globs: ${globsStr}
alwaysApply: false
---

${skill.content}
`;
    await fs.writeFile(
      path.join(rulesDir, `tech-${skill.id}.mdc`),
      skillMdc,
      'utf-8'
    );
  }
}

async function generateClaudeAdapter(
  cwd: string,
  installedSkills: TechSkillId[]
): Promise<void> {
  const claudeAgentsDir = path.join(cwd, '.claude', 'agents');
  const claudeCommandsDir = path.join(cwd, '.claude', 'commands');
  await fs.ensureDir(claudeAgentsDir);
  await fs.ensureDir(claudeCommandsDir);

  // 1. Native Subagents in .claude/agents/ (Isolated context windows in Claude Code)
  const roleAgents = CORE_AGENTS.filter((a) => a.slug !== 'auto');
  for (const agent of roleAgents) {
    const subagentFile = `---
name: ${agent.slug}-agent
description: ${agent.roleDescription}
---

${agent.systemPrompt}
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
    const cmdContent = `${wf.systemPrompt}

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

This project is powered by a **5-Agent + Master Orchestrator** architecture with 3-tier memory stored in \`.ai-workspace/\`.

## 1. 3-Tier Memory Architecture (\`.ai-workspace/\`)
- \`.ai-workspace/PROJECT_MEMORY.md\`: Concise (< 300 lines) global map of the project. Always read this file first!
- \`.ai-workspace/active/\`: Temporary scratchpad for the single feature currently in progress (\`spec.md\`, \`ui-spec.md\`, \`plan.md\`, \`review-report.md\`).
- \`.ai-workspace/features/\`: Permanent knowledge vault storing detailed specs per completed feature.
- \`.ai-workspace/CHANGELOG_DOC.md\`: Living system documentation & release log formatted for Word/PDF export.
- \`.ai-workspace/sync-state.json\`: Tracks \`lastSyncedCommit\` to synchronize manual Git commits.

## 2. Claude Code Slash Commands
- \`/auto <feature request>\`: **Full Auto-Pilot (A -> Z)** orchestrating isolated subagents sequentially (\`ba-agent\` -> \`architect-agent\` -> \`dev-agent\` -> \`qa-agent\` -> \`doc-agent\`).
- \`/ba <request>\`: Run Phase 1 (Business & UI Specification -> \`active/spec.md\`, \`active/ui-spec.md\`).
- \`/arch\`: Run Phase 2 (System Architecture & Atomic Task Plan -> \`active/plan.md\`).
- \`/dev [task-number]\`: Run Phase 3 (Execute task from \`active/plan.md\` with Tech Skills in \`.agents/tech-skills/\`).
- \`/qa\`: Run Phase 4 (Audit code & write tests -> \`active/review-report.md\`).
- \`/doc\`: Run Phase 5 (Archive to \`features/\`, update \`PROJECT_MEMORY.md\`, record Git commit & clean \`active/\`).
- \`/hotfix <bug description>\`: Fast-Track mode to fix a small bug directly.
- \`/sync\`: Synchronize manual Git commits from \`lastSyncedCommit..HEAD\`.
- \`/onboard\`: Populate \`PROJECT_MEMORY.md\` from \`.ai-workspace/scan-report.md\` for existing codebases.

## 3. Installed Tech Skills for Dev & QA Agents
${installedSkills.length > 0 ? installedSkills.map((s) => `- \`.agents/tech-skills/${s}/SKILL.md\``).join('\n') : '- *(No custom Tech Skill installed)*'}
`;
  await fs.writeFile(path.join(cwd, 'CLAUDE.md'), claudeMd, 'utf-8');
}

async function generateAntigravityAndCodexAdapter(
  cwd: string,
  platforms: AIPlatform[],
  installedSkills: TechSkillId[]
): Promise<void> {
  const includeAntigravity = platforms.includes('antigravity');
  const includeCodex = platforms.includes('codex');

  if (includeAntigravity || includeCodex) {
    const workflowsDir = path.join(cwd, '.agents', 'workflows');
    const skillsDir = path.join(cwd, '.agents', 'skills');
    await fs.ensureDir(workflowsDir);
    await fs.ensureDir(skillsDir);

    const allWorkflows = [...CORE_AGENTS, ...UTILITY_WORKFLOWS];
    for (const wf of allWorkflows) {
      const wfContent = `---
description: ${wf.name} - ${wf.roleDescription}
---

${wf.systemPrompt}
`;
      await fs.writeFile(
        path.join(workflowsDir, `${wf.slug}.md`),
        wfContent,
        'utf-8'
      );
    }

    for (const skillId of installedSkills) {
      const skill = TECH_SKILLS_REGISTRY[skillId];
      if (!skill) continue;
      const sDir = path.join(skillsDir, `${skill.id}-skill`);
      await fs.ensureDir(sDir);
      const sContent = `---
name: ${skill.id}-skill
description: ${skill.description}
---

${skill.content}
`;
      await fs.writeFile(path.join(sDir, 'SKILL.md'), sContent, 'utf-8');
    }
  }

  if (includeCodex || includeAntigravity) {
    const agentsMd = `# AGENTS.md - Multi-Agent System & Context Engineering

This project uses a **5-Agent + Master Orchestrator** workflow backed by a 3-tier memory architecture in \`.ai-workspace/\`.

## 1. Workspace Memory Structure (\`.ai-workspace/\`)
- \`.ai-workspace/PROJECT_MEMORY.md\`: Global project map (< 300 lines). Always read this first.
- \`.ai-workspace/active/\`: Active feature scratchpad (\`spec.md\`, \`ui-spec.md\`, \`plan.md\`, \`review-report.md\`).
- \`.ai-workspace/features/\`: Long-term feature specification vault.
- \`.ai-workspace/CHANGELOG_DOC.md\`: Living documentation & changelog for Word/PDF export.
- \`.ai-workspace/sync-state.json\`: Tracks \`lastSyncedCommit\` for Git synchronization.

## 2. Workflows & Slash Commands (\`.agents/workflows/\`)
- \`/auto\` (or \`@auto\`): Full Auto-Pilot (A -> Z) running BA -> Architect -> Dev -> QA -> Doc.
- \`/ba\`: Business & UI Specification (\`active/spec.md\`, \`active/ui-spec.md\`).
- \`/arch\`: Technical Architecture & Atomic Task Plan (\`active/plan.md\`).
- \`/dev\`: Execute atomic tasks from \`active/plan.md\` with Tech Skills in \`.agents/skills/\`.
- \`/qa\`: Quality Assurance Audit & Unit Tests (\`active/review-report.md\`).
- \`/doc\`: Archive feature to \`features/\`, update \`PROJECT_MEMORY.md\`, \`CHANGELOG_DOC.md\`, \`lastSyncedCommit\`, and clean \`active/\`.
- \`/hotfix\`: Fast-Track mode for small bugfixes.
- \`/sync\`: Synchronize manual Git commits from \`lastSyncedCommit..HEAD\`.
- \`/onboard\`: Initialize \`PROJECT_MEMORY.md\` from \`.ai-workspace/scan-report.md\`.

## 3. Installed Tech Skills
${installedSkills.length > 0 ? installedSkills.map((s) => `- \`.agents/skills/${s}-skill/SKILL.md\``).join('\n') : '- *(No custom Tech Skill installed)*'}
`;
    await fs.writeFile(path.join(cwd, 'AGENTS.md'), agentsMd, 'utf-8');
  }
}

export async function applyPlatformAdapters(
  cwd: string,
  platforms: AIPlatform[],
  installedSkills: TechSkillId[]
): Promise<void> {
  await generateCanonicalAgentsAndSkills(cwd, installedSkills);

  if (platforms.includes('cursor')) {
    await generateCursorAdapter(cwd, installedSkills);
  }
  if (platforms.includes('claude')) {
    await generateClaudeAdapter(cwd, installedSkills);
  }
  if (platforms.includes('antigravity') || platforms.includes('codex')) {
    await generateAntigravityAndCodexAdapter(cwd, platforms, installedSkills);
  }
}
