import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'fs-extra';
import path from 'path';
import { TechSkillId, WorkspaceConfig } from '../types';
import { AVAILABLE_TECH_SKILLS, TECH_SKILLS_REGISTRY } from '../templates/skills';
import { applyPlatformAdapters } from '../utils/platform-adapter';
import { resolveExistingWorkspace } from '../utils/workspace-paths';

export async function runAddSkillCommand(
  skillArgs: string[] = [],
  cwd: string = process.cwd()
): Promise<void> {
  const resolved = await resolveExistingWorkspace(cwd);
  if (!resolved.exists) {
    console.log(
      pc.red(
        '❌ Workspace not initialized (`config.json` missing). Please run `npx penta-agent-x init` first!'
      )
    );
    process.exit(1);
  }

  const config: WorkspaceConfig = await fs.readJson(resolved.configPath);
  const currentSkills = new Set<TechSkillId>(config.installedTechSkills || []);

  if (skillArgs.length > 0) {
    for (const arg of skillArgs) {
      const normalized = arg.toLowerCase().trim() as TechSkillId;
      if (TECH_SKILLS_REGISTRY[normalized]) {
        currentSkills.add(normalized);
        console.log(
          pc.green(`✔ Added Tech Skill: ${TECH_SKILLS_REGISTRY[normalized].name}`)
        );
      } else {
        console.log(
          pc.yellow(
            `⚠️ Unknown skill "${arg}". Available skills: ${AVAILABLE_TECH_SKILLS.map((s) => s.id).join(', ')}`
          )
        );
      }
    }
  } else {
    p.intro(pc.bgCyan(pc.black(' 🧩 MANAGE PLUGGABLE TECH SKILLS FOR DEV AGENT ')));

    const picked = (await p.multiselect({
      message: 'Select Tech Skills (Space to toggle, Enter to save)',
      options: AVAILABLE_TECH_SKILLS.map((sk) => ({
        value: sk.id,
        label: sk.name,
        hint: sk.category,
      })),
      required: false,
      initialValues: Array.from(currentSkills),
    })) as TechSkillId[];

    if (p.isCancel(picked)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    currentSkills.clear();
    for (const sId of picked) {
      currentSkills.add(sId);
    }
  }

  const updatedSkills = Array.from(currentSkills);
  config.installedTechSkills = updatedSkills;
  config.updatedAt = new Date().toISOString();
  await fs.writeJson(resolved.configPath, config, { spaces: 2 });

  await applyPlatformAdapters(cwd, config.platforms, updatedSkills);

  const memoryPath = path.join(resolved.workspaceAbsDir, 'PROJECT_MEMORY.md');
  if (await fs.pathExists(memoryPath)) {
    let mem = await fs.readFile(memoryPath, 'utf-8');
    const skillLine = `- **Active Tech Skills for Dev/QA Agent:** ${
      updatedSkills.length > 0
        ? updatedSkills.map((s) => `\`${s}\``).join(', ')
        : '*(No custom Tech Skill installed)*'
    }`;
    mem = mem.replace(
      /- \*\*Active Tech Skills for Dev\/QA Agent:\*\* .*/,
      skillLine
    );
    await fs.writeFile(memoryPath, mem, 'utf-8');
  }

  console.log(
    pc.green(
      `\n✅ Updated installed Tech Skills: ${pc.bold(updatedSkills.join(', ') || '(None)')}`
    )
  );
}
