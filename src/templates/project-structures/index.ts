import { nextjsStructure } from './nextjs';
import { reactjsStructure } from './reactjs';
import { nestjsStructure } from './nestjs';
import { elysiajsStructure } from './elysiajs';
import { reactNativeStructure } from './react-native';
import { flutterStructure } from './flutter';
import { noneStructure } from './none';

export const STRUCTURE_TEMPLATES: Record<string, string> = {
  nextjs: nextjsStructure,
  reactjs: reactjsStructure,
  nestjs: nestjsStructure,
  elysiajs: elysiajsStructure,
  'react-native': reactNativeStructure,
  flutter: flutterStructure,
  none: noneStructure,
};

export function generateInitialProjectMemory(options: {
  projectMode: 'new' | 'existing';
  category?: string;
  feStack?: string;
  beStack?: string;
  mobileStack?: string;
  installedSkills: string[];
}): string {
  const { projectMode, category, feStack, beStack, mobileStack, installedSkills } =
    options;

  let structureSection = '';
  const stacks: string[] = [];

  if (projectMode === 'existing') {
    structureSection = `> ⚠️ **Existing Project (Brownfield):** An automated structural snapshot has been saved to \`.ai-workspace/scan-report.md\`.
> Run \`@onboard\` (or \`/onboard\`) in your IDE/CLI chat so the **Architect Agent** can analyze \`scan-report.md\` and populate the exact directory tree here.`;
  } else {
    if (category === 'fe' && feStack && feStack !== 'none') {
      stacks.push(`Frontend: ${feStack}`);
      structureSection = STRUCTURE_TEMPLATES[feStack] || STRUCTURE_TEMPLATES.none;
    } else if (category === 'be' && beStack && beStack !== 'none') {
      stacks.push(`Backend: ${beStack}`);
      structureSection = STRUCTURE_TEMPLATES[beStack] || STRUCTURE_TEMPLATES.none;
    } else if (category === 'mobile' && mobileStack && mobileStack !== 'none') {
      stacks.push(`Mobile: ${mobileStack}`);
      structureSection =
        STRUCTURE_TEMPLATES[mobileStack] || STRUCTURE_TEMPLATES.none;
    } else if (category === 'fullstack') {
      if (feStack && feStack !== 'none') stacks.push(`Frontend: ${feStack}`);
      if (beStack && beStack !== 'none') stacks.push(`Backend: ${beStack}`);
      const feTree =
        feStack && feStack !== 'none'
          ? `#### 1. Frontend (\`apps/web\` or \`frontend/\`)\n${STRUCTURE_TEMPLATES[feStack] || ''}`
          : '';
      const beTree =
        beStack && beStack !== 'none'
          ? `#### 2. Backend (\`apps/api\` or \`backend/\`)\n${STRUCTURE_TEMPLATES[beStack] || ''}`
          : '';
      structureSection =
        [feTree, beTree].filter(Boolean).join('\n\n') || STRUCTURE_TEMPLATES.none;
    } else {
      structureSection = STRUCTURE_TEMPLATES.none;
    }
  }

  return `# PROJECT MEMORY (Single Source of Truth)

> **Rules for All AI Agents:**
> 1. Always read this file first to understand the project architecture, reusable shared components/utilities, and feature index.
> 2. Keep this file **concise (< 300 lines)**. Detailed feature specifications belong in \`.ai-workspace/features/<feature-name>.md\`.

---

## 1. Tech Stack & Coding Conventions
- **Project Mode:** ${projectMode === 'existing' ? 'Existing Project (Brownfield)' : `New Project (${category?.toUpperCase() || 'Custom'})`}
- **Primary Stack:** ${stacks.length > 0 ? stacks.join(' + ') : '(To be updated after onboarding or stack selection)'}
- **Active Tech Skills for Dev/QA Agent:** ${installedSkills.length > 0 ? installedSkills.map((s) => `\`${s}\``).join(', ') : '*(No custom Tech Skill installed)*'}
- **Core Conventions:**
  - Maximize reuse of existing Shared Components, Hooks, and Services listed in Section 3.
  - Do not introduce new top-level directories outside the Standard Directory Structure in Section 2 without Architect Agent approval.

---

## 2. Standard Project Directory Structure
${structureSection}

---

## 3. Shared Components, Hooks, Utils & Services Registry
*(Continuously updated by the Architect Agent and Doc Agent so the Dev Agent reuses existing code instead of duplicating it)*

- **Shared UI Components:** *(None recorded yet — or run \`@onboard\`)*
- **Custom Hooks / State Stores:** *(None recorded yet)*
- **Helpers / Utils / HTTP Client:** *(None recorded yet)*

---

## 4. Feature Index (Knowledge Vault Map)
*(When modifying or fixing an existing feature, BA and Architect Agents must read its corresponding file in \`.ai-workspace/features/\`)*

| Feature / Module Name | Status | Detailed Spec File | Key Source Files |
| :--- | :--- | :--- | :--- |
| *(No features recorded yet)* | — | — | — |
`;
}

export function generateInitialChangelogDoc(): string {
  const today = new Date().toISOString().split('T')[0];
  return `# LIVING SYSTEM SPECIFICATION & CHANGELOG DOCUMENTATION

> This file is automatically maintained by the **Doc / Memory Keeper Agent** after completing each feature, hotfix, or Git checkpoint sync (\`sync\`).
> Formatted for direct export to **Word / PDF / Notion / Wiki** for stakeholder handover and release notes.

---

## [${today}] - Initialized Multi-Agent Workspace
- **Action:** Initialized \`.ai-workspace/\` 3-tier memory architecture and 5 specialized AI Agents.
- **Status:** Ready to track upcoming features and architectural changes.
`;
}

export {
  nextjsStructure,
  reactjsStructure,
  nestjsStructure,
  elysiajsStructure,
  reactNativeStructure,
  flutterStructure,
  noneStructure,
};
