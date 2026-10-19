import pc from 'picocolors';
import fs from 'fs-extra';
import path from 'path';

export async function runHotfixCommand(
  descriptionParts: string[] = [],
  cwd: string = process.cwd()
): Promise<void> {
  const desc = descriptionParts.join(' ').trim();
  const activeDir = path.join(cwd, '.ai-workspace', 'active');
  await fs.ensureDir(activeDir);

  if (desc) {
    const hotfixFile = path.join(activeDir, 'hotfix.md');
    const content = `# FAST-TRACK HOTFIX TICKET

- **Created At:** ${new Date().toISOString()}
- **Issue / Bug Description:**
  ${desc}

## Execution Instructions for AI Agent (\`@hotfix\` / \`/hotfix\`):
1. Read \`.ai-workspace/PROJECT_MEMORY.md\` and load the relevant Tech Skill.
2. Fix the issue described above directly without generating \`spec.md\` or \`plan.md\`.
3. If the fix modifies business logic or introduces a reusable helper, briefly update \`features/*.md\` and \`CHANGELOG_DOC.md\`, then remove this \`active/hotfix.md\` file.
`;
    await fs.writeFile(hotfixFile, content, 'utf-8');
    console.log(
      pc.green(
        `✔ Created fast-track hotfix ticket at ${pc.underline('.ai-workspace/active/hotfix.md')}`
      )
    );
  }

  console.log(
    [
      '',
      pc.bgYellow(pc.black(' ⚡ FAST-TRACK HOTFIX MODE ')),
      `  • ${pc.bold('In Cursor IDE:')} Select code lines (${pc.cyan('Ctrl + L')}) -> Type ${pc.green('@hotfix <bug description>')}`,
      `  • ${pc.bold('In Claude Code / Antigravity:')} Type ${pc.green('/hotfix @file-path line X: <bug description>')}`,
      '',
    ].join('\n')
  );
}
