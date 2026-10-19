import * as p from '@clack/prompts';
import pc from 'picocolors';
import { scanProjectStructure } from '../utils/tree-scanner';
import { resolveExistingWorkspace } from '../utils/workspace-paths';

export async function runScanCommand(cwd: string = process.cwd()): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' 🔍 PROJECT DIRECTORY, SUB-APP & FEATURE SCANNER ')));
  const resolved = await resolveExistingWorkspace(cwd);
  const s = p.spinner();
  s.start('Scanning directory tree, sub-apps, dependencies, and existing features...');
  const res = await scanProjectStructure(cwd, resolved.workspaceRelDir);
  s.stop(pc.green('Project scan complete!'));

  const topologyLabel = res.isMultiApp
    ? `Multi-App (${res.subApps.map((a) => a.name).join(', ')})`
    : 'Single-App';

  p.note(
    [
      `• Project Topology: ${pc.cyan(topologyLabel)}`,
      `• Detected Stack:   ${
        res.detectedStacks.length > 0
          ? pc.green(res.detectedStacks.join(', '))
          : pc.yellow('Custom')
      }`,
      `• Features Found:   ${pc.magenta(`${res.totalFeaturesCount} feature candidate(s)`)}`,
      `• Report saved to:  ${pc.underline(`${resolved.workspaceRelDir}/scan-report.md`)}`,
      '',
      `👉 Type ${pc.bold(pc.green('@onboard'))} (or ${pc.bold(pc.green('/onboard'))}) in your IDE/CLI chat`,
      `   so the Agent updates ${pc.cyan(`${resolved.workspaceRelDir}/PROJECT_MEMORY.md`)} AND creates feature flow files in ${pc.cyan(`${resolved.workspaceRelDir}/features/`)}!`,
    ].join('\n'),
    '📄 Scan Summary'
  );
}
