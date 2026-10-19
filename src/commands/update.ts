import pc from 'picocolors';
import fs from 'fs-extra';
import { WorkspaceConfig } from '../types';
import { applyPlatformAdapters } from '../utils/platform-adapter';
import { resolveExistingWorkspace } from '../utils/workspace-paths';

export async function runUpdateCommand(cwd: string = process.cwd()): Promise<void> {
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
  await applyPlatformAdapters(
    cwd,
    config.platforms || [resolved.platform],
    config.installedTechSkills || []
  );

  config.updatedAt = new Date().toISOString();
  await fs.writeJson(resolved.configPath, config, { spaces: 2 });

  console.log(
    pc.green(
      `✅ Updated all 5 Agents, Master Orchestrator (@auto), and Tech Skills (${config.installedTechSkills.join(', ') || 'Core'}) in ${resolved.workspaceRelDir}!`
    )
  );
}
