import * as p from '@clack/prompts';
import pc from 'picocolors';
import { scanProjectStructure } from '../utils/tree-scanner';

export async function runScanCommand(cwd: string = process.cwd()): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' 🔍 PROJECT DIRECTORY & STACK SCANNER ')));
  const s = p.spinner();
  s.start('Scanning directory tree, dependencies, and shared modules...');
  const res = await scanProjectStructure(cwd);
  s.stop(pc.green('Project scan complete!'));

  p.note(
    [
      `• Detected Stack: ${
        res.detectedStacks.length > 0
          ? pc.green(res.detectedStacks.join(', '))
          : pc.yellow('Custom')
      }`,
      `• Report saved to: ${pc.underline('.ai-workspace/scan-report.md')}`,
      '',
      `👉 Type ${pc.bold(pc.green('@onboard'))} (or ${pc.bold(pc.green('/onboard'))}) in your IDE/CLI chat`,
      `   so the Architect Agent updates ${pc.cyan('.ai-workspace/PROJECT_MEMORY.md')}!`,
    ].join('\n'),
    '📄 Scan Summary'
  );
}
