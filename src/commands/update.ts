import pc from 'picocolors';
import fs from 'fs-extra';
import path from 'path';
import { WorkspaceConfig } from '../types';
import { applyPlatformAdapters } from '../utils/platform-adapter';

export async function runUpdateCommand(cwd: string = process.cwd()): Promise<void> {
  const configPath = path.join(cwd, '.ai-workspace', 'config.json');
  if (!(await fs.pathExists(configPath))) {
    console.log(
      pc.red(
        '❌ Missing `.ai-workspace/config.json`. Please run `npx penta-agent-x init` first!'
      )
    );
    process.exit(1);
  }

  const config: WorkspaceConfig = await fs.readJson(configPath);
  await applyPlatformAdapters(
    cwd,
    config.platforms || ['cursor', 'claude'],
    config.installedTechSkills || []
  );

  config.updatedAt = new Date().toISOString();
  await fs.writeJson(configPath, config, { spaces: 2 });

  console.log(
    pc.green(
      `✅ Updated all 5 Agents, Master Orchestrator (@auto), and Tech Skills (${config.installedTechSkills.join(', ') || 'Core'}) to the latest version!`
    )
  );
}
