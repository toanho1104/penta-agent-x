import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'fs-extra';
import path from 'path';
import { TechSkillId, WorkspaceConfig } from '../types';
import { AVAILABLE_TECH_SKILLS, TECH_SKILLS_REGISTRY } from '../templates/skills';
import { applyPlatformAdapters } from '../utils/platform-adapter';

export async function runAddSkillCommand(
  skillArgs: string[] = [],
  cwd: string = process.cwd()
): Promise<void> {
  const configPath = path.join(cwd, '.ai-workspace', 'config.json');
  if (!(await fs.pathExists(configPath))) {
    console.log(
      pc.red(
        '❌ Workspace not initialized (`.ai-workspace/config.json` missing). Please run `npx ai-team init` first!'
      )
    );
    process.exit(1);
  }

  const config: WorkspaceConfig = await fs.readJson(configPath);
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

    let choosing = true;
    while (choosing) {
      const listStr =
        currentSkills.size > 0
          ? Array.from(currentSkills).join(', ')
          : 'None';

      const choice = (await p.select({
        message: `Toggle Tech Skills to install/remove [Active: ${pc.cyan(listStr)}]`,
        options: [
          ...AVAILABLE_TECH_SKILLS.map((sk) => {
            const installed = currentSkills.has(sk.id);
            return {
              value: sk.id,
              label: `${installed ? pc.green('✔ [Installed]') : '[ + ]'} ${sk.name} (${sk.id})`,
              hint: sk.description,
            };
          }),
          {
            value: '__DONE__',
            label: pc.bold(pc.green('✅ DONE - Save changes and update adapters')),
          },
        ],
      })) as string;

      if (p.isCancel(choice)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }

      if (choice === '__DONE__') {
        choosing = false;
      } else {
        const sId = choice as TechSkillId;
        if (currentSkills.has(sId)) {
          currentSkills.delete(sId);
        } else {
          currentSkills.add(sId);
        }
      }
    }
  }

  const updatedSkills = Array.from(currentSkills);
  config.installedTechSkills = updatedSkills;
  config.updatedAt = new Date().toISOString();
  await fs.writeJson(configPath, config, { spaces: 2 });

  await applyPlatformAdapters(cwd, config.platforms, updatedSkills);

  const memoryPath = path.join(cwd, '.ai-workspace', 'PROJECT_MEMORY.md');
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
