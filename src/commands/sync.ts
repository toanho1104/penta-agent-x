import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'fs-extra';
import path from 'path';
import {
  commitExists,
  getCommitLogBetween,
  getCurrentCommit,
  getDetailedDiff,
  getDiffStatBetween,
  getUncommittedStatus,
  hasUncommittedChanges,
  isGitRepo,
  readSyncState,
  writeSyncState,
} from '../utils/git';

export async function runSyncCommand(
  options: { markDone?: boolean } = {},
  cwd: string = process.cwd()
): Promise<void> {
  p.intro(
    pc.bgMagenta(
      pc.black(' 🔄 GIT COMMIT CHECKPOINT SYNC (MANUAL CODE SYNCHRONIZATION) ')
    )
  );

  if (!isGitRepo(cwd)) {
    p.cancel(
      'Current directory is not a Git repository (`git init`). `sync` requires Git history.'
    );
    process.exit(1);
  }

  const headCommit = getCurrentCommit(cwd);
  if (!headCommit) {
    p.cancel('No Git commits found in this repository yet.');
    process.exit(1);
  }

  if (options.markDone) {
    const now = new Date().toISOString();
    await writeSyncState(
      {
        lastSyncedCommit: headCommit,
        lastSyncedAt: now,
        note: 'Manually marked synced via CLI --mark-done',
      },
      cwd
    );
    const diffFile = path.join(cwd, '.ai-workspace', 'sync-diff.md');
    if (await fs.pathExists(diffFile)) {
      await fs.remove(diffFile);
    }
    p.outro(
      pc.green(
        `✅ Updated lastSyncedCommit to current HEAD (${headCommit.slice(0, 8)})!`
      )
    );
    return;
  }

  const syncState = await readSyncState(cwd);
  let fromRef = syncState.lastSyncedCommit;
  let includeWorkingTree = false;

  // Edge Case 1: Uncommitted working tree changes
  if (hasUncommittedChanges(cwd)) {
    const uncommittedList = getUncommittedStatus(cwd);
    p.note(
      uncommittedList,
      pc.yellow('⚠️ Uncommitted Working Tree Changes Detected')
    );

    const uncommittedChoice = await p.select({
      message: 'How would you like to handle uncommitted changes?',
      options: [
        {
          value: 'include',
          label: '1. Include uncommitted changes (Recommended)',
          hint: 'Committed + working tree',
        },
        {
          value: 'committed-only',
          label: '2. Sync committed changes only',
          hint: 'Ignore working tree',
        },
        {
          value: 'abort',
          label: '3. Abort (run git commit first)',
        },
      ],
    });

    if (p.isCancel(uncommittedChoice) || uncommittedChoice === 'abort') {
      p.cancel('Aborted. Please commit your changes first.');
      process.exit(0);
    }
    if (uncommittedChoice === 'include') {
      includeWorkingTree = true;
    }
  }

  // Edge Case 2: Missing lastSyncedCommit or commit rewritten by rebase/amend
  if (!fromRef || !commitExists(fromRef, cwd)) {
    const reason = !fromRef
      ? 'No previous `lastSyncedCommit` found in `.ai-workspace/sync-state.json`.'
      : `Previous checkpoint commit (${fromRef.slice(0, 8)}) no longer exists in Git history (likely due to rebase/reset/amend).`;

    p.log.warn(pc.yellow(reason));

    const fallbackChoice = (await p.select({
      message: 'Select a fallback commit range for the Doc Agent to synchronize:',
      options: [
        { value: 'HEAD~1', label: 'Last 1 commit (HEAD~1..HEAD)' },
        { value: 'HEAD~3', label: 'Last 3 commits (HEAD~3..HEAD)' },
        { value: 'HEAD~5', label: 'Last 5 commits (HEAD~5..HEAD)' },
        { value: 'HEAD~10', label: 'Last 10 commits (HEAD~10..HEAD)' },
      ],
    })) as string;

    if (p.isCancel(fallbackChoice)) {
      p.cancel('Sync cancelled.');
      process.exit(0);
    }
    fromRef = fallbackChoice;
  }

  if (fromRef === headCommit && !includeWorkingTree) {
    p.outro(
      pc.green(
        `✅ AI Workspace Memory is already up to date with HEAD (${headCommit.slice(0, 8)}). Nothing to sync!`
      )
    );
    return;
  }

  const s = p.spinner();
  s.start(`Extracting Git Diff from ${fromRef.slice(0, 8)} to HEAD...`);

  const commitLog = getCommitLogBetween(fromRef, 'HEAD', cwd);
  const diffStat = getDiffStatBetween(fromRef, 'HEAD', cwd);
  const detailedDiff = getDetailedDiff(fromRef, includeWorkingTree, cwd);
  const uncommittedSummary = includeWorkingTree ? getUncommittedStatus(cwd) : '';

  const syncReport = `# GIT COMMIT CHECKPOINT SYNC REPORT

> Generated automatically by \`npx penta-agent-x sync\`.
> Run \`@sync\` (in Cursor) or \`/sync\` (in Claude Code / Antigravity) so the **Doc / Memory Keeper Agent** reads this report and updates \`PROJECT_MEMORY.md\`, \`features/*.md\`, and \`CHANGELOG_DOC.md\`.

## 1. Checkpoint Metadata
- **Previous Synced Commit (\`lastSyncedCommit\`):** \`${fromRef}\`
- **Current Head Commit (\`HEAD\`):** \`${headCommit}\`
- **Includes Uncommitted Working Tree Changes:** ${includeWorkingTree ? 'Yes' : 'No'}

## 2. Commit Log (\`git log ${fromRef}..HEAD\`)
\`\`\`text
${commitLog || '(No new commits — working tree changes only)'}
\`\`\`

${
  includeWorkingTree && uncommittedSummary
    ? `## 3. Uncommitted Working Tree Files (\`git status\`)\n\`\`\`text\n${uncommittedSummary}\n\`\`\`\n`
    : ''
}
## 4. Diff Summary Statistics (\`git diff --stat\`)
\`\`\`text
${diffStat || '(See detailed diff below)'}
\`\`\`

## 5. Detailed Code Changes (\`git diff\`)
\`\`\`diff
${detailedDiff || '(No diff content)'}
\`\`\`

---
## Instructions for Doc / Memory Keeper Agent (\`@sync\` / \`/sync\`):
1. Analyze all code changes above.
2. Register any new Shared Components, Hooks, Utilities, or directory updates in \`.ai-workspace/PROJECT_MEMORY.md\`.
3. Create or update affected feature documentation in \`.ai-workspace/features/<feature-name>.md\`.
4. Append a summary entry to \`.ai-workspace/CHANGELOG_DOC.md\`.
5. Update \`"lastSyncedCommit": "${headCommit}"\` in \`.ai-workspace/sync-state.json\` and delete this temporary \`sync-diff.md\` file once complete!
`;

  const syncDiffPath = path.join(cwd, '.ai-workspace', 'sync-diff.md');
  await fs.ensureDir(path.dirname(syncDiffPath));
  await fs.writeFile(syncDiffPath, syncReport, 'utf-8');

  s.stop(pc.green('Git diff report generated successfully!'));

  p.note(
    [
      `📄 Diff report saved to: ${pc.underline('.ai-workspace/sync-diff.md')}`,
      `📌 Checkpoint range: ${pc.yellow(fromRef.slice(0, 8))} -> ${pc.green(headCommit.slice(0, 8))}`,
      '',
      `👉 ${pc.bold('Next Step:')} Open your IDE/CLI chat and type ${pc.bold(pc.green('@sync'))} (or ${pc.bold(pc.green('/sync'))})`,
      `   so the Doc Agent updates ${pc.cyan('PROJECT_MEMORY.md')}, ${pc.cyan('features/*.md')}, and saves the new commit checkpoint!`,
    ].join('\n'),
    '🚀 Ready to Synchronize AI Memory'
  );
}
